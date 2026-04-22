import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Users, Maximize2, AlertTriangle, TrendingUp, Clock, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'Real-Time Visitor Counter', href: '/staff/visitor-counter' },
];

interface CapacityRecord {
    time: string;
    count: number;
}

interface Arrival {
    id: number;
    guest_name: string;
    total_guests: number;
    guide_name: string;
    arrival_time: string;
    service_name: string;
    status: string;
}

interface CapacityRule {
    max_visitors: number;
    warning_threshold_percent: number;
    critical_threshold_percent: number;
    max_guests_per_guide: number;
    max_daily_visitors: number;
}

interface Attraction {
    id: number;
    name: string;
    location: string | null;
    category: string | null;
}

interface Props {
    attraction: Attraction;
    capacityRule: CapacityRule;
}

export default function VisitorCounter({ attraction, capacityRule }: Props) {
    const [maximumCapacity, setMaximumCapacity] = useState(capacityRule.max_visitors);
    const [currentVisitors, setCurrentVisitors] = useState(0);
    const [previousVisitors, setPreviousVisitors] = useState(0);
    const [capacityPercentage, setCapacityPercentage] = useState(0);
    const [remainingCapacity, setRemainingCapacity] = useState(capacityRule.max_visitors);
    const [capacityHistory, setCapacityHistory] = useState<CapacityRecord[]>([]);
    const [recentArrivals, setRecentArrivals] = useState<Arrival[]>([]);
    const [capacityLoading, setCapacityLoading] = useState(true);
    const [arrivalsLoading, setArrivalsLoading] = useState(true);

    // Fetch real-time capacity status
    const fetchCapacityStatus = async () => {
        try {
            const response = await fetch('/staff/api/visitor-count');
            const data = await response.json();
            if (data.success) {
                const currentCount = data.data.current_visitors;
                const maxCap = capacityRule.max_visitors;
                const percentage = maxCap > 0 ? (currentCount / maxCap) * 100 : 0;
                const remaining = Math.max(0, maxCap - currentCount);

                setPreviousVisitors(currentVisitors);
                setCurrentVisitors(currentCount);
                setMaximumCapacity(maxCap);
                setCapacityPercentage(percentage);
                setRemainingCapacity(remaining);
                setCapacityLoading(false);
            }
        } catch (error) {
            console.error('Error fetching capacity status:', error);
            setCapacityLoading(false);
        }
    };

    // Fetch recent arrivals
    const fetchRecentArrivals = async () => {
        try {
            const response = await fetch('/staff/api/recent-arrivals');
            const data = await response.json();
            if (data.success) {
                setRecentArrivals((data.data || []).slice(0, 5));
                setArrivalsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching arrivals:', error);
            setArrivalsLoading(false);
        }
    };

    // Fetch capacity history (hourly data for today)
    const fetchCapacityHistory = async () => {
        try {
            const response = await fetch('/staff/api/capacity-history');
            const data = await response.json();
            if (data.success && data.data) {
                setCapacityHistory(data.data);
            }
        } catch (error) {
            console.error('Error fetching capacity history:', error);
        }
    };

    // Initial load and set up intervals
    useEffect(() => {
        fetchCapacityStatus();
        fetchRecentArrivals();
        fetchCapacityHistory();

        const capacityInterval = setInterval(fetchCapacityStatus, 10000); // Every 10 seconds
        const arrivalsInterval = setInterval(fetchRecentArrivals, 15000); // Every 15 seconds
        const historyInterval = setInterval(fetchCapacityHistory, 30000); // Every 30 seconds

        return () => {
            clearInterval(capacityInterval);
            clearInterval(arrivalsInterval);
            clearInterval(historyInterval);
        };
    }, []);

    const visitorChange = currentVisitors - previousVisitors;
    const isWarning = capacityPercentage >= capacityRule.warning_threshold_percent;
    const isCritical = capacityPercentage >= capacityRule.critical_threshold_percent;

    const getCapacityStatus = () => {
        if (isCritical) return { text: 'CRITICAL', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', border: 'border-red-200' };
        if (isWarning) return { text: 'WARNING', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', border: 'border-yellow-200' };
        return { text: 'SAFE', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', border: 'border-green-200' };
    };

    const status = getCapacityStatus();

    const getCircleColor = () => {
        if (isCritical) return 'text-red-500';
        if (isWarning) return 'text-yellow-500';
        return 'text-green-500';
    };

    // Mock departures for now (would need API endpoint)
    const recentDepartures = [
        { id: 1, time: '10:30 AM', group: 'Group A123', guests: 8, guide: 'Maria Garcia' },
        { id: 2, time: '10:15 AM', group: 'Group B456', guests: 12, guide: 'Juan Santos' },
        { id: 3, time: '09:50 AM', group: 'Group C789', guests: 10, guide: 'Ana Cruz' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Real-Time Visitor Counter" />
            <div className="space-y-6 p-8 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#375534] to-[#0F2A1D] rounded-lg p-6 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">Real-Time Visitor Counter</h1>
                        <p className="mt-1 text-sm text-[#E3EED4]">Live capacity monitoring and visitor tracking</p>
                    </div>
                    <Activity className="h-12 w-12 text-[#E3EED4]" />
                </div>

                {/* Main Capacity Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Current Visitors */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Inside</p>
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className={`text-3xl font-bold ${getCircleColor()}`}>{capacityLoading ? '...' : currentVisitors}</p>
                        <div className="flex items-center gap-1 mt-2">
                            {!capacityLoading && (
                                <>
                                    {visitorChange > 0 ? (
                                        <><ArrowUp className="h-4 w-4 text-green-500" /><span className="text-xs text-green-600 dark:text-green-400">+{visitorChange} just arrived</span></>
                                    ) : visitorChange < 0 ? (
                                        <><ArrowDown className="h-4 w-4 text-orange-500" /><span className="text-xs text-orange-600 dark:text-orange-400">{visitorChange} departed</span></>
                                    ) : (
                                        <span className="text-xs text-gray-500 dark:text-gray-500">Stable</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Remaining Capacity */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                            <Maximize2 className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{capacityLoading ? '...' : remainingCapacity}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">spots available</p>
                    </div>

                    {/* Maximum Capacity */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum</p>
                            <Users className="h-5 w-5 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{maximumCapacity}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">site capacity</p>
                    </div>

                    {/* Status */}
                    <div className={`rounded-lg border p-6 ${status.bgColor} ${status.border}`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                            {isCritical ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Activity className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${status.color} animate-pulse`}></div>
                            <p className={`text-2xl font-bold ${status.textColor}`}>{status.text}</p>
                        </div>
                        <p className={`text-xs mt-2 ${status.textColor}`}>{capacityLoading ? 'Loading...' : capacityPercentage.toFixed(1)}% utilized</p>
                    </div>
                </div>

                {/* Capacity Progress */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capacity Status</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{capacityLoading ? 'Loading...' : `${currentVisitors} / ${maximumCapacity} visitors`}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{capacityLoading ? 'Loading...' : capacityPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 rounded-full ${
                                        isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">Safe Zone</p>
                                <p className="font-semibold text-green-600 dark:text-green-400">0–{capacityRule.warning_threshold_percent}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">Warning Zone</p>
                                <p className="font-semibold text-yellow-600 dark:text-yellow-400">{capacityRule.warning_threshold_percent}–{capacityRule.critical_threshold_percent}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">Critical Zone</p>
                                <p className="font-semibold text-red-600 dark:text-red-400">{capacityRule.critical_threshold_percent}–100%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visitor Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Arrivals */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Recent Arrivals
                        </h2>
                        <div className="space-y-3">
                            {arrivalsLoading ? (
                                <div className="text-center p-4 text-gray-500 dark:text-gray-400">Loading arrivals...</div>
                            ) : recentArrivals.length === 0 ? (
                                <div className="text-center p-4 text-gray-500 dark:text-gray-400">No recent arrivals</div>
                            ) : (
                                recentArrivals.map((arrival) => (
                                    <div key={arrival.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-slate-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{arrival.guest_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{arrival.guide_name} • {arrival.total_guests} guests</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">{arrival.arrival_time}</p>
                                            <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Logged</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Departures */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Recent Departures
                        </h2>
                        <div className="space-y-3">
                            {recentDepartures.map((departure) => (
                                <div key={departure.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{departure.group}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{departure.guide} • {departure.guests} guests</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">{departure.time}</p>
                                        <Badge className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Departed</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hourly Trend Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visitor Trend (Today)</h2>
                    <div className="space-y-4">
                        {capacityHistory.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                <p>No visitor history available yet</p>
                                <p className="text-xs mt-2">Charts will update as visitors arrive</p>
                            </div>
                        ) : (
                            capacityHistory.map((record, idx) => {
                                const height = (record.count / maximumCapacity) * 100;
                                const pct = (record.count / maximumCapacity) * 100;
                                const color = pct >= capacityRule.critical_threshold_percent ? 'bg-red-500' : pct >= capacityRule.warning_threshold_percent ? 'bg-yellow-500' : 'bg-green-500';
                                return (
                                    <div key={idx} className="flex items-end gap-3 h-8">
                                        <span className="w-12 text-xs font-medium text-gray-600 dark:text-gray-400">{record.time}</span>
                                        <div className="flex-1 flex items-end gap-1 bg-gray-100 dark:bg-slate-800 rounded-t">
                                            <div className={`${color} rounded-t-md transition-all`} style={{ height: `${Math.max(height, 5)}%`, width: '100%' }}></div>
                                        </div>
                                        <span className="w-12 text-right text-xs font-semibold text-gray-900 dark:text-white">{record.count}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
