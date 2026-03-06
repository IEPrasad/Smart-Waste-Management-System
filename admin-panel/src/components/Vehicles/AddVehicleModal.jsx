import React, { useState } from 'react';
import './AddVehicleModal.css';
import { X } from 'lucide-react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabaseClient';

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

const AddVehicleModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        vehicle_no: '',
        vehicle_type: '',
        model: '',
        capacity_kg: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                vehicle_no: '',
                vehicle_type: '',
                model: '',
                capacity_kg: ''
            });
            setError(null);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!formData.vehicle_no || !formData.vehicle_type || !formData.model || !formData.capacity_kg) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }

        // Validate capacity is a number
        if (isNaN(Number(formData.capacity_kg)) || Number(formData.capacity_kg) <= 0) {
            setError("Capacity must be a valid positive number.");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error: insertError } = await supabase
                .from('vehicles')
                .insert([
                    {
                        vehicle_no: formData.vehicle_no,
                        vehicle_type: formData.vehicle_type,
                        model: formData.model,
                        capacity_kg: Number(formData.capacity_kg)
                    }
                ])
                .select();

            if (insertError) {
                throw insertError;
            }

            // Success
            alert("Vehicle added successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Error adding vehicle:", err);
            setError(err.message || "Failed to add vehicle.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="vehicle-modal-overlay">
            <div className="vehicle-modal-container">
                <div className="vehicle-modal-header">
                    <h2>Add New Vehicle</h2>
                    <CloseButton onClick={onClose} disabled={isLoading}>
                        <X size={20} strokeWidth={2.5} />
                    </CloseButton>
                </div>
                <div className="vehicle-modal-body">
                    {error && <div className="vehicle-error-message">{error}</div>}

                    <div className="vehicle-form-group">
                        <label>Vehicle Number</label>
                        <input
                            name="vehicle_no"
                            value={formData.vehicle_no}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g. WP-1234"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="vehicle-form-group">
                        <label>Vehicle Type</label>
                        <select
                            name="vehicle_type"
                            value={formData.vehicle_type}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="">Select vehicle type</option>
                            <option value="Garbage Truck">Garbage Truck</option>
                            <option value="Compactor Truck">Compactor Truck</option>
                            <option value="Tipper Truck">Tipper Truck</option>
                            <option value="Mini Truck">Mini Truck</option>
                            <option value="Tractor">Tractor</option>
                        </select>
                    </div>

                    <div className="vehicle-form-group">
                        <label>Vehicle Model</label>
                        <input
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g. TATA LPT 709"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="vehicle-form-group">
                        <label>Capacity (kg)</label>
                        <input
                            name="capacity_kg"
                            value={formData.capacity_kg}
                            onChange={handleChange}
                            type="number"
                            placeholder="e.g. 5000"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="vehicle-modal-footer">
                    <button className="vehicle-create-btn" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Adding...' : (
                            <>
                                <span>+</span> Add Vehicle
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVehicleModal;
