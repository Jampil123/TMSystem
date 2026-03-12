import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Trash2, Archive, Filter, RefreshCw } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    severity?: string;
    notification_type?: string;
    is_read: boolean;
    created_at: string;
    related_entity_type?: string;
    related_entity_id?: number;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 20 seconds
        const interval = setInterval(fetchNotifications, 20000);
        return () => clearInterval(interval);
    }, [selectedSeverity, unreadOnly]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedSeverity !== 'all') {
                params.append('severity', selectedSeverity);
            }
            params.append('limit', '100');

            const url = selectedSeverity !== 'all' 
                ? `/staff/api/notifications/by-severity?${params}`
                : '/staff/api/notifications';

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                let notifs = data.data || [];
                if (unreadOnly) {
                    notifs = notifs.filter((n: Notification) => !n.is_read);
                }
                setNotifications(notifs);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const response = await fetch(`/staff/api/notifications/${id}/mark-read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                setNotifications(notifications.map(n => 
                    n.id === id ? { ...n, is_read: true } : n
                ));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            const response = await fetch(`/staff/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                setNotifications(notifications.filter(n => n.id !== id));
                setSuccessMessage('Notification deleted');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/staff/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
                setSuccessMessage('All notifications marked as read');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'high':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            default:
                return <Bell className="w-5 h-5 text-blue-600" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-50 border-red-200';
            case 'high':
                return 'bg-orange-50 border-orange-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="mt-2 text-gray-600">
                        View and manage all system notifications
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">{successMessage}</span>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Severity
                                </label>
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Severities</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="warning">Warning</option>
                                    <option value="success">Success</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="unreadOnly"
                                    checked={unreadOnly}
                                    onChange={(e) => setUnreadOnly(e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="unreadOnly" className="text-sm font-medium text-gray-700">
                                    Unread Only ({unreadCount})
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={fetchNotifications}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                >
                                    <Archive className="w-4 h-4" />
                                    Mark All Read
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-gray-600">
                            {unreadOnly ? 'You have no unread notifications.' : 'You have no notifications yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const severity = notification.severity || notification.notification_type || 'info';
                            return (
                                <div
                                    key={notification.id}
                                    className={`border rounded-lg p-4 ${getSeverityColor(severity)} ${
                                        !notification.is_read ? 'border-l-4' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {getSeverityIcon(severity)}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.is_read && (
                                                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 hover:bg-gray-200 rounded transition"
                                                    title="Mark as read"
                                                >
                                                    <Archive className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1 hover:bg-red-200 rounded transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats */}
                {!loading && notifications.length > 0 && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                        Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''} 
                        {unreadOnly && ` • ${unreadCount} unread`}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
