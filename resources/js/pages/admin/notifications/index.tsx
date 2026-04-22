import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Search, Bell, AlertCircle, AlertTriangle, Trash2, CheckCircle, Eye, XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Notifications', href: '/settings/notifications' },
];

interface NotificationData {
    id: number;
    title: string;
    message: string;
    notification_type: string;
    severity: string;
    is_read: boolean;
    created_at: string;
    read_at?: string;
    details?: any;
}

interface Props {
    notifications: {
        data: NotificationData[];
        links: any;
        meta: any;
    };
    totalNotifications: number;
    unreadCount: number;
    criticalCount: number;
    severityBreakdown: Record<string, number>;
    filters: {
        status?: string;
        severity?: string;
        type?: string;
        search?: string;
    };
}

const severityColors: Record<string, { bg: string; text: string; icon: any }> = {
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-900 dark:text-red-100', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-900 dark:text-orange-100', icon: <AlertCircle className="w-5 h-5 text-orange-600" /> },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-900 dark:text-yellow-100', icon: <Bell className="w-5 h-5 text-yellow-600" /> },
    low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-900 dark:text-blue-100', icon: <Bell className="w-5 h-5 text-blue-600" /> },
};

export default function AdminNotifications({ notifications, totalNotifications, unreadCount, criticalCount, severityBreakdown, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [severity, setSeverity] = useState(filters.severity || '');
    const [type, setType] = useState(filters.type || '');

    const handleFilter = () => {
        router.get('/settings/notifications', {
            search: search || undefined,
            status: status || undefined,
            severity: severity || undefined,
            type: type || undefined,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/settings/notifications/mark-all-as-read', {}, {
            onFinish: () => window.location.reload(),
        });
    };

    const handleDeleteRead = () => {
        if (confirm('Delete all read notifications?')) {
            router.post('/settings/notifications/delete-read', {}, {
                onFinish: () => window.location.reload(),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-[#375534] text-white p-4 rounded-lg flex justify-between items-center gap-3">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Notifications Manager</h1>
                        <p className="text-[#E3EED4] text-sm">System-wide notification management and history</p>
                    </div>
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium transition-colors"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark All Read
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 p-4">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">Total</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalNotifications}</p>
                    </div>

                    <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-800 p-4">
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase">Unread</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{unreadCount}</p>
                    </div>

                    <div className="rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 p-4">
                        <p className="text-xs font-medium text-red-600 dark:text-red-300 uppercase">Critical</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{criticalCount}</p>
                    </div>

                    <div className="rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 p-4">
                        <p className="text-xs font-medium text-green-600 dark:text-green-300 uppercase">Severity</p>
                        <div className="flex gap-2 mt-2">
                            <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">{severityBreakdown.critical || 0}</span>
                            <span className="text-xs font-bold bg-orange-600 text-white px-2 py-1 rounded">{severityBreakdown.high || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg bg-white dark:bg-[#375534]/20 p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-[#6B8071]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search title, message..."
                                className="w-full rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 pl-10 pr-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                        >
                            <option value="">All Status</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                        </select>

                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                        >
                            <option value="">All Severity</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 px-4 py-2 text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                        >
                            <option value="">All Types</option>
                            <option value="service">Service</option>
                            <option value="guide">Guide</option>
                            <option value="booking">Booking</option>
                            <option value="system">System</option>
                        </select>

                        <button
                            onClick={handleFilter}
                            className="rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white px-6 py-2 font-medium transition-colors"
                        >
                            Filter
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                {notifications.data && notifications.data.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.data.map((notification) => (
                            <div
                                key={notification.id}
                                className={`rounded-lg border p-4 transition-colors ${
                                    notification.is_read
                                        ? 'border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20'
                                        : 'border-[#375534] bg-[#375534]/5 dark:bg-[#375534]/20'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {severityColors[notification.severity]?.icon}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-white">
                                                    {notification.title}
                                                </h3>
                                                <p className="mt-1 text-[#6B8071] dark:text-[#AEC3B0]">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                        severityColors[notification.severity]?.bg
                                                    } ${severityColors[notification.severity]?.text}`}>
                                                        {notification.severity}
                                                    </span>
                                                    <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                        {notification.notification_type}
                                                    </span>
                                                    <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!notification.is_read && (
                                                    <div className="w-3 h-3 rounded-full bg-[#375534]"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        {notification.is_read ? (
                                            <button
                                                onClick={() => router.post(`/settings/notifications/${notification.id}/mark-unread`, {})}
                                                className="p-2 rounded-lg hover:bg-[#375534]/20 text-[#6B8071] dark:text-[#AEC3B0] transition-colors"
                                                title="Mark as unread"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.post(`/settings/notifications/${notification.id}/mark-read`, {})}
                                                className="p-2 rounded-lg hover:bg-[#375534]/20 text-[#6B8071] dark:text-[#AEC3B0] transition-colors"
                                                title="Mark as read"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this notification?')) {
                                                    router.delete(`/settings/notifications/${notification.id}`);
                                                }
                                            }}
                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#375534]/20 p-12 text-center">
                        <Bell className="w-12 h-12 text-[#6B8071] dark:text-[#AEC3B0] mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium text-[#0F2A1D] dark:text-white mb-2">No Notifications</p>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">
                            All caught up! No notifications match your current filters.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {notifications.meta && notifications.meta.total > 0 && (
                    <div className="flex items-center justify-between border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 pt-4">
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                            Showing {notifications.meta?.from || 0} to {notifications.meta?.to || 0} of {notifications.meta?.total || 0} notifications
                        </p>
                        <div className="flex gap-2">
                            {notifications.links?.prev && (
                                <Link href={notifications.links.prev} className="px-3 py-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white text-sm font-medium transition-colors">
                                    Previous
                                </Link>
                            )}
                            {notifications.links?.next && (
                                <Link href={notifications.links.next} className="px-3 py-2 rounded-lg bg-[#375534] hover:bg-[#2d4429] text-white text-sm font-medium transition-colors">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete Options */}
                <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 p-4">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-3">
                        Maintenance
                    </p>
                    <button
                        onClick={handleDeleteRead}
                        className="text-sm px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
                    >
                        Delete All Read Notifications
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
