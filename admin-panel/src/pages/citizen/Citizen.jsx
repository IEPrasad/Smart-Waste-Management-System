import React, { useState, useEffect } from 'react';
import './Citizen.css';
import StatsCard from '../../components/Citizen/StatsCard';
import CitizenTable from '../../components/Citizen/CitizenTable';
import { getCitizenCounts, getCitizensByStatus } from '../../services/citizenService';

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const Citizen = () => {
    const [counts, setCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
    const [selectedStatus, setSelectedStatus] = useState('approved');
    const [citizens, setCitizens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch counts on mount
    useEffect(() => {
        const fetchCounts = async () => {
            const data = await getCitizenCounts();
            setCounts(data);
        };
        fetchCounts();
    }, []);

    // Fetch citizens when status changes
    useEffect(() => {
        const fetchCitizens = async () => {
            setIsLoading(true);
            const { data } = await getCitizensByStatus(selectedStatus);
            setCitizens(data || []);
            setIsLoading(false);
        };
        fetchCitizens();
    }, [selectedStatus]);

    const handleCardClick = (status) => {
        setSelectedStatus(status);
    };

    const getStatusLabel = () => {
        switch (selectedStatus) {
            case 'approved': return 'approved';
            case 'pending': return 'pending';
            case 'rejected': return 'rejected';
            default: return '';
        }
    };

    return (
        <div className="citizen-container">
            {/* Stats Cards */}
            <div className="citizen-stats">
                <StatsCard
                    title="Active Citizens"
                    count={counts.approved}
                    icon={<CheckCircleOutlineIcon />}
                    variant="approved"
                    isActive={selectedStatus === 'approved'}
                    onClick={() => handleCardClick('approved')}
                />
                <StatsCard
                    title="New Requests"
                    count={counts.pending}
                    icon={<PendingActionsIcon />}
                    variant="pending"
                    isActive={selectedStatus === 'pending'}
                    onClick={() => handleCardClick('pending')}
                />
                <StatsCard
                    title="Rejected Users"
                    count={counts.rejected}
                    icon={<CancelOutlinedIcon />}
                    variant="rejected"
                    isActive={selectedStatus === 'rejected'}
                    onClick={() => handleCardClick('rejected')}
                />
            </div>

            {/* Citizens Table */}
            <div className="citizen-table-section">
                <h2 className="citizen-table-title">
                    {selectedStatus === 'approved' && 'Active Citizens'}
                    {selectedStatus === 'pending' && 'Pending Requests'}
                    {selectedStatus === 'rejected' && 'Rejected Users'}
                </h2>
                <CitizenTable
                    citizens={citizens}
                    isLoading={isLoading}
                    statusLabel={getStatusLabel()}
                />
            </div>
        </div>
    );
};

export default Citizen;