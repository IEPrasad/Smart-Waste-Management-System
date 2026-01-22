import React from 'react';
import { MapPin, Truck, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const DivisionStatsCards = ({ divisions, divisionCounts, loading, onAssignClick }) => {

    const getCardStyle = (count) => {
        if (count >= 10) {
            return {
                status: 'High Load',
                statusClass: 'bg-red-100 text-red-700',
                iconGradient: 'from-red-400 to-red-600',
                requestsColor: 'text-red-600'
            };
        } else if (count >= 5) {
            return {
                status: 'Moderate',
                statusClass: 'bg-yellow-100 text-yellow-700',
                iconGradient: 'from-yellow-400 to-yellow-600',
                requestsColor: 'text-yellow-600'
            };
        } else {
            return {
                status: 'Low',
                statusClass: 'bg-green-100 text-green-700',
                iconGradient: 'from-green-400 to-green-600',
                requestsColor: 'text-green-600'
            };
        }
    };

    if (loading) {
        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Real-time citizen requests by division</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="h-14 w-14 bg-gray-100 rounded-full mb-3"></div>
                            <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Real-time citizen requests by division</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {divisions.map((division) => {
                    const count = divisionCounts[division.name] || 0;
                    const style = getCardStyle(count);

                    return (
                        <motion.div
                            key={division.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6"
                        >
                            {/* Profile Section */}
                            <div className="flex items-center gap-3.5">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${style.iconGradient} flex items-center justify-center flex-shrink-0 border-3 border-gray-100 shadow-sm`}>
                                    <MapPin className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <h3 className="font-semibold text-base text-gray-900 truncate">
                                        {division.name}
                                    </h3>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit uppercase tracking-wide ${style.statusClass}`}>
                                        {style.status}
                                    </span>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="flex flex-col gap-2.5 p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2.5">
                                    <Package className="w-4.5 h-4.5 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 font-medium min-w-[60px]">Requests</span>
                                    <span className={`text-sm font-semibold ml-auto ${style.requestsColor}`}>
                                        {count} {count === 1 ? 'pending' : 'pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {count >= 10 ? (
                                <button
                                    onClick={() => onAssignClick(division.name)}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                >
                                    <Truck className="w-4 h-4" />
                                    Assign to Driver
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed"
                                >
                                    No Action Required
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* No Divisions State */}
            {divisions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No divisions configured</p>
                    <p className="text-sm mt-1">Add divisions to see request statistics</p>
                </div>
            )}
        </div>
    );
};

export default DivisionStatsCards;
