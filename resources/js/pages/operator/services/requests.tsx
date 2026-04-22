import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Users,
    AlertCircle,
    Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Services', href: '/operator/services' },
    { title: 'Service Requests', href: '/operator/services/requests' },
];

interface ServiceRequest {
    request_id: number;
    service_name: string;
    requester_name: string;
    requester_email: string;
    requested_date: string;
    guest_count: number;
    message: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
}

interface ServiceRequestsProps {
    requests: ServiceRequest[];
    totalPending: number;
}

function RequestStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { color: string; icon: React.ComponentType<any>; bgColor: string }> = {
        pending: {
            color: 'text-yellow-800 dark:text-yellow-300',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
            icon: Clock,
        },
        approved: {
            color: 'text-green-800 dark:text-green-300',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            icon: CheckCircle,
        },
        rejected: {
            color: 'text-red-800 dark:text-red-300',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
            icon: XCircle,
        },
        completed: {
            color: 'text-blue-800 dark:text-blue-300',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            icon: CheckCircle,
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <Badge className={`flex w-fit items-center gap-1 ${config.bgColor} ${config.color} border-0 capitalize`}>
            <Icon className="w-3 h-3" />
            {status}
        </Badge>
    );
}

export default function ServiceRequests({ requests, totalPending }: ServiceRequestsProps) {
    const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const filteredRequests =
        filter === 'all' ? requests : requests.filter((req) => req.status === filter);

    const handleApprove = (requestId: number) => {
        // Approve logic
        console.log('Approve request:', requestId);
    };

    const handleReject = (requestId: number) => {
        // Reject logic
        console.log('Reject request:', requestId);
    };

    const handleMessage = (requestId: number) => {
        // Open messaging
        console.log('Message for request:', requestId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-[#375534] text-white p-4 rounded-lg">
                    <h1 className="text-3xl font-bold">Service Requests</h1>
                    <p className="text-[#E3EED4] text-sm mt-1">
                        Manage requests and inquiries for your services
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Total Requests</p>
                                <p className="mt-2 text-2xl font-bold text-[#0F2A1D] dark:text-white">
                                    {requests.length}
                                </p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-[#375534] dark:text-[#AEC3B0]" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Pending</p>
                                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {totalPending}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Approved</p>
                                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                                    {requests.filter((r) => r.status === 'approved').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Completed</p>
                                <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {requests.filter((r) => r.status === 'completed').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                filter === status
                                    ? 'bg-[#375534] text-white dark:bg-[#AEC3B0] dark:text-[#0F2A1D]'
                                    : 'border border-[#AEC3B0]/40 dark:border-[#375534]/40 text-[#375534] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/20'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Requests List */}
                {filteredRequests.length > 0 ? (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.request_id}
                                onClick={() =>
                                    setSelectedRequest(
                                        selectedRequest === request.request_id ? null : request.request_id
                                    )
                                }
                                className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                    {request.service_name}
                                                </h3>
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                                    from <strong>{request.requester_name}</strong>
                                                </p>
                                            </div>
                                            <RequestStatusBadge status={request.status} />
                                        </div>
                                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-3">
                                            {request.message}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(request.requested_date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                <Users className="w-4 h-4" />
                                                {request.guest_count} guest{request.guest_count !== 1 ? 's' : ''}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                                                requested {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {selectedRequest === request.request_id && (
                                    <div className="mt-6 pt-6 border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <p className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-1">
                                                    Customer Information
                                                </p>
                                                <div className="text-sm text-[#6B8071] dark:text-[#AEC3B0] space-y-1">
                                                    <p>
                                                        <strong>Name:</strong> {request.requester_name}
                                                    </p>
                                                    <p>
                                                        <strong>Email:</strong> {request.requester_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-1">
                                                    Request Details
                                                </p>
                                                <div className="text-sm text-[#6B8071] dark:text-[#AEC3B0] space-y-1">
                                                    <p>
                                                        <strong>Date:</strong> {new Date(request.requested_date).toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        <strong>Guests:</strong> {request.guest_count}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {request.status === 'pending' && (
                                            <div className="flex flex-wrap gap-3 items-center border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 pt-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApprove(request.request_id);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium transition-colors text-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReject(request.request_id);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 font-medium transition-colors text-sm"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMessage(request.request_id);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-[#375534]/40 dark:border-[#AEC3B0]/40 text-[#375534] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/20 px-4 py-2 font-medium transition-colors text-sm"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-12 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-[#AEC3B0] dark:text-[#375534]" />
                        <h3 className="mt-4 text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                            No requests yet
                        </h3>
                        <p className="mt-2 text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                            Service requests will appear here when customers request your services.
                        </p>
                    </div>
                )}

                {/* Info */}
                <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Responding to Requests</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Respond promptly to service requests. Approved requests will send a confirmation to the customer with next steps.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
