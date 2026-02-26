import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';
import ServiceActionButton from '@/components/service-action-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Service Management', href: '/services' },
    { title: 'Service Details', href: '#' },
];

interface ServiceData {
    service_id: number;
    service_name: string;
    service_type: string;
    status: string;
    description: string;
    facebook_url: string;
    created_at: string;
    approved_at: string;
    remarks: string;
    operator: {
        id: number;
        name: string;
        email: string;
    };
    tourist_spot: {
        id: number;
        name: string;
    };
    activity?: {
        activity_name: string;
        price_per_person: number;
        duration_minutes: number;
        max_participants: number;
        required_equipment: string;
    };
    accommodation?: {
        room_type: string;
        capacity: number;
        price_per_night: number;
        total_rooms: number;
    };
    approved_by_admin?: {
        id: number;
        name: string;
    };
}

interface Props {
    service: ServiceData;
    standardPrice?: {
        min: number;
        max: number;
        avg: number;
    };
    priceComparison?: {
        current_price: number;
        standard_avg: number;
        standard_min: number;
        standard_max: number;
        percentage_deviation: number;
        price_type: string;
        status: string;
    };
}

export default function ServiceShow({ service, standardPrice, priceComparison }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'Rejected':
                return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            case 'Revision Required':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
        }
    };

    const getPriceStatusIcon = (status: string) => {
        if (status === 'high') return <TrendingUp className="w-5 h-5 text-red-600" />;
        if (status === 'low') return <TrendingDown className="w-5 h-5 text-blue-600" />;
        return <Check className="w-5 h-5 text-green-600" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Service: ${service.service_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/services"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-[#375534] hover:bg-white dark:text-[#AEC3B0] dark:hover:bg-[#375534]/20 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{service.service_name}</h1>
                        <div className="mt-2 flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(service.status)}`}>
                                {service.status}
                            </span>
                            <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                Created: {new Date(service.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Service Details - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Service Information</h2>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Service Type</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white capitalize">{service.service_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Tourist Spot</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.tourist_spot?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Description</p>
                                    <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.description}</p>
                                </div>
                                {service.facebook_url && (
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Facebook Link</p>
                                        <a
                                            href={service.facebook_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {service.facebook_url}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Operator Information */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Operator Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Name</p>
                                    <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.operator?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Email</p>
                                    <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.operator?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity/Accommodation Details */}
                        {service.activity && (
                            <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Activity Details</h2>
                                <div className="space-y-3 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Activity Name</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.activity.activity_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Price per Person</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">₱{service.activity.price_per_person}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Duration</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.activity.duration_minutes} minutes</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Max Participants</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.activity.max_participants}</p>
                                    </div>
                                    {service.activity.required_equipment && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Required Equipment</p>
                                            <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.activity.required_equipment}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {service.accommodation && (
                            <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Accommodation Details</h2>
                                <div className="space-y-3 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Room Type</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white capitalize">{service.accommodation.room_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Price per Night</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">₱{service.accommodation.price_per_night}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Capacity</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.accommodation.capacity} persons</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Total Rooms</p>
                                        <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.accommodation.total_rooms}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Price Comparison & Actions */}
                    <div className="space-y-6">
                        {/* Price Comparison */}
                        {priceComparison && (
                            <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4 flex items-center gap-2">
                                    Price Comparison
                                    {getPriceStatusIcon(priceComparison.status)}
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-[#E3EED4] dark:bg-[#375534]/30 rounded-lg p-3">
                                        <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0]">Current Price</p>
                                        <p className="mt-1 text-2xl font-bold text-[#0F2A1D] dark:text-white">
                                            ₱{priceComparison.current_price}
                                            <span className="text-xs font-normal ml-2">
                                                ({priceComparison.price_type === 'per_person' ? 'per person' : 'per night'})
                                            </span>
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium text-[#6B8071] dark:text-[#AEC3B0]">Standard Avg:</span> ₱{priceComparison.standard_avg}</p>
                                        <p><span className="font-medium text-[#6B8071] dark:text-[#AEC3B0]">Range:</span> ₱{priceComparison.standard_min} - ₱{priceComparison.standard_max}</p>
                                        <p>
                                            <span className="font-medium text-[#6B8071] dark:text-[#AEC3B0]">Deviation:</span>
                                            <span
                                                className={`ml-2 font-bold ${
                                                    priceComparison.percentage_deviation > 0 ? 'text-red-600' : 'text-blue-600'
                                                }`}
                                            >
                                                {priceComparison.percentage_deviation > 0 ? '+' : ''}
                                                {priceComparison.percentage_deviation}%
                                            </span>
                                        </p>
                                    </div>

                                    {priceComparison.status === 'high' && (
                                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-3 flex gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-800 dark:text-red-400">
                                                Price is significantly higher than standard rates
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {service.status === 'Pending' && (
                            <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Admin Actions</h2>
                                <ServiceActionButton 
                                    serviceId={service.service_id}
                                    currentStatus={service.status}
                                    onSuccess={() => {
                                        // Handle success - page will refresh via Inertia
                                    }}
                                />
                            </div>
                        )}

                        {/* Status Info */}
                        {service.status !== 'Pending' && (
                            <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-6">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white mb-4">Review Information</h2>
                                <div className="space-y-3">
                                    {service.approved_by_admin && (
                                        <div>
                                            <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Reviewed By</p>
                                            <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.approved_by_admin.name}</p>
                                        </div>
                                    )}
                                    {service.approved_at && (
                                        <div>
                                            <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Reviewed At</p>
                                            <p className="mt-1 text-[#0F2A1D] dark:text-white">
                                                {new Date(service.approved_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {service.remarks && (
                                        <div>
                                            <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Remarks</p>
                                            <p className="mt-1 text-[#0F2A1D] dark:text-white">{service.remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
