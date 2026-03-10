import React from 'react';
import './VehicleCard.css';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';

const VehicleCard = ({ vehicle, onViewClick }) => {
    const {
        vehicle_no,
        vehicle_type,
        model,
        capacity_kg,
        status
    } = vehicle;

    // Get status badge class
    const getStatusClass = (stat) => {
        if (!stat) return 'good';
        const statLower = stat.toLowerCase();
        if (statLower === 'good' || statLower === 'excellent' || statLower === 'active') return 'good';
        if (statLower === 'fair' || statLower === 'average' || statLower === 'maintenance') return 'fair';
        if (statLower === 'poor' || statLower === 'bad' || statLower === 'inactive') return 'poor';
        return 'good';
    };

    return (
        <div className="vehicle-card">
            {/* Eye Icon - Top Right */}
            <button className="vehicle-view-icon" onClick={() => onViewClick(vehicle)}>
                <VisibilityIcon />
            </button>

            {/* Left Side - Truck Icon */}
            <div className="vehicle-card-icon">
                <LocalShippingIcon className="truck-icon" />
            </div>

            {/* Right Side - Details */}
            <div className="vehicle-card-content">
                {/* Vehicle Number */}
                <h3 className="vehicle-number">{vehicle_no || 'N/A'}</h3>

                {/* Status Badge */}
                <span className={`vehicle-condition-badge ${getStatusClass(status)}`}>
                    {status || 'GOOD'}
                </span>

                {/* Vehicle Type & Model */}
                <p className="vehicle-type-model">
                    {vehicle_type || 'Unknown Type'} {model ? `(${model})` : ''}
                </p>

                {/* Capacity */}
                <div className="vehicle-capacity-row">
                    <span className="capacity-label">Capacity:</span>
                    <span className="capacity-value">{capacity_kg ? `${capacity_kg} kg` : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;
