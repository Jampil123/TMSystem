import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle, AlertCircle, XCircle, Info, Eye, Check, X } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/lgu-dot-dashboard' },
    { title: 'Operator Management', href: '/operators' },
];

const statusBadge = {
    approved: { label: 'Approved', color: 'bg-[#E3EED4] text-[#375534]', icon: CheckCircle },
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
    suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-600', icon: AlertCircle },
    blocked: { label: 'Blocked', color: 'bg-red-200 text-red-700', icon: XCircle },
};

interface Operator {
    id: number;
    name: string;
    email: string;
    username: string;
    business_name: string;
    status: string;
    submission_status: string;
    joinDate: string;
    documents_submitted_at: string | null;
    documents: {
        completed: number;
        total: number;
    };
    phone: string;
    address: string;
}

interface PageProps {
    operators: Operator[];
    stats: {
        total_operators: number;
        approved_operators: number;
        pending_operators: number;
        submitted_documents: number;
    };
}

export default function OperatorManagement({ operators, stats }: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    const filteredOperators = operators.filter((operator) => {
        const matchesSearch =
            operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            operator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            operator.business_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || operator.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const docsPercentage = (operator: Operator) => {
        return operator.documents.total > 0 ? Math.round((operator.documents.completed / operator.documents.total) * 100) : 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Management" />

            <div className="p-6 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen space-y-6">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#0F2A1D] to-[#375534] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Operator Management</h1>
                    <p className="text-[#E3EED4]">Manage and review operator applications and submissions</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Total Operators</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{stats.total_operators}</p>
                            </div>
                            <Info className="w-8 h-8 text-[#6B8071]" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Approved</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{stats.approved_operators}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Pending Review</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{stats.pending_operators}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1">Documents Submitted</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{stats.submitted_documents}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-[#375534]" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Search by name, email, or business..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4]"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4]"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Operators Table */}
                <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                            Operators ({filteredOperators.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Operator Name
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Business Name
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Documents
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Review Status
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Submission Date
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOperators.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-[#6B8071] dark:text-[#AEC3B0]">
                                            No operators found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOperators.map((operator) => {
                                        const statusInfo = statusBadge[operator.status?.toLowerCase() as keyof typeof statusBadge] || statusBadge.pending;
                                        const docsPercent = docsPercentage(operator);

                                        return (
                                            <tr
                                                key={operator.id}
                                                className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                                    {operator.name}
                                                </td>
                                                <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                                    {operator.business_name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-[#E3EED4] dark:bg-[#375534]/20 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#375534]"
                                                                style={{ width: `${docsPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0] whitespace-nowrap">
                                                            {operator.documents.completed}/{operator.documents.total}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <statusInfo.icon className="w-3 h-3" /> {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {operator.submission_status === 'pending_submission' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                                            <AlertCircle className="w-3 h-3" /> Pending Submission
                                                        </span>
                                                    )}
                                                    {operator.submission_status === 'submitted_for_review' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                                                            <AlertCircle className="w-3 h-3" /> Under Review
                                                        </span>
                                                    )}
                                                    {operator.submission_status === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#E3EED4] text-[#375534]">
                                                            <CheckCircle className="w-3 h-3" /> Approved
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                                    {operator.documents_submitted_at ? (
                                                        <span>{operator.documents_submitted_at}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Link
                                                        href={`/operators/${operator.id}`}
                                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#375534] text-white text-xs hover:bg-[#6B8071] transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" /> View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
