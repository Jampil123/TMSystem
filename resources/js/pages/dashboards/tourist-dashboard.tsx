import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Landmark, MapPin, AlertCircle, Users } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tourist Dashboard', href: '/tourist-dashboard' },
];

const attractions = [
    { id: 1, name: 'Rizal Monument', location: 'Rizal Park', visitors: '2,543', rating: '4.8' },
    { id: 2, name: 'Intramuros', location: 'Manila', visitors: '1,892', rating: '4.6' },
    { id: 3, name: 'Boracay Beach', location: 'Aklan', visitors: '3,456', rating: '4.9' },
];

const announcements = [
    { id: 1, title: 'Safety Alert', message: 'Avoid Rizal Park during evening hours', type: 'warning' },
    { id: 2, title: 'New Attraction', message: 'Visit the new Heritage Museum in Manila', type: 'info' },
];

export default function TouristDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tourist Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="rounded-2xl bg-gradient-to-r from-[#375534] to-[#6B8071] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Tourism Portal</h1>
                    <p className="text-[#E3EED4]">Discover attractions, view safety information, and plan your visit</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Popular Attractions</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">847</p>
                            </div>
                            <Landmark className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Registered Guides</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">234</p>
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
                            <MapPin className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Safety Alerts</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">3</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Featured Attractions</h2>
                        </div>
                        <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                            {attractions.map((attraction) => (
                                <div key={attraction.id} className="p-6 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors cursor-pointer">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-[#0F2A1D] dark:text-white">{attraction.name}</h3>
                                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">★ {attraction.rating}</span>
                                    </div>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-2 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {attraction.location}
                                    </p>
                                    <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071]">{attraction.visitors} visitors this month</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Announcements</h2>
                        </div>
                        <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="p-4 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${announcement.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                        <div>
                                            <h3 className="font-semibold text-sm text-[#0F2A1D] dark:text-white">{announcement.title}</h3>
                                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">{announcement.message}</p>
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
