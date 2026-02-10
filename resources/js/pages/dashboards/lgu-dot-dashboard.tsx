import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BarChart3, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'LGU/DOT Dashboard', href: '/lgu-dot-dashboard' },
];

const locations = [
    { id: 1, name: 'Rizal Park', currentVisitors: 342, capacity: 500, crowdLevel: 'Medium', guides: 8 },
    { id: 2, name: 'Intramuros', currentVisitors: 187, capacity: 300, crowdLevel: 'Low', guides: 5 },
    { id: 3, name: 'Boracay Beach', currentVisitors: 456, capacity: 600, crowdLevel: 'High', guides: 12 },
];

const alerts = [
    { id: 1, type: 'crowd', message: 'Boracay Beach approaching capacity', severity: 'warning' },
    { id: 2, type: 'guide', message: '2 guides unaccounted for at Intramuros', severity: 'critical' },
];

export default function LGUDOTDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="LGU/DOT Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="rounded-2xl bg-gradient-to-r from-[#0F2A1D] to-[#375534] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">LGU/DOT Administration Panel</h1>
                    <p className="text-[#E3EED4]">Real-time monitoring of tourist activity, crowd control, and guide deployment</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Total Visitors Today</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">985</p>
                            </div>
                            <Users className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Active Locations</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">42</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Deployed Guides</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">156</p>
                            </div>
                            <Users className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Active Alerts</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">2</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Location Monitoring</h2>
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
                                    {locations.map((location) => (
                                        <tr key={location.id} className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                            <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{location.name}</td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{location.currentVisitors}</td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{location.capacity}</td>
                                            <td className="py-3 px-4">
                                                <Badge 
                                                    className={
                                                        location.crowdLevel === 'High' 
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            : location.crowdLevel === 'Medium'
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    }
                                                >
                                                    {location.crowdLevel}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{location.guides}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">System Alerts</h2>
                        </div>
                        <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="p-4 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-[#0F2A1D] dark:text-white">{alert.message}</p>
                                            <Badge className={alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mt-2' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 mt-2'}>
                                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
