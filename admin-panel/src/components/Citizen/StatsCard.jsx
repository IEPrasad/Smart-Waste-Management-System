import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, count, icon, variant, isActive, onClick }) => {
    return (
        <div
            className={`stats-card stats-card--${variant} ${isActive ? 'stats-card--active' : ''}`}
            onClick={onClick}
        >
            <div className="stats-card__header">
                <span className="stats-card__title">{title}</span>
                <div className="stats-card__icon">
                    {icon}
                </div>
            </div>
            <div className="stats-card__count">{count}</div>
        </div>
    );
};

export default StatsCard;
