import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Search, Download, Trash2, Eye, LogIn, LogOut, Plus, Edit2, Trash, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System', href: '#' },
    { title: 'Audit Logs', href: '/audit-logs' },
];

interface AuditLogData {
    id: number;
    user_name: string;
    user_email: string;
    action: string;
    model?: string;
    description?: string;
    ip_address?: string;
    status: string;
    created_at: string;
}

interface Props {
    logs: {
        data: AuditLogData[];
        links: any;
        meta: any;
    };
    totalLogs: number;
    totalLogins: number;
    totalFailures: number;
    todayLogs: number;
    filters: {
        search?: string;
        action?: string;
        status?: string;
        user_id?: string;
        start_date?: string;
        end_date?: string;
    };
}

const actionIconMap: Record<string, React.ReactNode> = {
    login: <LogIn className="w-4 h-4 text-blue-600" />,
    logout: <LogOut className="w-4 h-4 text-gray-600" />,
    create: <Plus className="w-4 h-4 text-green-600" />,
    update: <Edit2 className="w-4 h-4 text-yellow-600" />,
    delete: <Trash className="w-4 h-4 text-red-600" />,
};

export default function AuditLogs({ logs, totalLogs, totalLogins, totalFailures, todayLogs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [status, setStatus] = useState(filters.status || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleSearch = () => {
        router.get('/audit-logs', {
            search: search || undefined,
            action: action || undefined,
            status: status || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        });
    };

    const handleExport = () => {
        router.get('/audit-logs/export', {
            search: search || undefined,
            action: action || undefined,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failure':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getActionIcon = (action: string) => {
        return actionIconMap[action] || <Eye className="w-4 h-4 text-gray-600" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                
                {/* Filters */}
                <div className="rounded-lg bg-white dark:bg-[#375534]/20 p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-[#6B8071]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search user, email, action..."
                                className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 pl-10 pr-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                            />
                        </div>

                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                        >
                            <option value="">All Actions</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                        >
                            <option value="">All Status</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                        </select>

                        <button
                            onClick={handleSearch}
                            className="rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-6 py-2 font-medium transition-colors"
                        >
                            Filter
                        </button>
                    </div>
                </div>

                {/* Audit Logs List */}
                {logs.data && logs.data.length > 0 ? (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#375534]/10 dark:bg-[#375534]/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">Action</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">Description</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">IP Address</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F2A1D] dark:text-white">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#375534]/5 dark:hover:bg-[#375534]/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(log.action)}
                                                    <span className="font-medium text-[#0F2A1D] dark:text-white capitalize">{log.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="font-medium text-[#0F2A1D] dark:text-white">{log.user_name}</p>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{log.user_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] truncate">{log.description || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] font-mono">{log.ip_address || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(log.status)}
                                                    <span className="capitalize font-medium text-[#0F2A1D] dark:text-white">{log.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">{new Date(log.created_at).toLocaleString()}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 px-6 py-4">
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                Showing {logs.meta?.from || 0} to {logs.meta?.to || 0} of {logs.meta?.total || 0} logs
                            </p>
                            <div className="flex gap-2">
                                {logs.links?.prev && (
                                    <Link href={logs.links.prev} className="px-3 py-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white text-sm font-medium transition-colors">
                                        Previous
                                    </Link>
                                )}
                                {logs.links?.next && (
                                    <Link href={logs.links.next} className="px-3 py-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white text-sm font-medium transition-colors">
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-12 text-center">
                        <Eye className="w-12 h-12 text-[#6B8071] dark:text-[#AEC3B0] mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium text-[#0F2A1D] dark:text-white mb-2">No Audit Logs Found</p>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">
                            No activity matches your current filters. Try adjusting your search criteria.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
