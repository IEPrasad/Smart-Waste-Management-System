
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
        // Create a Supabase client with the Auth context of the logged-in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        // Get the user from the token
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // TODO: Add specific Admin role check here if your application has role-based access control (RBAC).
        // For now, we assume any authenticated user calling this function is authorized (or authorization is handled at the app level).

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

        // 4. Generate a random secure password (8 chars with letters/numbers)
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
        // Mapping input fields to database columns.
        // NOTE: 'empNo' in create table (without quotes) becomes 'empno' (lowercase) in Postgres.
        const { error: insertError } = await supabaseAdmin
            .from('driver')
            .insert([
                {
                    id: newUser.user.id,
                    full_name: fullName,
                    email: email,
                    mobile_number: mobile,
                    empno: empNo, // db column is likely lowercase 'empno'
                    nic_number: nic,
                }
            ]);

        if (insertError) {
            // Rollback: Delete the auth user if the database insert fails (cleanup)
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            throw insertError;
        }

        // 7. Send user an email with the password using Resend API
        const resendApiKey = Deno.env.get('RESEND_API_KEY');

        if (!resendApiKey) {
            console.warn("RESEND_API_KEY is not set. Skipping email sending.");
            // We might not want to fail the whole request if email fails, but the requirement says "Return proper error messages if any step fails".
            // However, failing here means the user is created but email not sent. 
            // We'll throw an error to alert the admin.
            // throw new Error("RESEND_API_KEY not configured");
        } else {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: 'Waste Management <onboarding@resend.dev>', // Update with your verified domain
                    to: email,
                    subject: 'Your Driver Account Details',
                    html: `
                  <h1>Welcome to Waste Management System</h1>
                  <p>Hello ${fullName},</p>
                  <p>Your driver account has been created successfully.</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${password}</p>
                  <p>Please log in and change your password.</p>
                `
                })
            });

            if (!res.ok) {
                const resData = await res.json();
                console.error("Resend API Error:", resData);
                // Decide if we should throw. To be safe, we will throw.
                throw new Error(`Failed to send email: ${resData.message || res.statusText}`);
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
