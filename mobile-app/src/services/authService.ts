import { supabase } from '../../lib/supabase'; // ඔයාගේ supabase file එක තියෙන path එක හරියට බලන්න

// Register වෙන කෙනාගේ Data වල හැඩය (TypeScript Interface)
interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    nic: string;
    mobile: string;
    assessmentNumber: string;
    division: string;
    gnDivision: string;
    latitude: number | string;
    longitude: number | string;
}

export const registerCitizen = async (userData: RegisterData) => {
    try {
        console.log("Starting Registration Process for:", userData.email);

        // ---------------------------------------------------------
        // STEP 01: Supabase Auth ගිණුම සකස් කිරීම (Email/Password)
        // ---------------------------------------------------------
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                // වැදගත්: මේ user citizen කෙනෙක් බව හඳුනාගැනීමට
                data: { role: 'citizen' }
            }
        });

        if (authError) {
            throw authError;
        }

        if (!authData.user) {
            throw new Error("User creation failed. No User ID returned.");
        }

        const userId = authData.user.id;
        console.log("Auth User Created. ID:", userId);

        // ---------------------------------------------------------
        // STEP 02: Citizens Table එකට විස්තර ඇතුලත් කිරීම
        // ---------------------------------------------------------
        const { error: profileError } = await supabase
            .from('citizens')
            .insert([
                {
                    id: userId, // Auth ID එකම මෙතනට දානවා (Linking)
                    email: userData.email, // *** අලුතින් එකතු කළ කොටස ***
                    full_name: userData.fullName,
                    nic_number: userData.nic,
                    mobile_number: userData.mobile,
                    assessment_number: userData.assessmentNumber,
                    division: userData.division,
                    gn_division: userData.gnDivision,

                    // Latitude/Longitude අංක බවට පරිවර්තනය කිරීම (String ආවොත්)
                    latitude: parseFloat(userData.latitude.toString()),
                    longitude: parseFloat(userData.longitude.toString()),

                    account_status: 'pending' // Admin Approve කරනකම් Pending
                }
            ]);

        if (profileError) {
            console.error("Profile Insert Error:", profileError.message);
            // මෙතනදි Data වැටුනේ නැත්නම්, අපිට Auth User වත් අයින් කරන්න පුළුවන් (Optional)
            // නමුත් දැනට Error එක යවමු.
            throw new Error("Registration Data Error: " + profileError.message);
        }

        // ---------------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------------
        console.log("Registration Full Success!");
        return { success: true, data: authData };

    } catch (error: any) {
        console.error("Registration Failed:", error.message);
        return { success: false, error: error.message };
    }
};

export const citizenLogin = async (email: string, password: string) => {
    try {
        // 1. Supabase Auth එකෙන් Login වීම (Email/Password check)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Login failed");

        // 2. Citizens Table එකෙන් Status එක පරීක්ෂා කිරීම
        const { data: citizenData, error: citizenError } = await supabase
            .from('citizens')
            .select('account_status, full_name') // Status එකයි නමයි ගන්නවා
            .eq('id', authData.user.id)
            .single();

        if (citizenError) throw citizenError;

        // 3. ප්‍රතිඵලය යැවීම
        return {
            success: true,
            user: authData.user,
            status: citizenData.account_status, // pending / approved / rejected
            name: citizenData.full_name
        };

    } catch (error: any) {
        console.error("Login Error:", error.message);
        return { success: false, error: error.message };
    }
};

export const sendPasswordResetOtp = async (email: string) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Send OTP Error:", error.message);
        return { success: false, error: error.message };
    }
};

export const verifyPasswordResetOtp = async (email: string, token: string) => {
    try {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery',
        });
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Verify OTP Error:", error.message);
        return { success: false, error: error.message };
    }
};

export const updatePassword = async (newPassword: string) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Password Error:", error.message);
        return { success: false, error: error.message };
    }
};

export const checkEmailExists = async (email: string) => {
    try {
        // Call the secure RPC function to check email existence without hitting RLS blocks
        const { data, error } = await supabase.rpc('check_email_exists_in_tables', {
            lookup_email: email
        });

        if (error) throw error;

        return { exists: data };
    } catch (error: any) {
        console.error("Check Email Error:", error.message);
        return { exists: false, error: error.message };
    }
};