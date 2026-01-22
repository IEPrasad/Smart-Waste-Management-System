import React, { useState } from 'react';
import {
    Clock, Calendar, Users, MapPin, Leaf, Recycle, Trash2,
    ChevronDown, Search, X, CheckCircle, AlertCircle, TrendingUp,
    Package, UserCheck, Bell, Filter, MoreVertical, ArrowRight, Truck
} from 'lucide-react';

const SchedulesDashboard = ({
    requests = [],
    drivers = [],
    divisions = [],
    selectedDivision,
    onDivisionChange,
    onAssignDriver,
    loading = false
}) => {
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('pending');

    const stats = [
        {
            label: 'Pending Requests',
            value: requests.length.toString(),
            change: '+12%',
            icon: Clock,
            gradient: 'from-amber-400 to-orange-500',
            bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
            iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500'
        },
        {
            label: "Today's Pickups",
            value: '156',
            change: '+8%',
            icon: Truck,
            gradient: 'from-blue-400 to-cyan-500',
            bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
            iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500'
        },
        {
            label: 'Online Drivers',
            value: drivers.filter(d => d.is_online).length.toString(),
            change: '100%',
            icon: UserCheck,
            gradient: 'from-emerald-400 to-green-500',
            bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
            iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500'
        }
    ];

    // Calculate division stats
    const divisionData = divisions.map(div => {
        const divRequests = requests.filter(r => r.division === div.name);
        const organic = divRequests.reduce((acc, r) => {
            return acc + (r.waste_type?.filter(t => t.toLowerCase().includes('organic')).length || 0);
        }, 0);
        const recyclable = divRequests.reduce((acc, r) => {
            return acc + (r.waste_type?.filter(t => !t.toLowerCase().includes('organic')).length || 0);
        }, 0);

        return {
            name: div.name,
            organic,
            recyclable,
            general: Math.floor(divRequests.length * 0.3),
            load: divRequests.length > 8 ? 'High' : divRequests.length > 4 ? 'Medium' : 'Low',
            color: divRequests.length > 8 ? 'amber' : divRequests.length > 4 ? 'purple' : 'emerald'
        };
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRequests(requests.map(r => r.id));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleSelectRequest = (id) => {
        setSelectedRequests(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleAssignDriverClick = (driverName, driverId) => {
        setIsDrawerOpen(false);
        setToastMessage({
            type: 'success',
            text: `Successfully assigned ${selectedRequests.length} pickup(s) to ${driverName}`
        });
        setShowToast(true);

        // Call parent handler
        if (onAssignDriver) {
            onAssignDriver(driverId, selectedRequests);
        }

        setSelectedRequests([]);
        setTimeout(() => setShowToast(false), 4000);
    };

    const getWasteTypeBadge = (type) => {
        const styles = {
            Recycling: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Recycle },
            Compost: { bg: 'bg-green-100', text: 'text-green-700', icon: Leaf },
            General: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Trash2 }
        };

        // Check if type contains keywords
        if (type.toLowerCase().includes('recycle')) return styles.Recycling;
        if (type.toLowerCase().includes('organic') || type.toLowerCase().includes('compost')) return styles.Compost;
        return styles.General;
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            High: 'bg-red-100 text-red-700 border-red-200',
            Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Low: 'bg-gray-100 text-gray-600 border-gray-200'
        };
        return styles[priority] || styles.Low;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
            date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30 font-sans">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-6 right-6 z-50 animate-slide-down">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-sm border ${toastMessage.type === 'success'
                            ? 'bg-white border-green-200'
                            : 'bg-white border-red-200'
                        }`}>
                        <div className={`p-2 rounded-lg ${toastMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {toastMessage.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {toastMessage.type === 'success' ? 'Success!' : 'Error'}
                            </p>
                            <p className="text-sm text-gray-600">{toastMessage.text}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        Schedules & Assignments
                                    </h1>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                        Live
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">Manage daily waste collection and optimize driver routes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="relative">
                                <select
                                    value={selectedDivision}
                                    onChange={(e) => onDivisionChange(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer shadow-sm"
                                >
                                    <option value="All">All Divisions</option>
                                    {divisions.map(div => (
                                        <option key={div.id} value={div.name}>{div.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* KPI Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`${stat.bg} rounded-2xl border border-white/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stat.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`${stat.iconBg} p-3.5 rounded-xl shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Division Insights */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-6 mb-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Division Load Overview</h2>
                            <p className="text-sm text-gray-600 mt-1">Real-time monitoring across all divisions</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {divisionData.map((div, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg bg-${div.color}-100`}>
                                            <MapPin className={`w-5 h-5 text-${div.color}-600`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{div.name}</p>
                                            <p className="text-xs text-gray-500">Load: {div.load}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <Leaf className="w-3.5 h-3.5 text-green-500" />
                                            Organic
                                        </span>
                                        <span className="font-semibold text-gray-900">{div.organic}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <Recycle className="w-3.5 h-3.5 text-blue-500" />
                                            Recyclable
                                        </span>
                                        <span className="font-semibold text-gray-900">{div.recyclable}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                                            General
                                        </span>
                                        <span className="font-semibold text-gray-900">{div.general}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'pending'
                                ? 'bg-white text-gray-900 shadow-md border border-gray-200'
                                : 'text-gray-600 hover:bg-white/60'
                            }`}
                    >
                        Pending Requests
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{requests.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'scheduled'
                                ? 'bg-white text-gray-900 shadow-md border border-gray-200'
                                : 'text-gray-600 hover:bg-white/60'
                            }`}
                    >
                        Scheduled
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">156</span>
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Active Pickup Requests</h2>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {selectedRequests.length > 0
                                            ? `${selectedRequests.length} request(s) selected`
                                            : 'Select requests to assign to drivers'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search requests..."
                                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-64"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(true)}
                                    disabled={selectedRequests.length === 0}
                                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center gap-2 ${selectedRequests.length > 0
                                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-green-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Assign to Driver
                                    {selectedRequests.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                                            {selectedRequests.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedRequests.length === requests.length && requests.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Citizen</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Waste Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Division</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Scheduled Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((request, idx) => (
                                    <tr
                                        key={request.id}
                                        className={`hover:bg-green-50/50 transition-all ${selectedRequests.includes(request.id) ? 'bg-green-50/30' : ''
                                            } ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRequests.includes(request.id)}
                                                onChange={() => handleSelectRequest(request.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                    {getInitials(request.citizens?.full_name || 'Unknown')}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{request.citizens?.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{request.citizens?.mobile_number || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {(request.waste_type || ['General']).map((type, typeIdx) => {
                                                    const badge = getWasteTypeBadge(type);
                                                    const Icon = badge.icon;
                                                    return (
                                                        <span key={typeIdx} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${badge.bg} ${badge.text} border border-gray-200`}>
                                                            <Icon className="w-3.5 h-3.5" />
                                                            {type}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                                {request.division}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(request.priority || 'Low')}`}>
                                                {request.priority || 'Low'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                {formatDate(request.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequests([request.id]);
                                                    setIsDrawerOpen(true);
                                                }}
                                                className="text-green-600 hover:text-green-700 font-semibold text-sm hover:underline flex items-center gap-1 group"
                                            >
                                                Assign
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-white flex items-center justify-between">
                        <p className="text-sm text-gray-600 font-medium">Showing 1-{requests.length} of {requests.length} results</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                Previous
                            </button>
                            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-semibold shadow-md">1</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">2</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">3</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Driver Assignment Drawer */}
            {isDrawerOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 px-6 py-5 flex justify-between items-center shadow-lg z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white">Assign to Driver</h3>
                                <p className="text-green-100 text-sm mt-1">
                                    {selectedRequests.length} pickup request(s) selected
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or vehicle..."
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Available Drivers</p>
                                    <span className="text-xs text-gray-500">{drivers.filter(d => d.is_online).length} online</span>
                                </div>
                                {drivers.filter(d => d.is_online).map((driver) => {
                                    // Calculate current load percentage (mock calculation)
                                    const load = 60;
                                    const tasks = 8;

                                    return (
                                        <div
                                            key={driver.id}
                                            className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-green-300 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                                            {getInitials(driver.full_name)}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-lg">{driver.full_name}</p>
                                                        <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                                                            <Truck className="w-3.5 h-3.5" />
                                                            {driver.vehicle_number || 'WM-' + driver.id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <p className="text-xs text-gray-600 mb-1 font-medium">Current Load</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <p className="text-2xl font-bold text-gray-900">{load}%</p>
                                                    </div>
                                                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${load > 70 ? 'bg-red-500' : load > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${load}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <p className="text-xs text-gray-600 mb-1 font-medium">Active Tasks</p>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-5 h-5 text-green-600" />
                                                        <p className="text-2xl font-bold text-gray-900">{tasks}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAssignDriverClick(driver.full_name, driver.id)}
                                                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3.5 rounded-xl font-bold text-sm hover:from-green-700 hover:to-green-600 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 group"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Confirm Assignment
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-800">
                                    <strong>Tip:</strong> Select drivers with lower current load for optimal route efficiency.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SchedulesDashboard;
