
import React, { useState, useEffect } from 'react';
import './header.css';
import logo from '../../assets/images/logo.png';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="header">

            <div className="header-middle">
                <div className="datetime">
                    <span className="time">{formatTime(currentDateTime)}</span>
                    <span className="date">{formatDate(currentDateTime)}</span>
                </div>
            </div>
            <div className="header-right">
                <AccountCircleIcon style={{ fontSize: 45, color: '#2c3e50' }} />
            </div>
        </div>
    );
};

export default Header;
