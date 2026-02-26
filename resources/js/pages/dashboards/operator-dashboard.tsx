import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Calendar,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Info,
    AlertTriangle,
    FileText,
    Bell,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

// simple reusable stat card for the quick statistics grid
function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ComponentType<any> }) {
    return (
        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-[#375534] dark:text-[#AEC3B0] mb-1">{title}</p>
                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{value}</p>
            </div>
            <Icon className="w-8 h-8 text-[#375534]" />
        </div>
    );
}


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
];

// -------- sample / placeholder data for new layout --------
const operatorStatus = {
    status: 'Approved', // Approved | Pending | Rejected | Requires Update
    businessName: 'Mountain Explorers Inc.',
    operatorType: 'Adventure Tour',
    dateSubmitted: '2025-02-10',
    lguRemarks: 'All documents are in order.',
};

const stats = {
    totalBookingsToday: 5,
    totalGuestsToday: 24,
    upcomingActivities: 3,
    pendingGuestSubmissions: 1,
    docsExpiringSoon: 2,
};

const todaysActivities = [
    {
        time: '8:00 AM',
        service: 'Canyoneering',
        guests: 12,
        guide: 'Confirmed',
        status: 'Ready',
    },
    {
        time: '1:00 PM',
        service: 'Boat Tour',
        guests: 8,
        guide: 'Not Assigned',
        status: 'Action Needed',
    },
];

const alerts = [
    { id: 1, message: 'Weather Warning', type: 'warning' },
    { id: 2, message: 'LGU Announcement', type: 'info' },
    { id: 3, message: 'Guide not confirmed', type: 'alert' },
    { id: 4, message: 'Capacity exceeded', type: 'alert' },
];

function AlertItem({ message, type }: { message: string; type: string }) {
    const infoColor = 'text-[#375534]';
    const warningColor = 'text-yellow-500';
    const alertColor = 'text-red-500';
    const iconProps = { className: 'w-5 h-5' };

    let IconComponent;
    let colorClass = infoColor;
    switch (type) {
        case 'warning':
            IconComponent = AlertTriangle;
            colorClass = warningColor;
            break;
        case 'alert':
            IconComponent = XCircle;
            colorClass = alertColor;
            break;
        default:
            IconComponent = Info;
            colorClass = infoColor;
    }

    return (
        <li className="flex items-center gap-2">
            <IconComponent {...iconProps} className={`${iconProps.className} ${colorClass}`} />
            <span className="text-sm text-[#0F2A1D] dark:text-[#E3EED4]">
                {message}
            </span>
        </li>
    );
}

const actionsRequired = [
    'Submit Guest List for 1:00 PM Activity',
    'Tourism Accreditation expires in 5 days',
    'Guide not confirmed for booking #1023',
];

const crowd = {
    level: 'Moderate',
    risk: 'Low',
    peak: '2:00 PM',
};

// helper mappings for status card
const statusColors: Record<string, string> = {
    Approved: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    Pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    Rejected: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    'Requires Update': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
};
const statusIcon: Record<string, React.ComponentType<any>> = {
    Approved: CheckCircle,
    Pending: AlertCircle,
    Rejected: XCircle,
    'Requires Update': Info,
};

export default function OperatorDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* 1. Profile & Approval Status */}
                <div className="rounded-2xl shadow-lg p-8 bg-gradient-to-r from-[#375534] to-[#6B8071] text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{operatorStatus.businessName}</h2>
                            <p className="text-sm">
                                {operatorStatus.operatorType}
                            </p>
                            <p className="text-xs">
                                Submitted {operatorStatus.dateSubmitted}
                            </p>
                            {operatorStatus.lguRemarks && (
                                <p className="text-xs mt-1">
                                    LGU Remarks: {operatorStatus.lguRemarks}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {React.createElement(statusIcon[operatorStatus.status] || Info, {
                                className: `w-8 h-8 ${statusColors[operatorStatus.status]}`,
                            })}
                            <span className={`font-semibold ${statusColors[operatorStatus.status]}`}>
                                {operatorStatus.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Quick Statistics */}
                <div className="grid gap-6 md:grid-cols-4">
                    <StatCard
                        title="Total Bookings (Today)"
                        value={stats.totalBookingsToday}
                        icon={Calendar}
                    />
                    <StatCard
                        title="Total Guests (Today)"
                        value={stats.totalGuestsToday}
                        icon={Users}
                    />
                    <StatCard
                        title="Upcoming Activities"
                        value={stats.upcomingActivities}
                        icon={Clock}
                    />
                    <StatCard
                        title="Pending Guest Submissions"
                        value={stats.pendingGuestSubmissions}
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Documents Expiring Soon"
                        value={stats.docsExpiringSoon}
                        icon={FileText}
                    />
                </div>

                {/* 3. Today's Activity Overview */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                            Today’s Activity Overview
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Time</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Service</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guests</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guide</th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaysActivities.map((act, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {act.time}
                                        </td>
                                        <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                            {act.service}
                                        </td>
                                        <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                            {act.guests}
                                        </td>
                                        <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                            {act.guide}
                                        </td>
                                        <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {act.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. & 5. Alerts and Action Required */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 text-[#0F2A1D] dark:text-[#E3EED4]">
                            Alerts & Notifications
                        </h3>
                        <ul className="space-y-2">
                            {alerts.slice(0, 5).map((alert) => (
                                <AlertItem
                                    key={alert.id}
                                    message={alert.message}
                                    type={alert.type}
                                />
                            ))}
                        </ul>
                        <div className="mt-4 text-right">
                            <a
                                href="/operator/alerts"
                                className="text-sm text-[#375534] dark:text-[#AEC3B0] font-medium hover:underline"
                            >
                                View All
                            </a>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 text-[#0F2A1D] dark:text-[#E3EED4]">
                            Action Required
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-[#0F2A1D] dark:text-[#E3EED4]">
                            {actionsRequired.map((task, idx) => (
                                <li key={idx} className="text-[#375534] dark:text-[#AEC3B0]">
                                    {task}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* optional crowd indicator */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-2 text-[#0F2A1D] dark:text-[#E3EED4]">
                        Crowd Indicator
                    </h3>
                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                        Current crowd level: {crowd.level}
                    </p>
                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                        Risk level: {crowd.risk}
                    </p>
                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                        Peak forecast: {crowd.peak}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
