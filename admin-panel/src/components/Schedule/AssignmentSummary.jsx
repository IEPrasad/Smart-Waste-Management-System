import React from 'react';
import { Clock, Calendar, Radio } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, bgColor, iconColor, iconBgColor }) => (
    <div className={`${bgColor} border border-gray-200 rounded-2xl p-5 transition-all hover:shadow-md duration-200 flex items-start gap-4`}>
        <div className={`${iconBgColor} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex flex-col">
            <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const AssignmentSummary = ({ totalPending, scheduledToday, availableDrivers }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <SummaryCard
                title="Pending Requests"
                value={totalPending}
                icon={Clock}
                bgColor="bg-orange-50/50"
                iconColor="text-orange-600"
                iconBgColor="bg-white"
            />
            <SummaryCard
                title="Scheduled Today"
                value={scheduledToday}
                icon={Calendar}
                bgColor="bg-blue-50/50"
                iconColor="text-blue-600"
                iconBgColor="bg-white"
            />
            <SummaryCard
                title="Online Drivers"
                value={availableDrivers}
                icon={Radio}
                bgColor="bg-green-50/50"
                iconColor="text-green-600"
                iconBgColor="bg-white"
            />
        </div>
    );
};

export default AssignmentSummary;
