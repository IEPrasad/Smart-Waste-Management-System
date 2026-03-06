import React, { useState } from 'react';
import './VehicleDetailsModal.css';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { updateVehicleStatus, deleteVehicle } from '../../services/vehicleService';
import useEscapeKey from '../../hooks/useEscapeKey';

const VehicleDetailsModal = ({ isOpen, onClose, vehicle, onUpdate, onDelete }) => {
    const [selectedStatus, setSelectedStatus] = useState(vehicle?.status || 'Good');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Use Escape key to close
    useEscapeKey(onClose, isOpen);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen && vehicle) {
            setSelectedStatus(vehicle.status || 'Good');
            setError(null);
        }
    }, [isOpen, vehicle]);

    if (!isOpen || !vehicle) return null;

    const statusOptions = ['Good', 'Maintenance'];

    const handleUpdateStatus = async () => {
        setIsUpdating(true);
        setError(null);

        const { success, error: updateError } = await updateVehicleStatus(vehicle.id, selectedStatus);

        if (success) {
            if (onUpdate) onUpdate();
            onClose();
        } else {
            setError(updateError?.message || 'Failed to update status');
        }
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete vehicle ${vehicle.vehicle_no}? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        setIsDeleting(true);
        setError(null);

        const { success, error: deleteError } = await deleteVehicle(vehicle.id);

        if (success) {
            if (onDelete) onDelete();
            onClose();
        } else {
            setError(deleteError?.message || 'Failed to delete vehicle');
        }
        setIsDeleting(false);
    };

    return (
        <div className="vehicle-details-overlay" onClick={onClose}>
            <div className="vehicle-details-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="vehicle-details-header">
                    <h2>Vehicle Details</h2>
                    <button className="vehicle-details-close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Vehicle Info */}
                <div className="vehicle-details-info">
                    <div className="vehicle-details-icon">
                        <LocalShippingIcon />
                    </div>
                    <div className="vehicle-details-text">
                        <h3>{vehicle.vehicle_no}</h3>
                        <p>{vehicle.vehicle_type} {vehicle.model ? `(${vehicle.model})` : ''}</p>
                        <span className="vehicle-capacity">Capacity: {vehicle.capacity_kg ? `${vehicle.capacity_kg} kg` : 'N/A'}</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && <div className="vehicle-details-error">{error}</div>}

                {/* Status Update Section */}
                <div className="vehicle-details-section">
                    <label className="section-label">Update Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="status-select"
                        disabled={isUpdating || isDeleting}
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <button
                        className="update-status-btn"
                        onClick={handleUpdateStatus}
                        disabled={isUpdating || isDeleting}
                    >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </button>
                </div>

                {/* Delete Section */}
                <div className="vehicle-details-section delete-section">
                    <label className="section-label danger">Danger Zone</label>
                    <button
                        className="delete-vehicle-btn"
                        onClick={handleDelete}
                        disabled={isUpdating || isDeleting}
                    >
                        <DeleteIcon />
                        {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailsModal;
