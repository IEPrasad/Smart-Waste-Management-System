import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all citizens filtered by account status
 * @param {string} status - 'approved' | 'pending' | 'rejected'
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getCitizensByStatus = async (status) => {
    try {
        const { data, error } = await supabase
            .from('citizens')
            .select('id, full_name, assessment_number, division, gn_division, account_status')
            .eq('account_status', status)
            .order('full_name', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching citizens:', error.message);
        return { data: [], error };
    }
};

/**
 * Get count of citizens for each status
 * @returns {Promise<{approved: number, pending: number, rejected: number}>}
 */
export const getCitizenCounts = async () => {
    try {
        const [approvedRes, pendingRes, rejectedRes] = await Promise.all([
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'approved'),
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'pending'),
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'rejected')
        ]);

        return {
            approved: approvedRes.count || 0,
            pending: pendingRes.count || 0,
            rejected: rejectedRes.count || 0
        };
    } catch (error) {
        console.error('Error fetching citizen counts:', error.message);
        return { approved: 0, pending: 0, rejected: 0 };
    }
};
