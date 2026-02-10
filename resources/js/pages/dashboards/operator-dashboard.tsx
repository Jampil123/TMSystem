import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
];

const bookings = [
    { id: 1, date: '2025-02-12', guests: 8, guide: 'Maria Garcia', status: 'Confirmed' },
    { id: 2, date: '2025-02-14', guests: 12, guide: 'Juan Santos', status: 'Pending' },
    { id: 3, date: '2025-02-15', guests: 6, guide: 'Ana Cruz', status: 'Confirmed' },
];

const guideAssignments = [
    { id: 1, name: 'Maria Garcia', available: true, assignedTours: 3 },
    { id: 2, name: 'Juan Santos', available: false, assignedTours: 4 },
    { id: 3, name: 'Ana Cruz', available: true, assignedTours: 2 },
];

export default function OperatorDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Operator Control Panel</h1>
                    <p className="text-[#E3EED4]">Manage your profile, bookings, guides, and availability</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Upcoming Bookings</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">12</p>
                            </div>
                            <Calendar className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Active Guides</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">7</p>
                            </div>
                            <Users className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Avg. Tour Duration</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">4.5 hrs</p>
                            </div>
                            <Clock className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Rating</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">4.7 ★</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Upcoming Bookings</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guests</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Assigned Guide</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                            <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4]">{booking.date}</td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{booking.guests} guests</td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">{booking.guide}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}>
                                                    {booking.status}
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
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guide Assignments</h2>
                        </div>
                        <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                            {guideAssignments.map((guide) => (
                                <div key={guide.id} className="p-4 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-[#0F2A1D] dark:text-white text-sm">{guide.name}</h3>
                                        <Badge className={guide.available ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}>
                                            {guide.available ? 'Available' : 'Busy'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{guide.assignedTours} assigned tours</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
