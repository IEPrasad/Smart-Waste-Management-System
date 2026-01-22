import React from 'react';
import { MapPin, Leaf, Recycle, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const DivisionInsightCard = ({ division, requestCount, wasteBreakdown, onAssignClick }) => {
    const progress = (requestCount / 10) * 100;

    const getProgressColor = () => {
        if (requestCount >= 10) return 'bg-red-500';
        if (requestCount >= 5) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusTheme = () => {
        if (requestCount >= 10) return {
            border: 'border-red-200',
            bg: 'bg-red-50',
            iconBg: 'from-red-400 to-red-600',
            badge: 'bg-red-100 text-red-700'
        };
        if (requestCount >= 5) return {
            border: 'border-yellow-200',
            bg: 'bg-yellow-50',
            iconBg: 'from-yellow-400 to-yellow-600',
            badge: 'bg-yellow-100 text-yellow-700'
        };
        return {
            border: 'border-green-200',
            bg: 'bg-green-50',
            iconBg: 'from-green-400 to-green-600',
            badge: 'bg-green-100 text-green-700'
        };
    };

    const theme = getStatusTheme();
    const organicCount = wasteBreakdown?.organic || 0;
    const recyclableCount = wasteBreakdown?.recyclable || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={`bg-white border-2 ${theme.border} rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300`}
        >
            {/* Header with Icon and Division Name */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center shadow-sm`}>
                    <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base">{division.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
                        {requestCount >= 10 ? 'High Load' : requestCount >= 5 ? 'Moderate' : 'Low'}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Request Load</span>
                    <span className="text-xs font-bold text-gray-900">{requestCount}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full ${getProgressColor()} rounded-full`}
                    />
                </div>
            </div>

            {/* Waste Type Breakdown */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Organic</p>
                        <p className="text-sm font-bold text-gray-900">{organicCount}</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Recycle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Recyclable</p>
                        <p className="text-sm font-bold text-gray-900">{recyclableCount}</p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            {requestCount >= 10 ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAssignClick(division.name)}
                    className="w-full bg-gradient-to-r from-[#5BB58C] to-[#4a9e76] hover:from-[#4a9e76] hover:to-[#3d8a63] text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <Truck className="w-4 h-4" />
                    Auto-Assign Driver
                </motion.button>
            ) : (
                <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 font-semibold py-2.5 px-4 rounded-xl cursor-not-allowed"
                >
                    Threshold Not Reached
                </button>
            )}
        </motion.div>
    );
};

const DivisionInsightCards = ({ divisions, divisionStats, loading, onAssignClick }) => {
    if (loading) {
        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Division Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full mb-4"></div>
                            <div className="h-16 bg-gray-100 rounded-xl mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">Division Insights</h2>
                <p className="text-sm text-gray-600 mt-1">Real-time load monitoring and waste type distribution</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {divisions.map((division) => {
                    const stats = divisionStats[division.name] || { count: 0, organic: 0, recyclable: 0 };
                    return (
                        <DivisionInsightCard
                            key={division.id}
                            division={division}
                            requestCount={stats.count}
                            wasteBreakdown={{ organic: stats.organic, recyclable: stats.recyclable }}
                            onAssignClick={onAssignClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default DivisionInsightCards;
