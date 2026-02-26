import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Eye, Search, Bell } from 'lucide-react';
import ServiceActionButton from '@/components/service-action-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Service Management', href: '/services' },
    { title: 'Pending Services', href: '/services/pending' },
];

interface ServiceData {
    service_id: number;
    service_name: string;
    service_type: string;
    operator: {
        id: number;
        name: string;
        email: string;
    };
    tourist_spot: {
        id: number;
        name: string;
    };
    created_at: string;
    activity?: {
        price_per_person: number;
    };
    accommodation?: {
        price_per_night: number;
    };
}

interface Props {
    services: {
        data: ServiceData[];
        links: any;
        meta: any;
    };
    totalPending: number;
}

export default function PendingServices({ services, totalPending }: Props) {
    const [search, setSearch] = useState('');

    const handleSearch = () => {
        router.get('/services/pending', { search: search || undefined });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Services" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-8 h-8 text-yellow-600" />
                        <h1 className="text-3xl font-bold text-[#0F2A1D] dark:text-white">Pending Services</h1>
                    </div>
                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                        {totalPending} service{totalPending !== 1 ? 's' : ''} awaiting approval
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 p-4">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                        <span className="text-2xl font-bold">{totalPending}</span> service{totalPending !== 1 ? 's' : ''} pending review
                    </p>
                </div>

                {/* Search */}
                <div className="rounded-lg bg-white dark:bg-[#375534]/20 p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-[#6B8071]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search by service name..."
                                className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 pl-10 pr-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-6 py-2 font-medium transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Services List */}
                {services.data && services.data.length > 0 ? (
                    <div className="grid gap-4">
                        {services.data.map((service: ServiceData) => (
                            <div
                                key={service.service_id}
                                className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white">
                                            {service.service_name}
                                        </h3>
                                        <p className="mt-1 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                            <span className="font-medium">Type:</span> {service.service_type}
                                        </p>
                                        <p className="mt-1 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                            <span className="font-medium">Operator:</span> {service.operator?.name}
                                        </p>
                                        <p className="mt-1 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                            <span className="font-medium">Location:</span> {service.tourist_spot?.name}
                                        </p>
                                        <p className="mt-2 text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                            Submitted: {new Date(service.created_at).toLocaleString()}
                                        </p>

                                        {/* Pricing Preview */}
                                        <div className="mt-3 pt-3 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                            {service.activity && (
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                    <span className="font-medium">Price:</span> ₱{service.activity.price_per_person} per person
                                                </p>
                                            )}
                                            {service.accommodation && (
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                    <span className="font-medium">Price:</span> ₱{service.accommodation.price_per_night} per night
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="inline-flex gap-2 flex-shrink-0">
                                        <ServiceActionButton 
                                            serviceId={service.service_id}
                                            currentStatus="Pending"
                                            compact={true}
                                        />
                                        <Link
                                            href={`/services/${service.service_id}`}
                                            className="inline-flex items-center gap-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-4 py-2 font-medium transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-12 text-center">
                        <Bell className="w-12 h-12 text-[#6B8071] dark:text-[#AEC3B0] mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium text-[#0F2A1D] dark:text-white mb-2">No Pending Services</p>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">
                            All services have been reviewed. Check back later for new submissions.
                        </p>
                    </div>
                )}

                {/* Back to All Services */}
                <Link
                    href="/services"
                    className="inline-flex items-center text-[#375534] dark:text-[#AEC3B0] hover:underline font-medium"
                >
                    ← Back to All Services
                </Link>
            </div>
        </AppLayout>
    );
}
