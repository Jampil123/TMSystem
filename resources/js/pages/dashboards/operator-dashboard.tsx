import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Clock,
    Users,
    FileText,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Zap,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
];

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    color = 'text-[#a8d5ba]',
}: {
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    color?: string;
}) {
    return (
        <div className="rounded-lg border border-[#1a4d2e]/40 bg-[#1a4d2e] shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-[#a8d5ba] uppercase font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <Icon className={`w-10 h-10 ${color}`} />
            </div>
        </div>
    );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string }> = {
        approved: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
        pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
        rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
        active: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig['pending'];

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

interface UpcomingActivity {
    guide_assignment_id: number;
    date: string;
    time: string;
    guide_name: string;
    service_name: string;
    status: string;
}

interface Alert {
    operator_alert_id: number;
    message: string;
    type: string;
    priority: string;
    created_at: string;
}

interface ExpiringDocument {
    document_id: number;
    document_type: string;
    expiry_date: string;
    days_left: number;
    status: string;
}

interface RecentService {
    service_id: number;
    service_name: string;
    service_type: string;
    status: string;
    created_at: string;
}

interface DashboardProps {
    operatorProfile: {
        business_name: string;
        status: string;
        phone: string;
        address: string;
    };
    stats: {
        totalServices: number;
        approvedServices: number;
        pendingServices: number;
        todayBookings: number;
        todayGuests: number;
        upcomingActivitiesCount: number;
        pendingGuestSubmissions: number;
        expiringDocuments: number;
        expiredDocuments: number;
    };
    upcomingActivities: UpcomingActivity[];
    alerts: Alert[];
    actionItems: string[];
    recentServices: RecentService[];
    expiringDocuments: ExpiringDocument[];
}

export default function OperatorDashboard({
    operatorProfile,
    stats,
    upcomingActivities,
    alerts,
    actionItems,
    recentServices,
    expiringDocuments,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                            Welcome back, {operatorProfile.business_name.split(' ')[0]}!
                        </h1>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                            Here'\''s what'\''s happening with your business today
                        </p>
                    </div>
                    <StatusBadge status={operatorProfile.status} />
                </div>

                {/* Key Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Services" value={stats.totalServices} icon={TrendingUp} />
                    <StatCard title="Approved Services" value={stats.approvedServices} icon={CheckCircle} color="text-green-600" />
                    <StatCard
                        title="Today'\''s Bookings"
                        value={stats.todayBookings}
                        icon={Calendar}
                        color="text-blue-600"
                    />
                    <StatCard
                        title="Today'\''s Guests"
                        value={stats.todayGuests}
                        icon={Users}
                        color="text-purple-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Activities */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Upcoming Activities
                                </h2>
                                <Link
                                    href="/operator/services"
                                    className="text-sm text-[#375534] dark:text-[#AEC3B0] hover:underline font-medium flex items-center gap-1"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {upcomingActivities.length > 0 ? (
                                <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                                    {upcomingActivities.map((activity) => (
                                        <div
                                            key={activity.guide_assignment_id}
                                            className="p-4 hover:bg-[#E3EED4]/30 dark:hover:bg-[#375534]/20 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {activity.service_name}
                                                    </p>
                                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                                        {activity.date} at {activity.time}
                                                    </p>
                                                    <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-1">
                                                        Guide: {activity.guide_name}
                                                    </p>
                                                </div>
                                                <StatusBadge status={activity.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No upcoming activities scheduled</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Services */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Recent Services
                                </h2>
                                <Link
                                    href="/operator/services/create"
                                    className="text-sm text-white bg-[#375534] hover:bg-[#2d4429] rounded-lg px-3 py-1 font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Zap className="w-4 h-4" /> New Service
                                </Link>
                            </div>
                            {recentServices.length > 0 ? (
                                <div className="divide-y divide-[#AEC3B0]/20 dark:divide-[#375534]/20">
                                    {recentServices.map((service) => (
                                        <div
                                            key={service.service_id}
                                            className="p-4 hover:bg-[#E3EED4]/30 dark:hover:bg-[#375534]/20 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {service.service_name}
                                                    </p>
                                                    <p className="text-xs text-[#AEC3B0] dark:text-[#6B8071] mt-1">
                                                        {service.service_type} • {service.created_at}
                                                    </p>
                                                </div>
                                                <StatusBadge status={service.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No services created yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Action Items */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                <h3 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    Action Required
                                </h3>
                            </div>
                            {actionItems.length > 0 ? (
                                <div className="p-4 space-y-2">
                                    {actionItems.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
                                            <p className="text-sm text-[#375534] dark:text-[#AEC3B0]">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-green-600" />
                                    <p className="text-sm">All clear! No action needed</p>
                                </div>
                            )}
                        </div>

                        {/* Alerts */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                <h3 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    Active Alerts
                                </h3>
                            </div>
                            {alerts.length > 0 ? (
                                <div className="p-4 space-y-2">
                                    {alerts.map((alert) => (
                                        <div key={alert.operator_alert_id} className="p-3 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                                            <p className="text-xs font-semibold text-red-700 dark:text-red-400">{alert.type}</p>
                                            <p className="text-sm text-red-800 dark:text-red-300 mt-1">{alert.message}</p>
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{alert.created_at}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-green-600" />
                                    <p className="text-sm">No active alerts</p>
                                </div>
                            )}
                        </div>

                        {/* Expiring Documents */}
                        {expiringDocuments.length > 0 && (
                            <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <h3 className="text-lg font-bold text-[#0F2A1D] dark:text-[#E3EED4] flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-600" />
                                        Documents Expiring
                                    </h3>
                                </div>
                                <div className="p-4 space-y-2">
                                    {expiringDocuments.map((doc) => (
                                        <div key={doc.document_id} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                                            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                                                {doc.document_type}
                                            </p>
                                            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                                Expires in {doc.days_left} days
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h3 className="text-sm font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#6B8071] dark:text-[#AEC3B0]">Pending Services</span>
                                    <span className="font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{stats.pendingServices}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#6B8071] dark:text-[#AEC3B0]">Guest Submissions</span>
                                    <span className="font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{stats.pendingGuestSubmissions}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#6B8071] dark:text-[#AEC3B0]">Expiring Docs</span>
                                    <span className="font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{stats.expiringDocuments}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
