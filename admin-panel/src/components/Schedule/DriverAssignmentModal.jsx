import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, User, CheckCircle } from 'lucide-react';

const DriverAssignmentModal = ({ isOpen, onClose, drivers, onAssign, isAssigning }) => {
    const [selectedDriverId, setSelectedDriverId] = useState(null);

    const handleAssign = () => {
        if (selectedDriverId) {
            onAssign(selectedDriverId);
            setSelectedDriverId(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Select Driver</h2>
                                    <p className="text-sm text-gray-500">Choose an available driver for this assignment.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {drivers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <User className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium">No drivers online</p>
                                        <p className="text-sm mt-1">Wait for a driver to come online.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {drivers.map((driver) => (
                                            <div
                                                key={driver.id}
                                                onClick={() => setSelectedDriverId(driver.id)}
                                                className={`group relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedDriverId === driver.id
                                                        ? 'border-primary-green bg-green-50/50 shadow-sm'
                                                        : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-md hover:border-gray-200'
                                                    }`}
                                            >
                                                {/* Selection Indicator */}
                                                <div className={`absolute top-4 right-4 ${selectedDriverId === driver.id ? 'text-primary-green' : 'text-transparent'}`}>
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>

                                                {/* Avatar */}
                                                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 font-bold mr-4 shadow-sm text-lg">
                                                    {driver.profile_url ? (
                                                        <img src={driver.profile_url} alt={driver.full_name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        driver.full_name ? driver.full_name.charAt(0) : 'D'
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 pr-8">
                                                    <h3 className="font-semibold text-gray-900">{driver.full_name}</h3>
                                                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                                                        <span className="flex items-center">
                                                            <Truck className="w-3 h-3 mr-1" />
                                                            {driver.vehicles?.license_plate || 'No Vehicle'}
                                                        </span>
                                                        <span className="flex items-center text-green-600 font-medium">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                                            Online
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedDriverId || isAssigning}
                                    className={`px-6 py-2 rounded-lg text-white font-medium shadow-sm transition-all transform active:scale-95 ${!selectedDriverId || isAssigning
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                            : 'bg-primary-green hover:bg-[#4aa07b] hover:shadow-md'
                                        }`}
                                >
                                    {isAssigning ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Assigning...
                                        </span>
                                    ) : 'Confirm Assignment'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DriverAssignmentModal;
