import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.8"; // Nodemailer import කරගන්නවා

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verify the caller is an authenticated user (Admin)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Initialize Service Role Client for Admin actions
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 3. Parse Request Body
        const { fullName, email, mobile, empNo, nic } = await req.json();

        if (!email || !fullName || !mobile || !empNo || !nic) {
            throw new Error("Missing required fields");
        }

        // 4. Generate a random secure password
        const generatePassword = () => {
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let password = "";
            for (let i = 0; i < 8; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };
        const password = generatePassword();

        // 5. Create a new user in Supabase Auth
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        });

        if (createUserError) throw createUserError;
        if (!newUser.user) throw new Error("Failed to create user in Auth");

        // 6. Insert a record into the driver table
        const { error: insertError } = await supabaseAdmin
            .from('driver')
            .insert([
                {
                    id: newUser.user.id,
                    full_name: fullName,
                    email: email,
                    mobile_number: mobile,
                    empno: empNo,
                    nic_number: nic,
                }
            ]);

        if (insertError) {
            // Rollback: Delete the auth user if the database insert fails
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            throw insertError;
        }

        // 7. Send user an email using Gmail SMTP (Nodemailer)
        const gmailUser = Deno.env.get('GMAIL_USER');
        const gmailPass = Deno.env.get('GMAIL_PASS');

        if (!gmailUser || !gmailPass) {
            console.warn("GMAIL credentials not set. Skipping email.");
        } else {
            // Create Transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: gmailUser,
                    pass: gmailPass, // මෙතනට එන්නේ App Password එක
                },
            });

            // Send Mail
            try {
                const info = await transporter.sendMail({
                    from: `"Waste Management" <${gmailUser}>`, // Sender address
                    to: email, // Receiver address
                    subject: "Your Driver Account Details", // Subject line
                    html: `
                      <h1>Welcome to Waste Management System</h1>
                      <p>Hello ${fullName},</p>
                      <p>Your driver account has been created successfully.</p>
                      <p><strong>Email:</strong> ${email}</p>
                      <p><strong>Temporary Password:</strong> ${password}</p>
                      <p>Please log in and change your password.</p>
                    `,
                });
                console.log("Email sent: " + info.messageId);
            } catch (emailError) {
                console.error("Failed to send email via Gmail:", emailError);
                // Database එකට data ගියා නම්, email එක ෆේල් වුනාට අපි error එකක් විසි නොකර සිටිමු (Optional)
                // නමුත් ඔබට අවශ්‍ය නම් මෙතනත් throw new Error(...) දාන්න පුළුවන්.
                throw new Error(`Failed to send email: ${emailError.message}`);
            }
        }

        return new Response(
            JSON.stringify({
                message: 'Driver created successfully',
                driverId: newUser.user.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (error) {
        console.error("Error creating driver:", error);
        let errorMessage = error.message;

        // Check for Postgres Unique Violation
        if (error.code === '23505') {
            if (error.message.includes('driver_nic_number_key')) {
                errorMessage = "A driver with this NIC number already exists.";
            } else if (error.message.includes('driver_email_key') || error.message.includes('email')) {
                errorMessage = "A driver with this email already exists.";
            } else {
                errorMessage = "A driver with this duplicate information already exists.";
            }
        }

        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});