import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SchedulesDashboard from '../../components/Schedule/SchedulesDashboard';

import SmartScheduleDashboardStyled from '../../components/Schedule/SmartScheduleDashboardStyled';
import AssignmentModal from '../../components/Schedule/AssignmentModal';
import { toast, Toaster } from 'react-hot-toast';

const Schedule = () => {
    // State
    const [requests, setRequests] = useState([]);
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
                .from('drivers')
                .select('*')
                .order('full_name');
            if (allDriverData) setDrivers(allDriverData);

            // Fetch pending requests with citizen data
            const { data: reqData } = await supabase
                .from('waste_requests')
                .select('*, citizens(full_name, mobile_number, photo_url)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (reqData) setRequests(reqData);

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
                { event: '*', schema: 'public', table: 'drivers' },
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
            // Update all selected requests
            const { error } = await supabase
                .from('waste_requests')
                .update({
                    assigned_driver_id: driverId,
                    status: 'assigned',
                    assigned_at: new Date().toISOString()
                })
                .in('id', requestIds);

            if (error) throw error;

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
