import React from 'react';
import './StatsCard.css';
import { TrendingUp } from 'lucide-react';

/**
 * StatsCard Component - Finance KPI Card Style
 * Displays a statistic card with gradient background, icon, title, and count
 * @param {string} title - Card title
 * @param {number} count - Count to display
 * @param {React.ReactNode} icon - Material UI icon component
 * @param {string} variant - 'total' | 'pending' | 'rejected' | 'suspended'
 * @param {boolean} isActive - Whether the card is currently selected
 * @param {function} onClick - Click handler
 * @param {string} subtitle - Optional subtitle/trend text
 */
const StatsCard = ({ title, count, icon, variant, isActive, onClick, subtitle }) => {
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
            <div className="stats-card__header">
                <div className="stats-card__label">{title}</div>
                <div className="stats-card__icon-wrapper">
                    <div className="stats-card__icon">
                        {icon}
                    </div>
                </div>
            </div>
            <div className="stats-card__value">{count}</div>
            {subtitle && (
                <div className="stats-card__trend">
                    <TrendingUp size={14} />
                    <span>{subtitle}</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
