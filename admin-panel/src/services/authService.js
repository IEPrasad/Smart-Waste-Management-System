import { supabase } from '../lib/supabaseClient';

/**
 * Sign in an admin user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signInAdmin = async (email, password) => {
    try {
        // Attempt to sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Verify the user exists in the admin table
        const { data: adminData, error: adminError } = await supabase
            .from('admin')
            .select('id, email')
            .eq('id', data.user.id)
            .single();

        if (adminError || !adminData) {
            // Sign out if not an admin
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Unauthorized: Access restricted to system administrators.'
            };
        }

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                ...adminData
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOutAdmin = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get the current authenticated session
 * @returns {Promise<{session: object|null, error?: string}>}
 */
export const getCurrentSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            return { session: null, error: error.message };
        }
        return { session };
    } catch (error) {
        return { session: null, error: error.message };
    }
};

/**
 * Check if the current user is an authenticated admin
 * @returns {Promise<{isAdmin: boolean, user?: object, error?: string}>}
 */
export const checkAdminAuth = async () => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return { isAdmin: false };
        }

        // Verify user is in admin table
        const { data: adminData, error: adminError } = await supabase
            .from('admin')
            .select('id, email')
            .eq('id', session.user.id)
            .single();

        if (adminError || !adminData) {
            return { isAdmin: false };
        }

        return {
            isAdmin: true,
            user: {
                id: session.user.id,
                email: session.user.email,
                ...adminData
            }
        };
    } catch (error) {
        return { isAdmin: false, error: error.message };
    }
};

/**
 * Subscribe to auth state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
    return () => subscription.unsubscribe();
};
