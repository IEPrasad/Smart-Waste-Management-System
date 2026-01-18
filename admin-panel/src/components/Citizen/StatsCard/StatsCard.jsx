import React from 'react';
import './StatsCard.css';

/**
 * StatsCard Component
 * Displays a statistic card with icon, title, and count
 * @param {string} title - Card title
 * @param {number} count - Count to display
 * @param {React.ReactNode} icon - Material UI icon component
 * @param {string} variant - 'total' | 'pending' | 'rejected' | 'suspended'
 * @param {boolean} isActive - Whether the card is currently selected
 * @param {function} onClick - Click handler
 */
const StatsCard = ({ title, count, icon, variant, isActive, onClick }) => {
    return (
        <div
            className={`stats-card stats-card--${variant} ${isActive ? 'stats-card--active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            aria-pressed={isActive}
            aria-label={`${title}: ${count}`}
        >
            <div className="stats-card__icon-wrapper">
                <div className="stats-card__icon">
                    {icon}
                </div>
            </div>
            <div className="stats-card__content">
                <span className="stats-card__title">{title}</span>
                <span className="stats-card__count">{count}</span>
            </div>
        </div>
    );
};

export default StatsCard;
