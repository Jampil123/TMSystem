import MainLayout from '@/layouts/portal/MainLayouts';
import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type NotificationRow = {
    id: number;
    title: string;
    message: string;
    details?: string | null;
    severity?: string | null;
    notification_type?: string | null;
    is_read: boolean;
    time_ago?: string | null;
    created_at?: string | null;
};

type NotificationsPageProps = {
    notifications?: NotificationRow[];
    unreadCount?: number;
};

const severityStyle = (severity?: string | null) => {
    switch ((severity ?? '').toLowerCase()) {
        case 'critical':
            return { bg: '#7F1D1D', color: '#FEE2E2' };
        case 'high':
        case 'error':
            return { bg: '#991B1B', color: '#FEE2E2' };
        case 'warning':
        case 'medium':
            return { bg: '#92400E', color: '#FEF3C7' };
        case 'success':
            return { bg: '#166534', color: '#DCFCE7' };
        default:
            return { bg: '#1E3A8A', color: '#DBEAFE' };
    }
};

export default function NotificationsPage() {
    const { notifications = [], unreadCount = 0 } = usePage<NotificationsPageProps>().props;
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'bookings' | 'alerts'>('all');

    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            const typeText = `${notification.notification_type ?? ''} ${notification.title ?? ''} ${notification.message ?? ''}`.toLowerCase();
            const severityText = `${notification.severity ?? ''}`.toLowerCase();

            if (activeFilter === 'unread') return !notification.is_read;
            if (activeFilter === 'bookings') return typeText.includes('booking');
            if (activeFilter === 'alerts') {
                return typeText.includes('alert') || ['warning', 'high', 'critical', 'error', 'medium'].includes(severityText);
            }
            return true;
        });
    }, [notifications, activeFilter]);

    const iconType = (notification: NotificationRow) => {
        const text = `${notification.notification_type ?? ''} ${notification.title ?? ''} ${notification.message ?? ''}`.toLowerCase();
        const severity = `${notification.severity ?? ''}`.toLowerCase();

        if (text.includes('booking')) return 'booking';
        if (text.includes('qr')) return 'qr';
        if (text.includes('alert') || ['warning', 'high', 'critical', 'error', 'medium'].includes(severity)) return 'alert';
        return 'system';
    };

    return (
        <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
            <div className="max-w-8xl mx-auto px-6 py-8">
                <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#0F2A1D' }}>
                            Notifications
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: '#375534' }}>
                            Stay updated with bookings, arrivals, and alerts
                        </p>
                        <p className="mt-1 text-xs" style={{ color: '#6B9071' }}>
                            You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}.
                        </p>
                    </div>

                    {notifications.length > 0 && (
                        <Link
                            href="/badian-portal/notifications/mark-all-read"
                            method="post"
                            as="button"
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: '#375534', color: '#E3EED4' }}
                        >
                            Mark all as read
                        </Link>
                    )}
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'unread', label: 'Unread' },
                        { id: 'bookings', label: 'Bookings' },
                        { id: 'alerts', label: 'Alerts' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveFilter(tab.id as 'all' | 'unread' | 'bookings' | 'alerts')}
                            className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                            style={activeFilter === tab.id
                                ? { backgroundColor: '#16A34A', color: '#fff' }
                                : { backgroundColor: '#F3F4F6', color: '#4B5563' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filteredNotifications.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#DCFCE7' }}>
                            <svg className="h-7 w-7" fill="none" stroke="#16A34A" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">You&apos;re all caught up!</p>
                        <p className="mt-1 text-sm text-gray-500">No new notifications available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => {
                            const badge = severityStyle(notification.severity ?? notification.notification_type);
                            const type = iconType(notification);

                            return (
                                <div
                                    key={notification.id}
                                    className={`cursor-pointer rounded-xl p-4 md:p-5 shadow-sm transition-all duration-200 hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-green-500 bg-green-50' : 'bg-white'}`}
                                    style={{
                                        borderTop: '1px solid #F3F4F6',
                                        borderRight: '1px solid #F3F4F6',
                                        borderBottom: '1px solid #F3F4F6',
                                        borderLeftColor: !notification.is_read ? '#22C55E' : '#F3F4F6',
                                    }}
                                >
                                    <div className="flex items-start gap-3 md:gap-4">
                                        <div className="mt-0.5 shrink-0">
                                            {type === 'booking' && (
                                                <div className="rounded-lg p-2" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {type === 'qr' && (
                                                <div className="rounded-lg p-2" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm12 0h2v2h-2v-2m0 4h4v2h-4v-2M14 10h2v2h-2v-2zm4 0h2v2h-2v-2" />
                                                    </svg>
                                                </div>
                                            )}
                                            {type === 'alert' && (
                                                <div className="rounded-lg p-2" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8 14A1 1 0 003.16 19h17.68a1 1 0 00.87-1.5l-8-14a1 1 0 00-1.74 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {type === 'system' && (
                                                <div className="rounded-lg p-2" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3h1.5l.5 2.12a7.97 7.97 0 012.01.83l1.86-1.08 1.06 1.06-1.08 1.86c.34.63.62 1.3.83 2.01L21 11.25v1.5l-2.12.5a7.97 7.97 0 01-.83 2.01l1.08 1.86-1.06 1.06-1.86-1.08a7.97 7.97 0 01-2.01.83L12.75 21h-1.5l-.5-2.12a7.97 7.97 0 01-2.01-.83l-1.86 1.08-1.06-1.06 1.08-1.86a7.97 7.97 0 01-.83-2.01L3 12.75v-1.5l2.12-.5c.21-.71.49-1.38.83-2.01L4.87 6.88l1.06-1.06 1.86 1.08c.63-.34 1.3-.62 2.01-.83L11.25 3z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.is_read && (
                                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                                    )}
                                                </div>
                                                <span className="shrink-0 text-xs text-gray-400">
                                                    {notification.time_ago ?? notification.created_at}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {notification.message}
                                            </p>

                                            {notification.details && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    {notification.details}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase"
                                                    style={{ backgroundColor: badge.bg, color: badge.color }}
                                                >
                                                    {notification.severity ?? notification.notification_type ?? 'info'}
                                                </span>

                                                {!notification.is_read && (
                                                    <Link
                                                        href={`/badian-portal/notifications/${notification.id}/mark-read`}
                                                        method="post"
                                                        as="button"
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                        style={{ backgroundColor: '#375534', color: '#E3EED4' }}
                                                    >
                                                        Mark read
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

NotificationsPage.layout = (page: ReactNode) => <MainLayout children={page} />;
