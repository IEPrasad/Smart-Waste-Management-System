import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all citizens filtered by account status
 * @param {string} status - 'approved' | 'pending' | 'rejected' | 'suspended'
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getCitizensByStatus = async (status) => {
    try {
        const { data, error } = await supabase
            .from('citizens')
            .select('id, full_name, nic_number, email, mobile_number, assessment_number, division, gn_division, account_status, status_reason, status_updated_at, created_at, avatar_url')
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
 * Fetch all approved citizens (for Total Citizens count)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAllCitizens = async () => {
    try {
        const { data, error } = await supabase
            .from('citizens')
            .select('id, full_name, nic_number, email, mobile_number, assessment_number, division, gn_division, account_status, status_reason, status_updated_at, created_at, avatar_url')
            .eq('account_status', 'approved')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching all citizens:', error.message);
        return { data: [], error };
    }
};

/**
 * Get count of citizens for each status
 * @returns {Promise<{total: number, pending: number, rejected: number, suspended: number}>}
 */
export const getCitizenCounts = async () => {
    try {
        const [approvedRes, pendingRes, rejectedRes, suspendedRes] = await Promise.all([
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'approved'),
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'pending'),
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'rejected'),
            supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('account_status', 'suspended')
        ]);

        return {
            total: approvedRes.count || 0,
            pending: pendingRes.count || 0,
            rejected: rejectedRes.count || 0,
            suspended: suspendedRes.count || 0
        };
    } catch (error) {
        console.error('Error fetching citizen counts:', error.message);
        return { total: 0, pending: 0, rejected: 0, suspended: 0 };
    }
};

/**
 * Suspend a citizen account
 * @param {string} citizenId - UUID of the citizen
 * @param {string} reason - Reason for suspension
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const suspendCitizen = async (citizenId, reason) => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            return { success: false, error: 'Unauthorized: No active session.' };
        }

        const adminId = session.user.id;
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('citizens')
            .update({
                account_status: 'suspended',
                status_reason: reason,
                status_updated_by: adminId,
                status_updated_at: now
            })
            .eq('id', citizenId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error suspending citizen:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Generic function to update a citizen's account status
 * @param {string} citizenId - UUID of the citizen
 * @param {string} status - New status ('approved', 'rejected', 'pending')
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const updateCitizenStatus = async (citizenId, status, reason = null) => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            return { success: false, error: 'Unauthorized: No active session.' };
        }

        const adminId = session.user.id;
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('citizens')
            .update({
                account_status: status,
                status_reason: reason, // Set reason if provided, empty if approval
                status_updated_by: adminId,
                status_updated_at: now
            })
            .eq('id', citizenId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error(`Error updating citizen status to ${status}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Approve a citizen request
 */
export const approveCitizen = async (citizenId) => updateCitizenStatus(citizenId, 'approved');

/**
 * Reject a citizen request
 */
export const rejectCitizen = async (citizenId, reason = null) => updateCitizenStatus(citizenId, 'rejected', reason);

/**
 * Remove suspension from a citizen
 */
export const removeSuspension = async (citizenId) => updateCitizenStatus(citizenId, 'approved');

/**
 * Delete a citizen
 * @param {string} citizenId - UUID of the citizen
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteCitizen = async (citizenId) => {
    try {
        const { error } = await supabase
            .from('citizens')
            .delete()
            .eq('id', citizenId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting citizen:', error.message);
        return { success: false, error: error.message };
    }
};
