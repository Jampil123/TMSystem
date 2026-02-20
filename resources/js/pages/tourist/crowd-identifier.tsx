import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { AlertCircle, Users, TrendingUp, MapPin } from 'lucide-react';

const crowdData = [
    {
        id: 1,
        location: 'Eiffel Tower',
        crowdLevel: 'Very High',
        percentage: 95,
        status: 'Not Recommended',
        estimated: '12,500 people',
        color: 'bg-red-500',
    },
    {
        id: 2,
        location: 'Louvre Museum',
        crowdLevel: 'High',
        percentage: 78,
        status: 'Busy',
        estimated: '8,000 people',
        color: 'bg-orange-500',
    },
    {
        id: 3,
        location: 'Arc de Triomphe',
        crowdLevel: 'Moderate',
        percentage: 55,
        status: 'Manageable',
        estimated: '4,200 people',
        color: 'bg-yellow-500',
    },
    {
        id: 4,
        location: 'Notre-Dame Cathedral',
        crowdLevel: 'Low',
        percentage: 32,
        status: 'Good Time',
        estimated: '1,800 people',
        color: 'bg-green-500',
    },
    {
        id: 5,
        location: 'Sacré-Cœur Basilica',
        crowdLevel: 'Low',
        percentage: 28,
        status: 'Good Time',
        estimated: '1,200 people',
        color: 'bg-green-500',
    },
];

export default function CrowdIdentifier() {
    return (
        <TouristLayout>
            <Head title="Crowd Identifier" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Crowd Identifier</h1>
                    <p className="text-[#E3EED4]">Real-time crowd analysis to plan your visits better</p>
                </div>

                {/* Alert */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Pro Tip</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">Visit popular attractions early morning or late evening for better experience.</p>
                    </div>
                </div>

                {/* Crowd Data Cards */}
                <div className="space-y-4">
                    {crowdData.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#C84B59]" />
                                    <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white">{item.location}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${item.color}`}>
                                    {item.crowdLevel}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Crowd Percentage</span>
                                    <span className="text-sm font-semibold text-[#0F2A1D] dark:text-white">{item.percentage}%</span>
                                </div>
                                <div className="h-2 bg-[#AEC3B0]/20 dark:bg-[#375534]/30 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} transition-all duration-300`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                                    <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">{item.estimated}</span>
                                </div>
                                <span className="text-sm font-medium text-[#0F2A1D] dark:text-white">{item.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                    <h3 className="font-semibold text-[#0F2A1D] dark:text-white mb-4">Crowd Level Guide</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Low (0-35%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Moderate (35-65%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">High (65-85%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Very High (85%+)</span>
                        </div>
                    </div>
                </div>
            </div>
        </TouristLayout>
    );
}
