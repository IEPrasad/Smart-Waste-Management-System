import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all vehicles
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAllVehicles = async () => {
    try {
        const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*')
            .order('vehicle_no', { ascending: true });

        if (vehiclesError) throw vehiclesError;

        return { data: vehicles, error: null };
    } catch (error) {
        console.error('Error fetching vehicles:', error.message);
        return { data: [], error };
    }
};

/**
 * Fetch a single vehicle by ID
 * @param {string} vehicleId - The vehicle's ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getVehicleById = async (vehicleId) => {
    try {
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', vehicleId)
            .single();

        if (vehicleError) throw vehicleError;

        return { data: vehicle, error: null };
    } catch (error) {
        console.error('Error fetching vehicle:', error.message);
        return { data: null, error };
    }
};

/**
 * Get count of vehicles
 * @returns {Promise<{total: number}>}
 */
export const getVehicleCounts = async () => {
    try {
        const { count, error } = await supabase
            .from('vehicles')
            .select('id', { count: 'exact', head: true });

        if (error) throw error;

        return { total: count || 0 };
    } catch (error) {
        console.error('Error fetching vehicle counts:', error.message);
        return { total: 0 };
    }
};

/**
 * Update vehicle status
 * @param {string} vehicleId - The vehicle's ID
 * @param {string} newStatus - The new status value
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updateVehicleStatus = async (vehicleId, newStatus) => {
    try {
        const { error } = await supabase
            .from('vehicles')
            .update({ status: newStatus })
            .eq('id', vehicleId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating vehicle status:', error.message);
        return { success: false, error };
    }
};

/**
 * Delete a vehicle
 * @param {string} vehicleId - The vehicle's ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteVehicle = async (vehicleId) => {
    try {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', vehicleId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting vehicle:', error.message);
        return { success: false, error };
    }
};
