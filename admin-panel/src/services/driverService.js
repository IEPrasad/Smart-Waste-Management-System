import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all drivers with their vehicle information
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAllDrivers = async () => {
    try {
        // First fetch all drivers
        const { data: drivers, error: driversError } = await supabase
            .from('driver')
            .select('*')
            .order('full_name', { ascending: true });

        if (driversError) throw driversError;

        // Get unique vehicle IDs that are not null
        const vehicleIds = drivers
            .map(d => d.current_vehicle_id)
            .filter(id => id !== null && id !== undefined);

        let vehicleMap = {};

        // Fetch vehicles if there are any vehicle IDs
        if (vehicleIds.length > 0) {
            const { data: vehicles, error: vehiclesError } = await supabase
                .from('vehicle')
                .select('id, vehicle_number')
                .in('id', vehicleIds);

            if (vehiclesError) {
                console.error('Error fetching vehicles:', vehiclesError.message);
            } else if (vehicles) {
                // Create a map of vehicle_id -> vehicle_number
                vehicleMap = vehicles.reduce((acc, v) => {
                    acc[v.id] = v.vehicle_number;
                    return acc;
                }, {});
            }
        }

        // Combine driver data with vehicle numbers
        const driversWithVehicles = drivers.map(driver => ({
            ...driver,
            vehicle_number: driver.current_vehicle_id
                ? vehicleMap[driver.current_vehicle_id] || 'Unassigned'
                : 'Unassigned'
        }));

        return { data: driversWithVehicles, error: null };
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        return { data: [], error };
    }
};

/**
 * Fetch a single driver by ID with vehicle information
 * @param {string} driverId - The driver's UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getDriverById = async (driverId) => {
    try {
        const { data: driver, error: driverError } = await supabase
            .from('driver')
            .select('*')
            .eq('id', driverId)
            .single();

        if (driverError) throw driverError;

        let vehicleNumber = 'Unassigned';

        if (driver.current_vehicle_id) {
            const { data: vehicle, error: vehicleError } = await supabase
                .from('vehicle')
                .select('vehicle_number')
                .eq('id', driver.current_vehicle_id)
                .single();

            if (!vehicleError && vehicle) {
                vehicleNumber = vehicle.vehicle_number;
            }
        }

        return {
            data: { ...driver, vehicle_number: vehicleNumber },
            error: null
        };
    } catch (error) {
        console.error('Error fetching driver:', error.message);
        return { data: null, error };
    }
};

/**
 * Get count of drivers by online status
 * @returns {Promise<{total: number, online: number, offline: number}>}
 */
export const getDriverCounts = async () => {
    try {
        const [totalRes, onlineRes, offlineRes] = await Promise.all([
            supabase.from('driver').select('id', { count: 'exact', head: true }),
            supabase.from('driver').select('id', { count: 'exact', head: true }).eq('is_online', true),
            supabase.from('driver').select('id', { count: 'exact', head: true }).eq('is_online', false)
        ]);

        return {
            total: totalRes.count || 0,
            online: onlineRes.count || 0,
            offline: offlineRes.count || 0
        };
    } catch (error) {
        console.error('Error fetching driver counts:', error.message);
        return { total: 0, online: 0, offline: 0 };
    }
};

/**
 * Fetch pickup logs for a specific driver with optional date range filter
 * @param {string} driverId - The driver's UUID
 * @param {string} startDate - Optional start date (ISO string)
 * @param {string} endDate - Optional end date (ISO string)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getDriverPickupLogs = async (driverId, startDate = null, endDate = null) => {
    try {
        let query = supabase
            .from('pickup_logs')
            .select('*')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false });

        // Apply date range filter if provided
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            // Add one day to include the end date fully
            const endDatePlusOne = new Date(endDate);
            endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
            query = query.lt('created_at', endDatePlusOne.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching driver pickup logs:', error.message);
        return { data: [], error };
    }
};
