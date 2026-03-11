import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Bell, AlertTriangle, XCircle, AlertCircle, Users, Zap, Clock, X as XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'Notifications & Alerts', href: '/staff/notifications' },
];

interface Alert {
    id: string;
    type: 'invalid_qr' | 'guest_mismatch' | 'missing_guide' | 'capacity_warning';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    bookingCode?: string;
    details?: string;
    dismissed: boolean;
}

export default function NotificationsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: '1',
            type: 'invalid_qr',
            severity: 'critical',
            title: 'Invalid QR Code',
            message: 'Unrecognized booking code scanned',
            timestamp: '11:15 AM',
            bookingCode: 'BK-INVALID-999',
            details: 'The scanned QR code does not match any booking in the system.',
            dismissed: false,
        },
        {
            id: '2',
            type: 'guest_mismatch',
            severity: 'warning',
            title: 'Guest Count Mismatch',
            message: 'Actual guests do not match booking record',
            timestamp: '11:08 AM',
            bookingCode: 'BK-002-2026',
            details: 'Booking shows 12 guests but only 10 guests arrived. Discrepancy: 2 guests.',
            dismissed: false,
        },
        {
            id: '3',
            type: 'missing_guide',
            severity: 'critical',
            title: 'Missing Guide Alert',
            message: 'Required guide not present for group',
            timestamp: '11:02 AM',
            bookingCode: 'BK-005-2026',
            details: 'Guide "Carlos Mendoza" is assigned but not present with the group. Group cannot proceed.',
            dismissed: false,
        },
        {
            id: '4',
            type: 'capacity_warning',
            severity: 'warning',
            title: 'Capacity Warning',
            message: 'Site capacity approaching maximum',
            timestamp: '10:55 AM',
            details: 'Current visitors: 320/350 (91.4%). Site is at 91% capacity. Only 30 slots remaining.',
            dismissed: false,
        },
        {
            id: '5',
            type: 'invalid_qr',
            severity: 'warning',
            title: 'Expired QR Code',
            message: 'QR code visit date has passed',
            timestamp: '10:42 AM',
            bookingCode: 'BK-003-2026',
            details: 'The booking is for 2026-03-04, but today is 2026-03-05.',
            dismissed: false,
        },
        {
            id: '6',
            type: 'guest_mismatch',
            severity: 'info',
            title: 'Extra Guests Detected',
            message: 'More guests than expected',
            timestamp: '10:28 AM',
            bookingCode: 'BK-001-2026',
            details: 'Booking shows 8 guests but 10 showed up. Staff approval recommended.',
            dismissed: false,
        },
    ]);

    const dismissAlert = (id: string) => {
        setAlerts(alerts.map(alert => alert.id === id ? { ...alert, dismissed: true } : alert));
    };

    const clearAll = () => {
        setAlerts(alerts.map(alert => ({ ...alert, dismissed: true })));
    };

    const activeAlerts = alerts.filter(a => !a.dismissed);
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;
    const infoCount = activeAlerts.filter(a => a.severity === 'info').length;

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'invalid_qr':
                return <XCircle className="h-5 w-5" />;
            case 'guest_mismatch':
                return <Users className="h-5 w-5" />;
            case 'missing_guide':
                return <AlertTriangle className="h-5 w-5" />;
            case 'capacity_warning':
                return <Zap className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    const getAlertColors = (severity: Alert['severity']) => {
        switch (severity) {
            case 'critical':
                return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-800' };
            case 'warning':
                return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
            case 'info':
                return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-800' };
            default:
                return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-500', badge: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications & Alerts" />
            <div className="space-y-6 p-8 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#375534] to-[#0F2A1D] rounded-lg p-6 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications & Alerts</h1>
                        <p className="mt-1 text-sm text-[#E3EED4]">Real-time system alerts for invalid QR codes, guest mismatches, and missing guides</p>
                    </div>
                    <Bell className="h-12 w-12 text-[#E3EED4]" />
                </div>

                {/* Alert Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalCount}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{warningCount}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Information</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{infoCount}</p>
                            </div>
                            <Bell className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Active</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeAlerts.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-gray-500" />
                        </div>
                    </div>
                </div>

                {/* Alert Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Showing {activeAlerts.length} active alert(s)</p>
                    {activeAlerts.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Alert List */}
                {activeAlerts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-12 text-center">
                        <Bell className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">No Active Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">All alerts have been dismissed. Keep monitoring for new alerts.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAlerts.map((alert) => {
                            const colors = getAlertColors(alert.severity);
                            return (
                                <div key={alert.id} className={`bg-white dark:bg-slate-900 rounded-lg border ${colors.border} p-6 ${colors.bg} dark:bg-slate-900`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`${colors.icon} mt-1`}>{getAlertIcon(alert.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                                                    <Badge className={`text-xs ${colors.badge}`}>
                                                        {alert.severity.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{alert.message}</p>
                                                {alert.bookingCode && (
                                                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">Booking: {alert.bookingCode}</p>
                                                )}
                                                {alert.details && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 p-2 rounded mt-2 border-l-2 border-gray-300 dark:border-slate-600">
                                                        {alert.details}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {alert.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => dismissAlert(alert.id)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
                                            title="Dismiss alert"
                                        >
                                            <XIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Alert Types Legend */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Type Reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Invalid QR Code</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Scanned code doesn't match any booking or visit date has passed</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Users className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Guest Count Mismatch</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Actual guest count differs from booking record</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Missing Guide</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Required guide is not present with the group</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Capacity Warning</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Site is approaching or exceeding maximum capacity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
