import React from 'react';
import './AddDriverButton.css';

const AddDriverButton = ({ onClick }) => {
    return (
        <button className="add-driver-btn" onClick={onClick}>
            <span>+</span> Add New Driver
        </button>
    );
};

export default AddDriverButton;
