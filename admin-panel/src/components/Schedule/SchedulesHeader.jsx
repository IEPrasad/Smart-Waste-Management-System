import React from 'react';
import { Filter } from 'lucide-react';

const SchedulesHeader = ({ divisions, selectedDivision, onDivisionChange }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
                <p className="text-gray-600 mt-2 text-sm">Manage pending requests and driver assignments.</p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                    value={selectedDivision}
                    onChange={(e) => onDivisionChange(e.target.value)}
                    className="pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm cursor-pointer hover:border-gray-300 hover:shadow-md"
                >
                    <option value="All">All Divisions</option>
                    {divisions.map((div) => (
                        <option key={div.id} value={div.name}>
                            {div.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SchedulesHeader;
