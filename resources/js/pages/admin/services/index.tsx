import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Eye, Filter, Search } from 'lucide-react';
import ServiceActionButton from '@/components/service-action-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Service Management', href: '/services' },
];

interface ServiceData {
    service_id: number;
    service_name: string;
    service_type: string;
    status: string;
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
    filters: {
        status: string;
        service_type: string;
        operator_id: string;
        search: string;
    };
    statuses: string[];
    serviceTypes: string[];
}

export default function ServiceIndex({ services, filters, statuses, serviceTypes }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [serviceType, setServiceType] = useState(filters.service_type);

    const handleFilter = () => {
        router.get('/services', {
            search: search || undefined,
            status: status || undefined,
            service_type: serviceType || undefined,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setServiceType('');
        router.get('/services');
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Revision Required':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#0F2A1D] dark:text-white">Service Management</h1>
                    <p className="mt-1 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                        Review and manage all services submitted by operators
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-white dark:bg-[#375534]/20 p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                        <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">All Services</p>
                        <p className="mt-2 text-2xl font-bold text-[#0F2A1D] dark:text-white">
                            {services?.data?.length || 0}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg bg-white dark:bg-[#375534]/20 p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-white flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Search Service
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-[#6B8071]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Service name..."
                                    className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 pl-10 pr-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                            >
                                <option value="">All Status</option>
                                {statuses.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Service Type */}
                        <div>
                            <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Service Type
                            </label>
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0]"
                            >
                                <option value="">All Types</option>
                                {serviceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleFilter}
                                className="flex-1 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-4 py-2 font-medium transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 text-[#375534] dark:text-[#AEC3B0] px-4 py-2 font-medium transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                <div className="rounded-lg bg-white dark:bg-[#375534]/20 border border-[#AEC3B0]/40 dark:border-[#375534]/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 bg-[#E3EED4] dark:bg-[#375534]/20">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                        Service Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                        Operator
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#0F2A1D] dark:text-white">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.data?.map((service: ServiceData) => (
                                    <tr
                                        key={service.service_id}
                                        className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                            {service.service_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                            {service.service_type}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                            {service.operator?.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                                                    service.status
                                                )}`}
                                            >
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                            {new Date(service.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex gap-2">
                                                <ServiceActionButton 
                                                    serviceId={service.service_id}
                                                    currentStatus={service.status}
                                                    compact={true}
                                                />
                                                <Link
                                                    href={`/services/${service.service_id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-3 py-1 text-xs font-medium transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {services.data?.length === 0 && (
                        <div className="px-6 py-8 text-center">
                            <p className="text-[#6B8071] dark:text-[#AEC3B0]">No services found</p>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Link
                        href="/services/pending"
                        className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-4 border border-yellow-300 dark:border-yellow-800 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">Pending Services</h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">Review services awaiting approval</p>
                    </Link>
                    <Link
                        href="/services/approved"
                        className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 border border-green-300 dark:border-green-800 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="font-semibold text-green-900 dark:text-green-300">Approved Services</h3>
                        <p className="text-sm text-green-800 dark:text-green-400">View all approved services</p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
