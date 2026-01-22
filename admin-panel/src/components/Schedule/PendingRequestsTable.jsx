import React from 'react';
import { Calendar, MapPin, Leaf, Recycle } from 'lucide-react';

const PendingRequestsTable = ({
    requests,
    loading,
    selectedRequestIds,
    onSelectRequest,
    onSelectAll,
    onOpenAssignModal
}) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' - ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const isAllSelected = requests.length > 0 && selectedRequestIds.length === requests.length;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="p-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center px-6 py-4 border-b border-gray-50">
                            <div className="w-4 h-4 rounded bg-gray-100 animate-pulse mr-6"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-3 w-1/4 bg-gray-50 rounded animate-pulse"></div>
                            </div>
                            <div className="w-20 h-6 bg-gray-100 rounded animate-pulse ml-4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Pending Requests</h2>
            <p className="text-sm text-gray-500 mb-6">Select requests to assign a driver.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-800 text-white text-xs uppercase font-semibold tracking-wide">
                                <th className="px-5 py-3.5 w-12">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                        className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-5 py-3.5">Citizen</th>
                                <th className="px-5 py-3.5">Division</th>
                                <th className="px-5 py-3.5">Waste Type</th>
                                <th className="px-5 py-3.5">Date & Time</th>
                                <th className="px-5 py-3.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Calendar className="w-16 h-16 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No pending requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => {
                                    const isSelected = selectedRequestIds.includes(req.id);
                                    return (
                                        <tr
                                            key={req.id}
                                            className={`transition-all duration-150 ${isSelected
                                                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onSelectRequest(req.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-start">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm">
                                                            {req.citizens?.full_name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {req.citizens?.location || 'Location N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                    {req.division}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {(req.waste_type || []).map((type, idx) => {
                                                        const isOrganic = type.toLowerCase().includes('organic');
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-fit ${isOrganic
                                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                                    }`}
                                                            >
                                                                {isOrganic ? (
                                                                    <Leaf className="w-3 h-3 mr-1" />
                                                                ) : (
                                                                    <Recycle className="w-3 h-3 mr-1" />
                                                                )}
                                                                {type}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(req.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => onOpenAssignModal([req.id])}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
                                                >
                                                    Assign
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PendingRequestsTable;
