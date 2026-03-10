import React from 'react';
import './DriverCard.css';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';

const DriverCard = ({ driver, onViewClick }) => {
    const {
        full_name,
        photo_url,
        is_online,
        vehicle_number,
        empno
    } = driver;

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
                    <span className={`driver-duty-status ${is_online ? 'on-duty' : 'off-duty'}`}>
                        {is_online ? 'On Duty' : 'Off Duty'}
                    </span>
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
            </div>

            {/* Action Button */}
            <button className="driver-view-btn" onClick={() => onViewClick(driver)}>
                View
            </button>
        </div>
    );
};

export default DriverCard;
