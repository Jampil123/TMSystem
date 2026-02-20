import { Head } from '@inertiajs/react';
import TouristLayout from '@/layouts/app/tourist-layout';
import { TrendingUp, Calendar, DollarSign, Users, MapPin, Download } from 'lucide-react';

export default function ReportsAnalytics() {
    return (
        <TouristLayout>
            <Head title="Reports & Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
                        <p className="text-[#E3EED4]">Analyze your travel patterns and spending</p>
                    </div>
                    <button className="px-6 py-3 rounded-lg bg-white text-[#375534] hover:bg-[#E3EED4] transition-colors font-medium flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export Report
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-2">Total Spending</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">$3,450</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-[#C84B59]" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-2">Total Trips</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">12</p>
                            </div>
                            <MapPin className="w-8 h-8 text-[#375534]" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-2">Days Traveled</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">45</p>
                            </div>
                            <Calendar className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-2">Countries Visited</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">8</p>
                            </div>
                            <Users className="w-8 h-8 text-[#375534]" />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending by Category */}
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-6">Spending by Category</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Accommodations', value: 45, amount: '$1,552' },
                                { label: 'Activities', value: 30, amount: '$1,035' },
                                { label: 'Attractions', value: 15, amount: '$518' },
                                { label: 'Transportation', value: 10, amount: '$345' },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-[#0F2A1D] dark:text-white font-medium">{item.label}</span>
                                        <span className="text-sm font-semibold text-[#C84B59] dark:text-[#E89BA3]">{item.amount}</span>
                                    </div>
                                    <div className="h-3 bg-[#AEC3B0]/20 dark:bg-[#375534]/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#375534] to-[#6B8071]"
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Spending Trend */}
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                        <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-6">Monthly Spending Trend</h3>
                        <div className="flex items-end gap-3 h-48">
                            {[
                                { month: 'Jan', amount: 250 },
                                { month: 'Feb', amount: 450 },
                                { month: 'Mar', amount: 380 },
                                { month: 'Apr', amount: 520 },
                                { month: 'May', amount: 680 },
                                { month: 'Jun', amount: 570 },
                            ].map((item) => (
                                <div key={item.month} className="flex flex-col items-center flex-1 gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#375534] to-[#6B8071] rounded-t-lg"
                                        style={{ height: `${(item.amount / 700) * 140}px` }}
                                    ></div>
                                    <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Destinations */}
                <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] p-6">
                    <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-6">Top Destinations</h3>
                    <div className="space-y-4">
                        {[
                            { rank: 1, destination: 'Bali, Indonesia', visits: 3, spent: '$1,200' },
                            { rank: 2, destination: 'Paris, France', visits: 2, spent: '$850' },
                            { rank: 3, destination: 'Barcelona, Spain', visits: 1, spent: '$600' },
                            { rank: 4, destination: 'Tokyo, Japan', visits: 1, spent: '$800' },
                        ].map((item) => (
                            <div key={item.destination} className="flex items-center justify-between pb-4 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-[#C84B59]">#{item.rank}</span>
                                    <div>
                                        <p className="font-medium text-[#0F2A1D] dark:text-white">{item.destination}</p>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{item.visits} visit(s)</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-[#C84B59] dark:text-[#E89BA3]">{item.spent}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </TouristLayout>
    );
}
