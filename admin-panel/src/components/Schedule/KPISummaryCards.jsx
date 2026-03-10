import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, icon: Icon, theme, pulse }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        if (value !== displayValue) {
            setIsPulsing(true);
            setDisplayValue(value);
            const timer = setTimeout(() => setIsPulsing(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [value, displayValue]);

    const themes = {
        yellow: {
            gradient: 'from-amber-50 via-yellow-50 to-orange-50',
            iconGradient: 'from-amber-400 via-yellow-500 to-orange-500',
            iconShadow: 'shadow-amber-200/50',
            textGradient: 'from-amber-600 to-orange-600',
            border: 'border-amber-200/60',
            pulse: 'ring-amber-400/30',
            glow: 'shadow-amber-100/50'
        },
        blue: {
            gradient: 'from-blue-50 via-cyan-50 to-sky-50',
            iconGradient: 'from-blue-400 via-cyan-500 to-sky-500',
            iconShadow: 'shadow-blue-200/50',
            textGradient: 'from-blue-600 to-cyan-600',
            border: 'border-blue-200/60',
            pulse: 'ring-blue-400/30',
            glow: 'shadow-blue-100/50'
        },
        green: {
            gradient: 'from-emerald-50 via-green-50 to-teal-50',
            iconGradient: 'from-emerald-400 via-green-500 to-teal-500',
            iconShadow: 'shadow-emerald-200/50',
            textGradient: 'from-emerald-600 to-teal-600',
            border: 'border-emerald-200/60',
            pulse: 'ring-emerald-400/30',
            glow: 'shadow-emerald-100/50'
        }
    };

    const currentTheme = themes[theme];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`relative overflow-hidden bg-gradient-to-br ${currentTheme.gradient} border-2 ${currentTheme.border} rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:${currentTheme.glow} ${isPulsing && pulse ? `ring-4 ${currentTheme.pulse}` : ''
                } backdrop-blur-sm`}
            style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}
        >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}></div>
            </div>

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">{title}</p>
                    <motion.h2
                        key={displayValue}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={`text-5xl font-extrabold bg-gradient-to-r ${currentTheme.textGradient} bg-clip-text text-transparent mb-1`}
                    >
                        {displayValue}
                    </motion.h2>
                    <p className="text-xs text-gray-500 font-medium">Active now</p>
                </div>
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`bg-gradient-to-br ${currentTheme.iconGradient} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${currentTheme.iconShadow} relative`}
                >
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                    <Icon className="w-8 h-8 text-white relative z-10" strokeWidth={2.5} />
                </motion.div>
            </div>
        </motion.div>
    );
};

const KPISummaryCards = ({ pendingCount, scheduledCount, availableDrivers }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
                title="Pending Requests"
                value={pendingCount}
                icon={Clock}
                theme="yellow"
                pulse={true}
            />
            <KPICard
                title="Scheduled Today"
                value={scheduledCount}
                icon={Calendar}
                theme="blue"
                pulse={false}
            />
            <KPICard
                title="Available Drivers"
                value={availableDrivers}
                icon={Radio}
                theme="green"
                pulse={false}
            />
        </div>
    );
};

export default KPISummaryCards;
