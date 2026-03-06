import React, { useState, useEffect } from 'react';
import './Citizen.css';
import StatsCard from '../../components/Citizen/StatsCard/StatsCard';
import CitizenTable from '../../components/Citizen/CitizenTable/CitizenTable';
import CitizenDetailsModal from '../../components/Citizen/CitizenDetailsModal/CitizenDetailsModal';
import { getCitizenCounts, getCitizensByStatus, getAllCitizens } from '../../services/citizenService';

// Material UI Icons
import GroupIcon from '@mui/icons-material/Group';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonOffIcon from '@mui/icons-material/PersonOff';

/**
 * Citizen Management Page
 * Displays stat cards for different citizen statuses and a filterable table
 */
const Citizen = () => {
    // State for counts
    const [counts, setCounts] = useState({
        total: 0,
        pending: 0,
        rejected: 0,
        suspended: 0
    });

    // State for selected status filter
    const [selectedStatus, setSelectedStatus] = useState('total');

    // State for citizens data
    const [citizens, setCitizens] = useState([]);

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCitizen, setSelectedCitizen] = useState(null);

    // Fetch data function
    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        // Fetch counts
        const countsData = await getCitizenCounts();
        setCounts(countsData);

        // Fetch table data
        let result;
        if (selectedStatus === 'total') {
            result = await getAllCitizens();
        } else {
            result = await getCitizensByStatus(selectedStatus);
        }
        setCitizens(result.data || []);
        setIsLoading(false);
    }, [selectedStatus]);

    // Fetch on mount and when status changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);



    // Handle card click to change filter
    const handleCardClick = (status) => {
        setSelectedStatus(status);
    };

    // Handle view citizen action
    const handleViewCitizen = (citizen) => {
        setSelectedCitizen(citizen);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCitizen(null);
    };

    const handleActionSuccess = () => {
        handleCloseModal();
        fetchData();
    };

    // Get table title based on selected status
    const getTableTitle = () => {
        switch (selectedStatus) {
            case 'total':
                return 'Total Citizens';
            case 'pending':
                return 'Pending Requests';
            case 'rejected':
                return 'Rejected Requests';
            case 'suspended':
                return 'Suspended Citizens';
            default:
                return 'Citizens';
        }
    };

    return (
        <div className="citizen-page">
            {/* Stats Cards Section */}
            <div className="citizen-page__stats">
                <StatsCard
                    title="Total Citizens"
                    count={counts.total}
                    icon={<GroupIcon />}
                    variant="total"
                    isActive={selectedStatus === 'total'}
                    onClick={() => handleCardClick('total')}
                />
                <StatsCard
                    title="Pending Requests"
                    count={counts.pending}
                    icon={<EditNoteIcon />}
                    variant="pending"
                    isActive={selectedStatus === 'pending'}
                    onClick={() => handleCardClick('pending')}
                />
                <StatsCard
                    title="Rejected Requests"
                    count={counts.rejected}
                    icon={<CancelIcon />}
                    variant="rejected"
                    isActive={selectedStatus === 'rejected'}
                    onClick={() => handleCardClick('rejected')}
                />
                <StatsCard
                    title="Suspended Citizen"
                    count={counts.suspended}
                    icon={<PersonOffIcon />}
                    variant="suspended"
                    isActive={selectedStatus === 'suspended'}
                    onClick={() => handleCardClick('suspended')}
                />
            </div>

            {/* Table Section */}
            <div className="citizen-page__table">
                <CitizenTable
                    citizens={citizens}
                    isLoading={isLoading}
                    tableTitle={getTableTitle()}
                    onViewCitizen={handleViewCitizen}
                />
            </div>

            <CitizenDetailsModal
                open={isModalOpen}
                onClose={handleCloseModal}
                citizen={selectedCitizen}
                onActionSuccess={handleActionSuccess}
            />
        </div>
    );
};

export default Citizen;