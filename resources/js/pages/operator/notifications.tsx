import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Bell, CheckCircle, XCircle, AlertTriangle, Info, RefreshCw,
    ExternalLink, Trash2, CheckCheck, Package, FileText,
    UserCheck, Users, Building2, Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Notifications', href: '/operator/notifications' },
];

interface OperatorNotification {
    id: string;
    type: string;
    category: string;
    badgeType: 'success' | 'error' | 'warning' | 'info';
    message: string;
    title: string;
    remarks: string | null;
    url: string | null;
    service_id: number | null;
    service_name: string | null;
    is_read: boolean;
    read_at: string | null;
    time_ago: string;
    created_at: string;
}

interface Props {
    notifications: OperatorNotification[];
    unreadCount: number;
}

type FilterType = 'all' | 'unread' | 'service' | 'account' | 'document';

const categoryIcon = (category: string) => {
    switch (category) {
        case 'service_approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'service_rejected': return <XCircle className="w-5 h-5 text-red-500" />;
        case 'service_revision': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        case 'account_approved': return <UserCheck className="w-5 h-5 text-blue-500" />;
        case 'document_approved': return <FileText className="w-5 h-5 text-green-600" />;
        case 'document_rejected': return <FileText className="w-5 h-5 text-red-500" />;
        case 'guest_list_approved': return <Users className="w-5 h-5 text-green-600" />;
        case 'guest_list_rejected': return <Users className="w-5 h-5 text-red-500" />;
        case 'guide_assigned': return <Building2 className="w-5 h-5 text-purple-500" />;
        default: return <Info className="w-5 h-5 text-[#6B8071]" />;
    }
};

const badgeBg = (type: string) => {
    switch (type) {
        case 'success': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
        case 'error':   return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
        case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
        default:        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
    }
};

const categoryLabel = (category: string) => {
    switch (category) {
        case 'service_approved':    return 'Service';
        case 'service_rejected':    return 'Service';
        case 'service_revision':    return 'Service';
        case 'account_approved':    return 'Account';
        case 'document_approved':   return 'Document';
        case 'document_rejected':   return 'Document';
        case 'guest_list_approved': return 'Guest List';
        case 'guest_list_rejected': return 'Guest List';
        case 'guide_assigned':      return 'Guide';
        default:                    return 'System';
    }
};

export default function OperatorNotifications({ notifications, unreadCount }: Props) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [submitting, setSubmitting] = useState<string | null>(null);

    const filtered = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        if (filter === 'service') return n.category.startsWith('service_');
        if (filter === 'account') return n.category === 'account_approved';
        if (filter === 'document') return n.category.startsWith('document_');
        return true;
    });

    const handleMarkRead = (id: string) => {
        setSubmitting(id);
        router.post(
            `/operator/notifications/${id}/mark-read`,
            {},
            { preserveScroll: true, onFinish: () => setSubmitting(null) }
        );
    };

    const handleMarkAllRead = () => {
        router.post('/operator/notifications/mark-all-read', {}, { preserveScroll: true });
    };

    const handleDelete = (id: string) => {
        setSubmitting(id + '_del');
        router.delete(
            `/operator/notifications/${id}`,
            { preserveScroll: true, onFinish: () => setSubmitting(null) }
        );
    };

    const filters: { key: FilterType; label: string; count?: number }[] = [
        { key: 'all',      label: 'All',       count: notifications.length },
        { key: 'unread',   label: 'Unread',    count: unreadCount },
        { key: 'service',  label: 'Services',  count: notifications.filter(n => n.category.startsWith('service_')).length },
        { key: 'document', label: 'Documents', count: notifications.filter(n => n.category.startsWith('document_')).length },
        { key: 'account',  label: 'Account',   count: notifications.filter(n => n.category === 'account_approved').length },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">

                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-6 text-white shadow-lg flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Bell className="w-7 h-7" />
                            <h1 className="text-2xl font-bold">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <p className="text-[#E3EED4] text-sm">Stay updated on your services, documents, and account activity</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Quick stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: notifications.length, icon: Bell, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
                        { label: 'Unread', value: unreadCount, icon: Clock, color: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
                        { label: 'Services', value: notifications.filter(n => n.category.startsWith('service_')).length, icon: Package, color: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
                        { label: 'Documents', value: notifications.filter(n => n.category.startsWith('document_')).length, icon: FileText, color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
                    ].map(card => (
                        <div key={card.label} className="bg-white dark:bg-[#0F2A1D] rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center shrink-0`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-[#0F2A1D] dark:text-white">{card.value}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 bg-white dark:bg-[#0F2A1D] rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 p-1 w-fit shadow-sm flex-wrap">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                filter === f.key
                                    ? 'bg-[#375534] text-white shadow'
                                    : 'text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#1a3a2a]'
                            }`}
                        >
                            {f.label}
                            {f.count !== undefined && f.count > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                    filter === f.key ? 'bg-white/30 text-white' : 'bg-[#E3EED4] dark:bg-[#1a3a2a] text-[#375534] dark:text-[#AEC3B0]'
                                }`}>
                                    {f.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="flex flex-col gap-3">
                    {filtered.length === 0 ? (
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-16 flex flex-col items-center gap-4 text-center">
                            <Bell className="w-12 h-12 text-[#AEC3B0] opacity-50" />
                            <div>
                                <p className="text-lg font-semibold text-[#0F2A1D] dark:text-white">
                                    {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                                </p>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                    {filter === 'unread'
                                        ? 'You have no unread notifications.'
                                        : 'Notifications will appear here when there is activity on your account.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filtered.map(n => (
                            <div
                                key={n.id}
                                className={`group bg-white dark:bg-[#0F2A1D] rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                                    n.is_read
                                        ? 'border-[#AEC3B0]/30 dark:border-[#375534]/30'
                                        : 'border-l-4 border-l-[#375534] border-[#AEC3B0]/40 dark:border-l-[#6B8071] dark:border-[#375534]/40'
                                }`}
                            >
                                <div className="p-5 flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        n.badgeType === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                                        n.badgeType === 'error'   ? 'bg-red-100 dark:bg-red-900/30' :
                                        n.badgeType === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                                                    'bg-blue-100 dark:bg-blue-900/30'
                                    }`}>
                                        {categoryIcon(n.category)}
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-semibold text-[#0F2A1D] dark:text-white text-sm">{n.title}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeBg(n.badgeType)}`}>
                                                {categoryLabel(n.category)}
                                            </span>
                                            {!n.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-[#375534] dark:bg-[#AEC3B0] shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-sm text-[#0F2A1D] dark:text-[#E3EED4] leading-relaxed">{n.message}</p>

                                        {n.remarks && (
                                            <div className="mt-2 p-2.5 rounded-lg bg-[#E3EED4]/60 dark:bg-[#1a3a2a] border-l-2 border-[#375534] dark:border-[#6B8071]">
                                                <p className="text-xs font-medium text-[#375534] dark:text-[#AEC3B0] mb-0.5">Admin Note</p>
                                                <p className="text-sm text-[#0F2A1D] dark:text-[#E3EED4]">{n.remarks}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                                            <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0] flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {n.time_ago}
                                            </span>
                                            <span className="text-xs text-[#AEC3B0]">{n.created_at}</span>

                                            {n.url && (
                                                <a
                                                    href={n.url}
                                                    className="text-xs font-semibold text-[#375534] dark:text-[#AEC3B0] hover:underline flex items-center gap-1 ml-auto"
                                                >
                                                    View Details <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!n.is_read && (
                                            <button
                                                onClick={() => handleMarkRead(n.id)}
                                                disabled={submitting === n.id}
                                                title="Mark as read"
                                                className="p-1.5 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#1a3a2a] text-[#375534] dark:text-[#AEC3B0] transition disabled:opacity-50"
                                            >
                                                {submitting === n.id
                                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                    : <CheckCircle className="w-4 h-4" />
                                                }
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            disabled={submitting === n.id + '_del'}
                                            title="Delete"
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition disabled:opacity-50"
                                        >
                                            {submitting === n.id + '_del'
                                                ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                : <Trash2 className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
