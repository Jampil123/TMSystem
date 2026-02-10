import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { LogIn, Users, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Entrance Staff Dashboard', href: '/staff-dashboard' },
];

const recentArrivals = [
    { id: 1, time: '09:45 AM', tourists: 8, guide: 'Maria Garcia', verified: true },
    { id: 2, time: '09:32 AM', tourists: 12, guide: 'Juan Santos', verified: true },
    { id: 3, time: '09:18 AM', tourists: 6, guide: 'Ana Cruz', verified: false },
    { id: 4, time: '09:05 AM', tourists: 15, guide: 'Carlos Mendoza', verified: true },
];

const staffStatus = [
    { id: 1, name: 'Gate A', currentStaff: 2, capacity: 2, status: 'Full' },
    { id: 2, name: 'Gate B', currentStaff: 1, capacity: 2, status: 'Available' },
    { id: 3, name: 'Gate C', currentStaff: 2, capacity: 2, status: 'Full' },
];

export default function StaffDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrance Staff Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Entrance Point Control</h1>
                    <p className="text-[#E3EED4]">Log arrivals, verify guides, and track real-time visitor counts</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Today's Arrivals</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">856</p>
                            </div>
                            <LogIn className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Current Staff</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">5</p>
                            </div>
                            <Users className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Avg. Processing</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">2.3 min</p>
                            </div>
                            <Clock className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Unverified</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">1</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Recent Arrivals Log</h2>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">Latest guest group arrivals and guide verification</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Time</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Tourists</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guide Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Verified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentArrivals.map((arrival) => (
                                        <tr key={arrival.id} className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                            <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{arrival.time}</td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.tourists} guests</td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.guide}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={arrival.verified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}>
                                                    {arrival.verified ? 'Verified' : 'Pending'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Gate Status</h2>
                        </div>
                        <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                            {staffStatus.map((gate) => (
                                <div key={gate.id} className="p-4 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-[#0F2A1D] dark:text-white text-sm">{gate.name}</h3>
                                        <Badge 
                                            className={
                                                gate.status === 'Full'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }
                                        >
                                            {gate.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-[#E3EED4] dark:bg-[#375534]/30 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#6B8071] to-[#375534]" 
                                                style={{ width: `${(gate.currentStaff / gate.capacity) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-[#6B8071] dark:text-[#AEC3B0]">{gate.currentStaff}/{gate.capacity}</span>
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
