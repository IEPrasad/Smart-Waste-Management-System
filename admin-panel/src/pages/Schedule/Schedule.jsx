import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SchedulesDashboard from '../../components/Schedule/SchedulesDashboard';

import SmartScheduleDashboardStyled from '../../components/Schedule/SmartScheduleDashboardStyled';
import AssignmentModal from '../../components/Schedule/AssignmentModal';
import { toast, Toaster } from 'react-hot-toast';

const Schedule = () => {
    // State
    const [requests, setRequests] = useState([]);
    const [pickups, setPickups] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDivision, setSelectedDivision] = useState('All');

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [requestsToAssign, setRequestsToAssign] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);

    const handleOpenAssignDrawer = (requestIds) => {
        setRequestsToAssign(requestIds);
        setIsDrawerOpen(true);
    };

    const handleAutoBatchAssign = (divisionName) => {
        const divisionRequests = requests
            .filter(req => req.division === divisionName)
            .map(req => req.id);

        handleOpenAssignDrawer(divisionRequests);
    };

    // Fetch Initial Data
    useEffect(() => {
        fetchData();
        setupRealtimeSubscription();

        return () => {
            supabase.removeAllChannels();
        };
    }, []);

    const fetchData = async () => {
        // Keep loading true only on initial load
        if (requests.length === 0) setLoading(true);

        try {
            // Fetch divisions
            const { data: divData, error: divError } = await supabase
                .from('divisions')
                .select('*')
                .order('name');

            if (divError) {
                console.error('Divisions fetch error:', divError);
                toast.error('Divisions Error: ' + divError.message);
            } else {
                setDivisions(divData || []);
                console.log('Fetched Divisions:', divData?.length);
            }

            // Fetch all drivers (for assignment)
            const { data: allDriverData, error: driverError } = await supabase
                .from('driver')
                .select('*, vehicles(vehicle_no)')
                .order('full_name');

            if (driverError) {
                console.error('Drivers fetch error:', driverError);
            } else if (allDriverData) {
                const formattedDrivers = allDriverData.map(d => ({
                    ...d,
                    vehicle_number: d.vehicles ? d.vehicles.vehicle_no : null
                }));
                setDrivers(formattedDrivers);
                console.log('Fetched Drivers:', allDriverData.length);
            }

            // Fetch live pending pickups (needed for filtering requests)
            const { data: pickupsData, error: pickupsError } = await supabase
                .from('pickups')
                .select('*, citizens(division)')
                .eq('status', 'pending');

            if (pickupsError) {
                console.error('Pickups fetch error:', pickupsError);
            } else {
                setPickups(pickupsData || []);
                console.log('Fetched Pending Pickups:', pickupsData?.length);
            }

            // Fetch pending requests
            const { data: reqData, error: reqError } = await supabase
                .from('waste_requests')
                .select('*, citizens(*)')
                .eq('status', 'pending')
                .order('date', { ascending: false });

            if (reqError) {
                console.error('Waste Requests fetch error:', reqError);
                // Fallback attempt without join if join fails
                console.log('Attempting fallback fetch without citizens join...');
                const { data: fallbackReqData, error: fallbackError } = await supabase
                    .from('waste_requests')
                    .select('*')
                    .eq('status', 'pending');

                if (fallbackError) {
                    toast.error('Requests Error: ' + reqError.message);
                } else {
                    processRequests(fallbackReqData || [], pickupsData || []);
                }
            } else {
                processRequests(reqData || [], pickupsData || []);
            }

        } catch (error) {
            console.error('Error in fetchData:', error);
            toast.error('System Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    function processRequests(reqData, pickupsData) {
        console.log('Processing Requests:', reqData.length);

        // 1. Identify users who already have active pending pickups
        // In pickups table, the column for user is typically 'citizen_id'
        const usersWithPendingPickups = new Set(pickupsData?.map(p => p.citizen_id).filter(Boolean) || []);
        console.log('Skipping users with pending pickups:', usersWithPendingPickups.size);

        // 2. Filter and collapse requests
        const userGroupMap = reqData.reduce((acc, req) => {
            // In a previous version, we skipped users who already have active pending pickups
            // However, this caused the "Division Priority" count to look like 0 when it should be 1.
            // We now keep all pending requests to show the correct volume.
            // if (usersWithPendingPickups.has(req.user_id)) return acc;

            const div = req.division || req.citizens?.division || 'Unknown';
            const currentTypes = Array.isArray(req.waste_type) ? req.waste_type : [req.type || 'General'];

            if (!acc[req.user_id]) {
                acc[req.user_id] = {
                    ...req,
                    division: div,
                    waste_type: [...currentTypes]
                };
            } else {
                // Add new types from this request if not already present
                currentTypes.forEach(t => {
                    if (!acc[req.user_id].waste_type.includes(t)) {
                        acc[req.user_id].waste_type.push(t);
                    }
                });
            }
            return acc;
        }, {});

        const finalRequests = Object.values(userGroupMap);
        console.log('Final Display Requests:', finalRequests.length);
        setRequests(finalRequests);
    }

    const setupRealtimeSubscription = () => {
        // Subscribe to waste_requests changes
        const requestChannel = supabase
            .channel('waste-requests-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'waste_requests' },
                (payload) => {
                    console.log('Request change detected:', payload);
                    fetchData(); // Refetch data on any change
                }
            )
            .subscribe();

        // Subscribe to driver changes
        const driverChannel = supabase
            .channel('drivers-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'driver' },
                () => {
                    fetchData();
                }
            )
            .subscribe();
    };

    // Filter requests by selected division
    const filteredRequests = useMemo(() => {
        if (selectedDivision === 'All') return requests;
        return requests.filter(req => req.division === selectedDivision);
    }, [requests, selectedDivision]);

    // Handlers
    const handleDivisionChange = (division) => {
        setSelectedDivision(division);
    };

    const handleAssignDriver = async (driverId, requestIds) => {
        setIsAssigning(true);
        try {
            // Get all user_ids associated with the selected requests
            const { data: baseRequests } = await supabase
                .from('waste_requests')
                .select('user_id')
                .in('id', requestIds);

            if (!baseRequests || baseRequests.length === 0) return;

            const targetUserIds = [...new Set(baseRequests.map(r => r.user_id))];

            // 1. Identify which targeted users ALREADY have a pending pickup
            const { data: existingPickups } = await supabase
                .from('pickups')
                .select('citizen_id')
                .eq('status', 'pending')
                .in('citizen_id', targetUserIds);

            const conflictingUserIds = new Set(existingPickups?.map(p => p.citizen_id) || []);

            // Separate users into those needing a NEW pickup and those just needing request updates
            const usersNeedingNewPickup = targetUserIds.filter(uid => !conflictingUserIds.has(uid));
            const usersToLinkOnly = targetUserIds.filter(uid => conflictingUserIds.has(uid));

            // 2. Insert NEW pickups only for those who don't have one
            if (usersNeedingNewPickup.length > 0) {
                const { data: citizensList } = await supabase
                    .from('citizens')
                    .select('id, latitude, longitude')
                    .in('id', usersNeedingNewPickup);

                if (citizensList && citizensList.length > 0) {
                    const pickupsToInsert = citizensList.map(citizen => ({
                        citizen_id: citizen.id,
                        driver_id: driverId,
                        status: 'pending',
                        lat: citizen.latitude,
                        lng: citizen.longitude
                    }));

                    const { error: insertError } = await supabase
                        .from('pickups')
                        .insert(pickupsToInsert);

                    if (insertError) throw insertError;
                }
            }

            // 3. Find ALL pending requests for these users (to schedule all of them together)
            const { data: allUserPendingRequests } = await supabase
                .from('waste_requests')
                .select('id, user_id')
                .eq('status', 'pending')
                .in('user_id', targetUserIds);

            if (allUserPendingRequests && allUserPendingRequests.length > 0) {
                const allRequestIdsToSchedule = allUserPendingRequests.map(r => r.id);

                // Update ALL associated requests to 'scheduled'
                const { error: updateError } = await supabase
                    .from('waste_requests')
                    .update({ status: 'scheduled' })
                    .in('id', allRequestIdsToSchedule);

                if (updateError) throw updateError;
            }

            toast.success(`Successfully assigned ${requestIds.length} request(s)!`);

            // Refresh data
            fetchData();

            // Close drawer
            setIsDrawerOpen(false);
            setRequestsToAssign([]);

        } catch (error) {
            console.error('Error assigning driver:', error);
            toast.error('Failed to assign driver');
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" />

            <SmartScheduleDashboardStyled
                requests={requests}
                pickups={pickups}
                drivers={drivers}
                divisions={divisions}
                onAssignDriver={handleAutoBatchAssign}
            />

            {/* DEBUG OVERLAY */}
            <div style={{
                position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
                background: 'rgba(0,0,0,0.8)', color: 'white', padding: '12px',
                borderRadius: '8px', fontSize: '10px', pointerEvents: 'none'
            }}>
                DEBUG: ReqCount: {requests.length} | Pickups: {pickups.length} | Drivers: {drivers.length}
            </div>

            {/* Assignment Modal (Popup) */}
            <AssignmentModal
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setRequestsToAssign([]);
                }}
                drivers={drivers}
                requestIds={requestsToAssign}
                onAssign={handleAssignDriver}
                isAssigning={isAssigning}
            />
        </>
    );
};

export default Schedule;
