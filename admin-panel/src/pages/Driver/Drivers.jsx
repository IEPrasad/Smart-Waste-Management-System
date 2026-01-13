import React, { useState } from 'react';
import './Drivers.css';
import AddDriverButton from '../../components/Drivers/AddDriverButton';
import AddDriverModal from '../../components/Drivers/AddDriverModal';

const Drivers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="drivers-container">
            <div className="drivers-header">
                <h1 className="drivers-title">Drivers Management</h1>
                <AddDriverButton onClick={() => setIsModalOpen(true)} />
            </div>
            {/* Driver list/content will go here */}

            <AddDriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Drivers;
