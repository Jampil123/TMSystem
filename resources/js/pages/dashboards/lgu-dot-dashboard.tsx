import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BarChart3, Users, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Location {
    id: number;
    name: string;
    currentVisitors: number;
    capacity: number;
    crowdLevel: string;
    guides: number;
    percentageCapacity: number;
}

interface Alert {
    id: number;
    type: string;
    message: string;
    severity: string;
    created_at: string;
}

interface DashboardData {
    totalVisitorsToday: number;
    activeLocations: number;
    deployedGuides: number;
    activeAlerts: number;
    locations: Location[];
    alerts: Alert[];
    pendingOperators: any[];
    pendingGuides: any[];
    pendingServices: any[];
    pendingUsers: any[];
    timestamp: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'LGU/DOT Dashboard', href: '/lgu-dot-dashboard' },
];

interface Props {
    initialData: DashboardData;
}

export default function LGUDOTDashboard({ initialData }: Props) {
    const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/data', {
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
                setLastUpdate(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Set up auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        // Fetch immediately on mount
        fetchDashboardData();

        // Set up interval for auto-refresh (every 30 seconds)
        const interval = setInterval(fetchDashboardData, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Resolve an alert
    const handleResolveAlert = async (alertId: number) => {
        try {
            const response = await fetch(`/api/dashboard/alerts/${alertId}/resolve`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                // Remove the resolved alert from the list
                setDashboardData(prev => ({
                    ...prev,
                    alerts: prev.alerts.filter(a => a.id !== alertId),
                    activeAlerts: prev.activeAlerts - 1,
                }));
            }
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    };

    const getCrowdLevelColor = (level: string) => {
        switch (level) {
            case 'High':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="LGU/DOT Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                

                {/* Key Metrics - Top Row */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-gradient-to-r from-[#0F2A1D] to-[#375534] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#AEC3B0] mb-1">Total Visitors Today</p>
                                <p className="text-2xl font-bold text-white">{dashboardData.totalVisitorsToday}</p>
                            </div>
                            <Users className="w-8 h-8 text-[#AEC3B0]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-gradient-to-r from-[#0F2A1D] to-[#375534] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#AEC3B0] mb-1">Active Locations</p>
                                <p className="text-2xl font-bold text-white">{dashboardData.activeLocations}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-[#AEC3B0]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-gradient-to-r from-[#0F2A1D] to-[#375534] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#AEC3B0] mb-1">Deployed Guides</p>
                                <p className="text-2xl font-bold text-white">{dashboardData.deployedGuides}</p>
                            </div>
                            <Users className="w-8 h-8 text-[#AEC3B0]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-gradient-to-r from-[#0F2A1D] to-[#375534] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#AEC3B0] mb-1">Total Collections Today</p>
                                <p className="text-2xl font-bold text-white">₱45.2K</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-[#AEC3B0]" />
                        </div>
                    </div>
                </div>

                {/* Middle Section: Entrance Fees & Alerts/Pending */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left - Entrance Fees Statistics */}
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Entrance Fees Statistics</h2>
                        </div>
                        <div className="p-6">
                            {/* Revenue Chart */}
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { month: 'Jan', revenue: 32000, target: 28000 },
                                            { month: 'Feb', revenue: 28000, target: 28000 },
                                            { month: 'Mar', revenue: 35000, target: 30000 },
                                            { month: 'Apr', revenue: 24000, target: 28000 },
                                            { month: 'May', revenue: 33000, target: 30000 },
                                            { month: 'Jun', revenue: 45000, target: 35000 },
                                            { month: 'Jul', revenue: 28000, target: 28000 },
                                            { month: 'Aug', revenue: 22000, target: 25000 },
                                            { month: 'Sep', revenue: 38000, target: 32000 },
                                            { month: 'Oct', revenue: 28000, target: 28000 },
                                            { month: 'Nov', revenue: 32000, target: 30000 },
                                            { month: 'Dec', revenue: 35000, target: 32000 },
                                        ]}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#AEC3B0" opacity={0.3} />
                                        <XAxis 
                                            dataKey="month" 
                                            stroke="#6B8071"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis 
                                            stroke="#6B8071"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#0F2A1D',
                                                border: '1px solid #375534',
                                                borderRadius: '8px',
                                                color: '#E3EED4',
                                            }}
                                            formatter={(value: any) => value ? `₱${Number(value).toLocaleString()}` : '₱0'}
                                        />
                                        <Legend 
                                            wrapperStyle={{ color: '#6B8071' }}
                                            iconType="square"
                                        />
                                        <Bar 
                                            dataKey="revenue" 
                                            fill="#375534" 
                                            name="Entrance Fees"
                                            radius={[8, 8, 0, 0]}
                                        />
                                        <Bar 
                                            dataKey="target" 
                                            fill="#AEC3B0" 
                                            name="Target"
                                            radius={[8, 8, 0, 0]}
                                            opacity={0.6}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Alerts and Pending Cards */}
                    <div className="flex flex-col gap-6">
                        {/* System Alerts Card */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">System Alerts</h2>
                            </div>
                            <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20 max-h-64 overflow-y-auto">
                                {dashboardData.alerts.length === 0 ? (
                                    <div className="p-4 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                        No active alerts
                                    </div>
                                ) : (
                                    dashboardData.alerts.map((alert) => (
                                        <div key={alert.id} className="p-4 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                                    alert.severity === 'critical' ? 'bg-red-500' : 
                                                    alert.severity === 'high' ? 'bg-orange-500' :
                                                    alert.severity === 'medium' ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#0F2A1D] dark:text-white break-words">{alert.message}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge className={getSeverityColor(alert.severity)}>
                                                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                                        </Badge>
                                                        <button
                                                            onClick={() => handleResolveAlert(alert.id)}
                                                            className="text-xs text-[#6B8071] dark:text-[#AEC3B0] hover:text-[#0F2A1D] dark:hover:text-white transition-colors"
                                                        >
                                                            Resolve
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Pending Approvals Card */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Pending Approvals</h2>
                            </div>
                            <div className="p-6">
                                {(() => {
                                    const operatorCount = dashboardData.pendingOperators?.length || 0;
                                    const guideCount = dashboardData.pendingGuides?.length || 0;
                                    const serviceCount = dashboardData.pendingServices?.length || 0;
                                    const userCount = dashboardData.pendingUsers?.length || 0;
                                    const totalPending = operatorCount + guideCount + serviceCount + userCount;

                                    if (totalPending === 0) {
                                        return (
                                            <div className="text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                                No pending approvals
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 text-sm">
                                            {operatorCount > 0 && (
                                                <div className="text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                                    {operatorCount} New Tour Operators
                                                </div>
                                            )}
                                            {guideCount > 0 && (
                                                <div className="text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                                    {guideCount} Guide Applications
                                                </div>
                                            )}
                                            {serviceCount > 0 && (
                                                <div className="text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                                    {serviceCount} Service Registration
                                                </div>
                                            )}
                                            {userCount > 0 && (
                                                <div className="text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                                    {userCount} User Registration
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom - Attraction Monitoring Table */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Attraction Monitoring</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Visitors</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Capacity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Level</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guides</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.locations.map((location) => (
                                    <tr key={location.id} className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                        <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{location.name}</td>
                                        <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{location.currentVisitors}</td>
                                        <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{location.capacity}</td>
                                        <td className="py-3 px-4">
                                            <Badge className={getCrowdLevelColor(location.crowdLevel)}>
                                                {location.crowdLevel} ({location.percentageCapacity}%)
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{location.guides}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
