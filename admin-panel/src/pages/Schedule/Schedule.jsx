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
            const { data: divData } = await supabase
                .from('divisions')
                .select('*')
                .order('name');
            if (divData) setDivisions(divData);

            // Fetch all drivers (for assignment)
            const { data: allDriverData } = await supabase
                .from('driver')
                .select('*, vehicles(vehicle_no)')
                .order('full_name');

            if (allDriverData) {
                const formattedDrivers = allDriverData.map(d => ({
                    ...d,
                    vehicle_number: d.vehicles ? d.vehicles.vehicle_no : null
                }));
                setDrivers(formattedDrivers);
            }

            // Fetch pending requests
            const { data: reqData } = await supabase
                .from('waste_requests')
                .select('*, citizens(*)')
                .eq('status', 'pending')
                .order('date', { ascending: false });

            // Fetch live pending pickups
            const { data: pickupsData } = await supabase
                .from('pickups')
                .select('*, citizens(division)')
                .eq('status', 'pending');

            if (pickupsData) setPickups(pickupsData);

            if (reqData) {
                // 1. Identify users who already have active pending pickups
                const usersWithPendingPickups = new Set(pickupsData?.map(p => p.citizen_id) || []);

                // 2. Filter and collapse requests: 
                //    - Exclude users with existing pending pickups
                //    - Aggregate multiple requests from the same user into one entry
                //    - Collect all unique waste types for that user
                const userGroupMap = reqData.reduce((acc, req) => {
                    // Skip if user already has a pending pickup (to avoid duplicate driver assignment)
                    if (usersWithPendingPickups.has(req.user_id)) return acc;

                    if (!acc[req.user_id]) {
                        acc[req.user_id] = {
                            ...req,
                            waste_type: [req.type] // Initialize as array of types
                        };
                    } else {
                        // If user already seen, just add this request's type if it's new
                        if (!acc[req.user_id].waste_type.includes(req.type)) {
                            acc[req.user_id].waste_type.push(req.type);
                        }
                    }
                    return acc;
                }, {});

                const finalRequests = Object.values(userGroupMap);
                setRequests(finalRequests);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

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

            // 1. Safeguard: Check if any of these users ALREADY have a pending pickup
            // (Secondary check in case UI was stale)
            const { data: existingPickups } = await supabase
                .from('pickups')
                .select('citizen_id')
                .eq('status', 'pending')
                .in('citizen_id', targetUserIds);

            if (existingPickups && existingPickups.length > 0) {
                const conflictingIds = existingPickups.map(p => p.citizen_id);
                toast.error('Some users already have a pending pickup assigned.');
                fetchData();
                setIsAssigning(false);
                return;
            }

            // 2. Find ALL pending requests for these users (to schedule all of them together)
            const { data: allUserPendingRequests } = await supabase
                .from('waste_requests')
                .select('id, user_id')
                .eq('status', 'pending')
                .in('user_id', targetUserIds);

            if (allUserPendingRequests && allUserPendingRequests.length > 0) {
                const allRequestIdsToSchedule = allUserPendingRequests.map(r => r.id);

                // Get citizen coordinates
                const { data: citizensList } = await supabase
                    .from('citizens')
                    .select('id, latitude, longitude')
                    .in('id', targetUserIds);

                if (citizensList && citizensList.length > 0) {
                    const pickupsToInsert = citizensList.map(citizen => ({
                        citizen_id: citizen.id,
                        driver_id: driverId,
                        status: 'pending',
                        lat: citizen.latitude,
                        lng: citizen.longitude
                    }));

                    // Insert pickups
                    const { error: insertError } = await supabase
                        .from('pickups')
                        .insert(pickupsToInsert);

                    if (insertError) throw insertError;

                    // Update ALL associated requests to 'scheduled'
                    const { error: updateError } = await supabase
                        .from('waste_requests')
                        .update({ status: 'scheduled' })
                        .in('id', allRequestIdsToSchedule);

                    if (updateError) throw updateError;
                }
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
