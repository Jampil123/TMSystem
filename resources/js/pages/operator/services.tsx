import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Edit2,
    Trash2,
    Plus,
    Package,
    MapPin,
    Clock,
    AlertCircle,
    CheckCircle,
    Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Services', href: '/operator/services' },
];

interface Service {
    service_id: number;
    service_name: string;
    service_type: string;
    description: string;
    tourist_spot: {
        attraction_name: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    approved_at?: string;
    remarks?: string;
    activity?: {
        price_per_person: number;
        duration_minutes: number;
        max_participants: number;
    };
    accommodation?: {
        room_type: string;
        capacity: number;
        price_per_night: number;
        total_rooms: number;
    };
}

interface ServicesProps {
    services: Service[];
    total: number;
    message?: string;
}

function ServiceStatusBadge({ status, remarks }: { status: string; remarks?: string }) {
    const statusConfig: Record<string, { color: string; icon: React.ComponentType<any> }> = {
        approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: CheckCircle },
        pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: Clock },
        rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2">
            <Badge className={`flex items-center gap-1 ${config.color} border-0 capitalize`}>
                <Icon className="w-3 h-3" />
                {status}
            </Badge>
            {remarks && (
                <span className="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate" title={remarks}>
                    {remarks}
                </span>
            )}
        </div>
    );
}

export default function OperatorServices({ services, total, message }: ServicesProps) {
    const [selectedService, setSelectedService] = useState<number | null>(null);

    const handleDelete = (serviceId: number) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            // Delete logic would go here
            console.log('Delete service:', serviceId);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header with Create Button */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#375534] text-white p-4 rounded-lg">
                    <div >
                        <h1 className="text-2xl font-bold">Services</h1>
                        <p className="text-[#E3EED4] text-sm mt-1">
                            Manage and view all your services
                        </p>
                    </div>
                    <Link
                        href="/operator/services/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#35ab33] hover:bg-[#298227] text-white px-4 py-2 font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Service
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Total Services</p>
                                <p className="mt-2 text-2xl font-bold text-[#0F2A1D] dark:text-white">{total}</p>
                            </div>
                            <Package className="w-8 h-8 text-[#375534] dark:text-[#AEC3B0]" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Approved</p>
                                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                                    {services.filter((s) => s.status === 'approved').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Pending Review</p>
                                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {services.filter((s) => s.status === 'pending').length}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 p-4">
                        <p className="text-sm text-green-800 dark:text-green-300">{message}</p>
                    </div>
                )}

                {/* Services Table */}
                {services.length > 0 ? (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#6B9071] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                        <th className="px-6 py-3 text-left font-semibold text-white dark:text-[#E3EED4]">
                                            Service Name
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-white dark:text-[#E3EED4]">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-white dark:text-[#E3EED4]">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-white dark:text-[#E3EED4]">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right font-semibold text-white dark:text-[#E3EED4]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service) => (
                                        <tr
                                            key={service.service_id}
                                            className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {service.service_name}
                                                    </span>
                                                    <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                                        {service.description?.substring(0, 50)}...
                                                    </span>
                                                    {service.activity && (
                                                        <span className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                            ₱{Number(service.activity.price_per_person).toFixed(2)} per person
                                                        </span>
                                                    )}
                                                    {service.accommodation && (
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                            ₱{Number(service.accommodation.price_per_night).toFixed(2)} per night
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                                <span className="inline-flex items-center rounded-full bg-[#375534]/10 dark:bg-[#375534]/30 px-3 py-1 text-xs font-medium text-[#375534] dark:text-[#AEC3B0]">
                                                    {service.service_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {service.tourist_spot?.attraction_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ServiceStatusBadge status={service.status} remarks={service.remarks} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="inline-flex items-center justify-center rounded-md p-2 text-[#375534] hover:bg-[#E3EED4] dark:text-[#AEC3B0] dark:hover:bg-[#375534]/20 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/operator/services/${service.service_id}/edit`}
                                                        className="inline-flex items-center justify-center rounded-md p-2 text-[#375534] hover:bg-[#E3EED4] dark:text-[#AEC3B0] dark:hover:bg-[#375534]/20 transition-colors"
                                                        title="Edit service"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(service.service_id)}
                                                        className="inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Delete service"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-[#AEC3B0] dark:text-[#375534]" />
                        <h3 className="mt-4 text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                            No services yet
                        </h3>
                        <p className="mt-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                            Get started by creating your first service.
                        </p>
                        <Link
                            href="/operator/services/create"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-4 py-2 font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Service
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
