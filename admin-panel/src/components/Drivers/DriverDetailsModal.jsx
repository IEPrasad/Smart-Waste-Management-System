import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, User as PersonIcon, Mail as EmailIcon, Phone as PhoneIcon, Award as BadgeIcon, CreditCard as CreditCardIcon, Truck as LocalShippingIcon, Circle as CircleIcon, History as HistoryIcon } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { getDriverPickupLogs } from '../../services/driverService';

const CloseButton = styled.button`
  background: #EF4444;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;

  &:hover {
    background: #DC2626;
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
  }
`;

const DriverDetailsModal = ({ isOpen, onClose, driver }) => {
    const [pickupLogs, setPickupLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Time filter options
    const filterOptions = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'this_week', label: 'This Week' },
        { key: 'this_month', label: 'This Month' },
        { key: 'last_month', label: 'Last Month' },
        { key: 'all', label: 'All Time' }
    ];

    // Calculate date range based on filter selection
    const getDateRange = (filter) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate = null;
        let endDate = null;

        switch (filter) {
            case 'today':
                startDate = today.toISOString();
                endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'yesterday':
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                startDate = yesterday.toISOString();
                endDate = today.toISOString();
                break;
            case 'this_week':
                const dayOfWeek = today.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const monday = new Date(today.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
                startDate = monday.toISOString();
                endDate = null; // Up to now
                break;
            case 'last_week':
                const currentDayOfWeek = today.getDay();
                const currentMondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
                const currentMonday = new Date(today.getTime() + currentMondayOffset * 24 * 60 * 60 * 1000);
                const lastMonday = new Date(currentMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate = lastMonday.toISOString();
                endDate = currentMonday.toISOString();
                break;
            case 'this_month':
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = firstDayOfMonth.toISOString();
                endDate = null; // Up to now
                break;
            case 'last_month':
                const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = firstDayLastMonth.toISOString();
                endDate = firstDayCurrentMonth.toISOString();
                break;
            case 'all':
            default:
                startDate = null;
                endDate = null;
                break;
        }

        return { startDate, endDate };
    };

    // Fetch pickup logs when modal opens or filter changes
    useEffect(() => {
        if (isOpen && driver) {
            fetchPickupLogs();
        }
    }, [isOpen, driver, selectedFilter]);

    const fetchPickupLogs = async () => {
        if (!driver?.id) return;

        setLogsLoading(true);
        setLogsError(null);

        const { startDate, endDate } = getDateRange(selectedFilter);

        const { data, error } = await getDriverPickupLogs(
            driver.id,
            startDate,
            endDate
        );

        if (error) {
            setLogsError('Failed to load collection history');
        } else {
            setPickupLogs(data);
        }
        setLogsLoading(false);
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        const s = status.toLowerCase();
        if (s === 'completed' || s === 'success') return 'status-completed';
        if (s === 'pending') return 'status-pending';
        if (s === 'failed' || s === 'cancelled') return 'status-failed';
        return '';
    };

    if (!isOpen || !driver) return null;

    const {
        full_name,
        photo_url,
        email,
        mobile_number,
        empno,
        nic_number,
        vehicle_number,
        is_online
    } = driver;

    return (
        <div className="driver-modal-overlay" onClick={onClose}>
            <div className="driver-modal-container wide" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="driver-modal-header">
                    <h2>Driver Details</h2>
                    <CloseButton onClick={onClose}>
                        <X size={20} strokeWidth={2.5} />
                    </CloseButton>
                </div>

                {/* Two Column Layout */}
                <div className="driver-modal-content-grid">
                    {/* Left Column - Driver Details */}
                    <div className="driver-details-column">
                        {/* Profile Section */}
                        <div className="driver-modal-profile">
                            <div className="driver-modal-avatar-container">
                                {photo_url ? (
                                    <img
                                        src={photo_url}
                                        alt={full_name}
                                        className="driver-modal-avatar-img"
                                    />
                                ) : (
                                    <div className="driver-modal-avatar-placeholder">
                                        <PersonIcon className="driver-modal-avatar-icon" />
                                    </div>
                                )}
                                <span className={`driver-modal-status-dot ${is_online ? 'online' : 'offline'}`}></span>
                            </div>

                            <h3 className="driver-modal-name">{full_name}</h3>
                            <div className={`driver-modal-duty-badge ${is_online ? 'on-duty' : 'off-duty'}`}>
                                <CircleIcon className="duty-indicator-icon" />
                                <span>{is_online ? 'On Duty' : 'Off Duty'}</span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="driver-modal-details">
                            <div className="driver-modal-detail-item">
                                <div className="detail-icon-wrapper email">
                                    <EmailIcon />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Email Address</span>
                                    <span className="detail-value">{email || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="driver-modal-detail-item">
                                <div className="detail-icon-wrapper phone">
                                    <PhoneIcon />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Mobile Number</span>
                                    <span className="detail-value">{mobile_number || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="driver-modal-detail-item">
                                <div className="detail-icon-wrapper badge">
                                    <BadgeIcon />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Employee Number</span>
                                    <span className="detail-value">{empno || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="driver-modal-detail-item">
                                <div className="detail-icon-wrapper nic">
                                    <CreditCardIcon />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">NIC Number</span>
                                    <span className="detail-value">{nic_number || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="driver-modal-detail-item">
                                <div className="detail-icon-wrapper vehicle">
                                    <LocalShippingIcon />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Assigned Vehicle</span>
                                    <span className={`detail-value ${vehicle_number === 'Unassigned' ? 'unassigned' : 'assigned'}`}>
                                        {vehicle_number}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Collection History */}
                    <div className="driver-history-column">
                        <div className="history-header">
                            <div className="history-title">
                                <HistoryIcon />
                                <h4>Waste Collection History</h4>
                            </div>
                        </div>

                        {/* Time Range Filter */}
                        <div className="history-filter">
                            <div className="filter-chips">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option.key}
                                        className={`filter-chip ${selectedFilter === option.key ? 'active' : ''}`}
                                        onClick={() => handleFilterChange(option.key)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Collection History Table */}
                        <div className="history-table-container">
                            {logsLoading ? (
                                <div className="history-loading">
                                    <CircularProgress size={30} style={{ color: '#00d2a0' }} />
                                    <span>Loading history...</span>
                                </div>
                            ) : logsError ? (
                                <div className="history-error">{logsError}</div>
                            ) : pickupLogs.length === 0 ? (
                                <div className="history-empty">
                                    <HistoryIcon />
                                    <span>No collection records found</span>
                                </div>
                            ) : (
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Citizen</th>
                                            <th>GN Division</th>
                                            <th>Compost (kg)</th>
                                            <th>Recycling (kg)</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pickupLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td>{formatDate(log.created_at)}</td>
                                                <td>{log.citizen_name || 'N/A'}</td>
                                                <td>{log.gn_division || 'N/A'}</td>
                                                <td>{log.compost_weight ?? 0}</td>
                                                <td>{log.recycling_weight ?? 0}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(log.status)}`}>
                                                        {log.status || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Summary Stats */}
                        {!logsLoading && pickupLogs.length > 0 && (
                            <div className="history-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total Collections</span>
                                    <span className="summary-value">{pickupLogs.length}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Compost</span>
                                    <span className="summary-value">
                                        {pickupLogs.reduce((sum, log) => sum + (log.compost_weight || 0), 0).toFixed(1)} kg
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Recycling</span>
                                    <span className="summary-value">
                                        {pickupLogs.reduce((sum, log) => sum + (log.recycling_weight || 0), 0).toFixed(1)} kg
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="driver-modal-footer" />
            </div>
        </div>
    );
};

export default DriverDetailsModal;
