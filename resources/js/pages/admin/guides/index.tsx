import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, Filter, Download, AlertCircle, Check, X, Eye, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Guide {
    id: number;
    full_name: string;
    email: string;
    contact_number: string;
    years_of_experience: number;
    specialty_areas: string[];
    status: string;
    created_at: string;
    certifications: any[];
    has_expiring_certs: boolean;
    has_expired_certs: boolean;
}

interface Props {
    guides: Guide[];
    pagination: any;
    counts: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
    filters: {
        status: string;
        search: string;
    };
    specialtyOptions?: string[];
}


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guide Management', href: '#' },
];

export default function GuideIndex({ guides, pagination, counts, filters, specialtyOptions = [] }: Props) {
    const [selectedGuide, setSelectedGuide] = useState<number | null>(null);
    const [rejectModal, setRejectModal] = useState<{ guideId: number | null; reason: string }>({
        guideId: null,
        reason: '',
    });
    const [searchValue, setSearchValue] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/guides', {
            search: searchValue,
            status: statusFilter,
        }, { preserveScroll: true });
    };

    // Registration logic has been moved to a separate create page.
    // Old handler functions and state are no longer needed.


    const handleApprove = (guideId: number) => {
        if (window.confirm('Approve this guide?')) {
            router.post(`/guides/${guideId}/approve`, {}, {
                onSuccess: () => {
                    setSelectedGuide(null);
                },
            });
        }
    };

    const handleReject = (guideId: number) => {
        setRejectModal({ guideId, reason: '' });
    };

    const submitReject = () => {
        if (!rejectModal.guideId || !rejectModal.reason.trim()) {
            alert('Please enter a rejection reason');
            return;
        }

        router.post(`/guides/${rejectModal.guideId}/reject`, 
            { rejection_reason: rejectModal.reason },
            {
                onSuccess: () => {
                    setRejectModal({ guideId: null, reason: '' });
                    setSelectedGuide(null);
                },
            }
        );
    };

    const handleExport = () => {
        router.get('/guides/export/csv', {
            status: statusFilter,
            search: searchValue,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
            case 'Pending':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
            case 'Rejected':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guide Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                            Guide Management
                        </h1>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                            {counts.total} total • {counts.pending} pending • {counts.approved} approved
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/guides/create"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Register Guide
                        </Link>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Total Guides</p>
                        <p className="text-3xl font-bold text-[#375534] dark:text-[#AEC3B0]">{counts.total}</p>
                    </div>
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending}</p>
                    </div>
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Approved</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.approved}</p>
                    </div>
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Rejected</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{counts.rejected}</p>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleSearch} className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg">
                            <Search className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="flex-1 outline-none bg-transparent text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0]"
                            />
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg">
                            <Filter className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="outline-none bg-transparent text-[#0F2A1D] dark:text-[#E3EED4]"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors font-medium"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Guides Table */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-[#F8FAFB] dark:bg-[#1a3a2e]">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Experience
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {guides.length > 0 ? (
                                    guides.map((guide) => (
                                        <tr
                                            key={guide.id}
                                            className="border-b border-[#AEC3B0]/40 dark:border-[#375534]/40 hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {guide.full_name}
                                                    </p>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                        {guide.specialty_areas?.join(', ') || 'No specialties'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {guide.email}
                                            </td>
                                            <td className="px-6 py-4 text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {guide.years_of_experience} years
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(guide.status)}`}>
                                                        {guide.status}
                                                    </span>
                                                    {guide.has_expired_certs && (
                                                        <div title="Has expired certifications">
                                                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                        </div>
                                                    )}
                                                    {guide.has_expiring_certs && (
                                                        <div title="Has expiring certifications">
                                                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/guides/${guide.id}`}
                                                        className="p-2 hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] rounded transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                                    </Link>

                                                    {guide.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(guide.id)}
                                                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/10 rounded transition-colors text-green-600 dark:text-green-400"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(guide.id)}
                                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors text-red-600 dark:text-red-400"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <AlertCircle className="w-12 h-12 text-[#AEC3B0] dark:text-[#375534] mx-auto mb-3 opacity-50" />
                                            <p className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                No guides found
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {pagination.current_page > 1 && (
                            <Link
                                href={`/guides?page=1&status=${statusFilter}&search=${searchValue}`}
                                className="px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e]"
                            >
                                First
                            </Link>
                        )}
                        {pagination.current_page > 1 && (
                            <Link
                                href={`/guides?page=${pagination.current_page - 1}&status=${statusFilter}&search=${searchValue}`}
                                className="px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e]"
                            >
                                Previous
                            </Link>
                        )}
                        <span className="px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4]">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        {pagination.current_page < pagination.last_page && (
                            <Link
                                href={`/guides?page=${pagination.current_page + 1}&status=${statusFilter}&search=${searchValue}`}
                                className="px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e]"
                            >
                                Next
                            </Link>
                        )}
                        {pagination.current_page < pagination.last_page && (
                            <Link
                                href={`/guides?page=${pagination.last_page}&status=${statusFilter}&search=${searchValue}`}
                                className="px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e]"
                            >
                                Last
                            </Link>
                        )}
                    </div>
                )}

                {/* Reject Modal */}
                {rejectModal.guideId !== null && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Reject Guide Application
                            </h3>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) =>
                                    setRejectModal({ ...rejectModal, reason: e.target.value })
                                }
                                placeholder="Please provide a reason for rejection..."
                                className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] mb-4 resize-none"
                                rows={4}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRejectModal({ guideId: null, reason: '' })}
                                    className="flex-1 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitReject}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
