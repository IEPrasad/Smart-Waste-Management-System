import React from 'react';
import './DriverCard.css';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';

const DriverCard = ({ driver, onViewClick, assignments = [], completedAssignments = 0 }) => {
    const {
        full_name,
        photo_url,
        is_online,
        vehicle_number,
        empno
    } = driver;

    const progressPct = assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;

    return (
        <div className="driver-card">
            {/* Profile Section */}
            <div className="driver-card-profile">
                <div className="driver-avatar-container">
                    {photo_url ? (
                        <img
                            src={photo_url}
                            alt={full_name}
                            className="driver-avatar-img"
                        />
                    ) : (
                        <div className="driver-avatar-placeholder">
                            <PersonIcon className="driver-avatar-icon" />
                        </div>
                    )}
                </div>

                <div className="driver-info">
                    <h3 className="driver-name">{full_name}</h3>
                    {assignments.length > 0 ? (
                        <span className="driver-duty-status assigned" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' }}>
                            Assigned
                        </span>
                    ) : (
                        <span className={`driver-duty-status ${is_online ? 'on-duty' : 'off-duty'}`}>
                            {is_online ? 'On Duty' : 'Off Duty'}
                        </span>
                    )}
                </div>
            </div>

            {/* Details Section */}
            <div className="driver-card-details">
                <div className="driver-detail-row">
                    <LocalShippingIcon className="driver-detail-icon" />
                    <span className="driver-detail-label">Vehicle</span>
                    <span className={`driver-detail-value ${vehicle_number === 'Unassigned' ? 'unassigned' : ''}`}>
                        {vehicle_number}
                    </span>
                </div>

                <div className="driver-detail-row">
                    <BadgeIcon className="driver-detail-icon" />
                    <span className="driver-detail-label">EMP-NO</span>
                    <span className="driver-detail-value">{empno || 'N/A'}</span>
                </div>

                {/* Progress Tracking Section */}
                {assignments.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>
                            <span>COLLECTION PROGRESS</span>
                            <span style={{ color: completedAssignments === assignments.length ? '#15803D' : '#64748B' }}>{completedAssignments}/{assignments.length} Zones</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                background: progressPct === 100 ? '#22C55E' : '#3B82F6',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button className="driver-view-btn" onClick={() => onViewClick(driver)}>
                View
            </button>
        </div>
    );
};

export default DriverCard;
