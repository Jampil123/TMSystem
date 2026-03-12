import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Bell, AlertTriangle, XCircle, AlertCircle, Users, Zap, Clock, X as XIcon, CheckCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'Notifications & Alerts', href: '/staff/notifications' },
];

interface Notification {
    id: number;
    type: string;
    notification_type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    details?: string;
    is_read: boolean;
    time_ago: string;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'error'>('all');

    // Fetch notifications from API
    useEffect(() => {
        fetchNotifications();
        // Refresh every 10 seconds
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/staff/api/notifications');
            const data = await response.json();
            
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/staff/api/notifications/${id}/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await fetch(`/staff/api/notifications/${id}`, {
                method: 'DELETE',
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/staff/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'success') return n.notification_type === 'success';
        if (filter === 'warning') return n.notification_type === 'warning';
        if (filter === 'error') return n.notification_type === 'error';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const successCount = notifications.filter(n => n.notification_type === 'success').length;
    const warningCount = notifications.filter(n => n.notification_type === 'warning').length;
    const errorCount = notifications.filter(n => n.notification_type === 'error').length;

    const getNotificationIcon = (notificationType: string) => {
        switch (notificationType) {
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'error':
                return <XCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    const getNotificationColors = (notificationType: string, isRead: boolean) => {
        const baseOpacity = isRead ? 'opacity-60' : '';
        
        switch (notificationType) {
            case 'success':
                return {
                    bg: `bg-green-50 ${baseOpacity}`,
                    border: 'border-green-200',
                    icon: 'text-green-600 dark:text-green-400',
                    badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                };
            case 'error':
                return {
                    bg: `bg-red-50 ${baseOpacity}`,
                    border: 'border-red-200',
                    icon: 'text-red-600 dark:text-red-400',
                    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                };
            case 'warning':
                return {
                    bg: `bg-yellow-50 ${baseOpacity}`,
                    border: 'border-yellow-200',
                    icon: 'text-yellow-600 dark:text-yellow-400',
                    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                };
            default:
                return {
                    bg: `bg-blue-50 ${baseOpacity}`,
                    border: 'border-blue-200',
                    icon: 'text-blue-600 dark:text-blue-400',
                    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications & Alerts" />
            <div className="space-y-6 p-8 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#375534] to-[#0F2A1D] rounded-lg p-6 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications & Alerts</h1>
                        <p className="mt-1 text-sm text-[#E3EED4]">Real-time system alerts for entrance monitoring and capacity status</p>
                    </div>
                    <Bell className="h-12 w-12 text-[#E3EED4]" />
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                                <p className={`text-3xl font-bold mt-1 ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600'}`}>
                                    {unreadCount}
                                </p>
                            </div>
                            <Bell className={`h-8 w-8 ${unreadCount > 0 ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{successCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{warningCount}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{errorCount}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{notifications.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-gray-500" />
                        </div>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'unread', 'success', 'warning', 'error'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                    filter === f
                                        ? 'bg-[#375534] text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notification => {
                            const colors = getNotificationColors(notification.notification_type, notification.is_read);
                            return (
                                <div
                                    key={notification.id}
                                    className={`${colors.bg} border-l-4 ${colors.border} bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 transition hover:shadow-md`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${colors.icon} flex-shrink-0 mt-1`}>
                                            {getNotificationIcon(notification.notification_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {notification.title}
                                                        {!notification.is_read && (
                                                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    {notification.details && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                                            {notification.details}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                        {notification.time_ago}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Badge className={colors.badge}>
                                                        {notification.notification_type.charAt(0).toUpperCase() + notification.notification_type.slice(1)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Button Actions */}
                                            <div className="flex gap-2 mt-3">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                                                    >
                                                        Mark as Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">No notifications for this filter</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
