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
                .select('*')
                .eq('status', 'pending')
                .order('date', { ascending: false });

            if (reqData) setRequests(reqData);

            // Fetch live pending pickups
            const { data: pickupsData } = await supabase
                .from('pickups')
                .select('*, citizens(division)')
                .eq('status', 'pending');

            if (pickupsData) setPickups(pickupsData);

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
            // First map the citizen references for inserting to the pickups table
            const { data: targetRequests } = await supabase
                .from('waste_requests')
                .select('id, user_id')
                .in('id', requestIds);

            if (targetRequests && targetRequests.length > 0) {
                // Determine citizen IDs
                const citizenIds = [...new Set(targetRequests.map(req => req.user_id))];

                const { data: citizensList } = await supabase
                    .from('citizens')
                    .select('id, latitude, longitude')
                    .in('id', citizenIds);

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

            // Update all selected requests
            const { error: updateError } = await supabase
                .from('waste_requests')
                .update({
                    status: 'scheduled'
                })
                .in('id', requestIds);

            if (updateError) throw updateError;

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
