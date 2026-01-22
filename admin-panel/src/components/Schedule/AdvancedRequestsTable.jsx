import React from 'react';
import { Calendar, MapPin, Leaf, Recycle, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CitizenAvatar = ({ name, photo }) => {
    const getInitials = (fullName) => {
        if (!fullName) return '?';
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return fullName[0].toUpperCase();
    };

    return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            {photo ? (
                <img src={photo} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
                getInitials(name)
            )}
        </div>
    );
};

const WasteTypeBadge = ({ type }) => {
    const isOrganic = type.toLowerCase().includes('organic');

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isOrganic
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
            {isOrganic ? <Leaf className="w-3 h-3" /> : <Recycle className="w-3 h-3" />}
            {type}
        </span>
    );
};

const TableRow = ({ request, isSelected, onSelect, onAssign }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
    };

    const { date, time } = formatDate(request.created_at);

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`border-b border-gray-100 transition-all duration-150 ${isSelected
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
        >
            {/* Checkbox */}
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(request.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
            </td>

            {/* Citizen */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <CitizenAvatar
                        name={request.citizens?.full_name}
                        photo={request.citizens?.photo_url}
                    />
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">
                            {request.citizens?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                            📞 {request.citizens?.mobile_number || 'N/A'}
                        </p>
                    </div>
                </div>
            </td>

            {/* Division */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{request.division}</span>
                </div>
            </td>

            {/* Waste Types */}
            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                    {(request.waste_type || []).map((type, idx) => (
                        <WasteTypeBadge key={idx} type={type} />
                    ))}
                </div>
            </td>

            {/* Date & Time */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">{date}</p>
                        <p className="text-xs text-gray-500">{time}</p>
                    </div>
                </div>
            </td>

            {/* Action */}
            <td className="px-6 py-4 text-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAssign([request.id])}
                    className="inline-flex items-center px-4 py-2 bg-[#5BB58C] hover:bg-[#4a9e76] text-white text-sm font-semibold rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
                >
                    Assign
                </motion.button>
            </td>
        </motion.tr>
    );
};

const AdvancedRequestsTable = ({
    requests,
    loading,
    selectedIds,
    onSelectRequest,
    onSelectAll,
    onAssignClick
}) => {
    const isAllSelected = requests.length > 0 && selectedIds.length === requests.length;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                </div>
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Empty State
    if (requests.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center"
            >
                <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">✅ All Caught Up!</h3>
                    <p className="text-gray-600 mb-1">No pending requests at the moment.</p>
                    <p className="text-sm text-gray-500">Relax and enjoy the calm. New requests will appear here.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Pending Requests</h2>
                <p className="text-sm text-gray-600 mt-1">Select requests to assign drivers</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-gray-800 text-white">
                        <tr className="text-xs uppercase font-semibold tracking-wide">
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 text-left">Citizen</th>
                            <th className="px-6 py-4 text-left">Division</th>
                            <th className="px-6 py-4 text-left">Waste Type</th>
                            <th className="px-6 py-4 text-left">Date & Time</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        <AnimatePresence>
                            {requests.map((request) => (
                                <TableRow
                                    key={request.id}
                                    request={request}
                                    isSelected={selectedIds.includes(request.id)}
                                    onSelect={onSelectRequest}
                                    onAssign={onAssignClick}
                                />
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdvancedRequestsTable;
