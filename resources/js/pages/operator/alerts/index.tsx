import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Filter, Eye, Check, X } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Alert {
    id: number;
    alertType: string;
    priorityLevel: string;
    touristGroupName: string;
    numberOfTourists: number;
    assignedGuideName: string | null;
    activityServiceName: string;
    activityDateTime: string;
    description: string;
    suggestedAction: string;
    status: string;
    resolutionNotes: string | null;
    createdAt: string;
}

interface Props {
    alerts: Alert[];
    activeCount: number;
    highPriorityCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Alerts', href: '#' },
];

export default function AlertsIndex({ alerts, activeCount, highPriorityCount }: Props) {
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
    const [showAcknowledgeModal, setShowAcknowledgeModal] = useState<number | null>(null);
    const [showResolveModal, setShowResolveModal] = useState<number | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState('');

    const filteredAlerts = alerts.filter(alert => {
        const statusMatch = filterStatus === 'all' || alert.status.toLowerCase() === filterStatus;
        const priorityMatch = filterPriority === 'all' || alert.priorityLevel === filterPriority;
        return statusMatch && priorityMatch;
    });

    const handleAcknowledge = (alertId: number) => {
        router.post(`/operator/alerts/${alertId}/acknowledge`, {}, {
            onSuccess: () => {
                setShowAcknowledgeModal(null);
            },
        });
    };

    const handleResolve = (alertId: number) => {
        router.post(`/operator/alerts/${alertId}/resolve`, 
            { resolution_notes: resolutionNotes },
            {
                onSuccess: () => {
                    setShowResolveModal(null);
                    setResolutionNotes('');
                },
            }
        );
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300';
            case 'Medium':
                return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300';
            case 'Low':
                return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
            case 'Acknowledged':
                return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
            case 'Resolved':
                return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
            default:
                return null;
        }
    };

    const getAlertTypeIcon = (type: string) => {
        switch (type) {
            case 'Safety Issue':
                return <AlertTriangle className="w-4 h-4" />;
            case 'Guide Assignment':
                return <AlertCircle className="w-4 h-4" />;
            case 'Schedule Conflict':
                return <Clock className="w-4 h-4" />;
            case 'Service Update':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alerts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                            Alerts
                        </h1>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                            {activeCount} active • {highPriorityCount} high priority
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Active Alerts</p>
                                <p className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4]">
                                    {activeCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">High Priority</p>
                                <p className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4]">
                                    {highPriorityCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Total Alerts</p>
                                <p className="text-2xl font-bold text-[#375534] dark:text-[#E3EED4]">
                                    {alerts.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                        <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Status:</span>
                    </div>
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-[#375534] text-white'
                                : 'bg-white dark:bg-[#1a3a2e] text-[#375534] dark:text-[#E3EED4] border border-[#AEC3B0]/40 dark:border-[#375534]/40'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            filterStatus === 'active'
                                ? 'bg-[#375534] text-white'
                                : 'bg-white dark:bg-[#1a3a2e] text-[#375534] dark:text-[#E3EED4] border border-[#AEC3B0]/40 dark:border-[#375534]/40'
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilterStatus('resolved')}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            filterStatus === 'resolved'
                                ? 'bg-[#375534] text-white'
                                : 'bg-white dark:bg-[#1a3a2e] text-[#375534] dark:text-[#E3EED4] border border-[#AEC3B0]/40 dark:border-[#375534]/40'
                        }`}
                    >
                        Resolved
                    </button>

                    <div className="flex items-center gap-2 ml-6">
                        <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Priority:</span>
                    </div>
                    {(['High', 'Medium', 'Low'] as const).map((priority) => (
                        <button
                            key={priority}
                            onClick={() => setFilterPriority(filterPriority === priority ? 'all' : priority)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                filterPriority === priority
                                    ? getPriorityColor(priority)
                                    : 'bg-white dark:bg-[#1a3a2e] text-[#375534] dark:text-[#E3EED4] border border-[#AEC3B0]/40 dark:border-[#375534]/40'
                            }`}
                        >
                            {priority}
                        </button>
                    ))}
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`rounded-2xl border p-6 transition-all ${
                                    alert.status === 'Active' && alert.priorityLevel === 'High'
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 shadow-md'
                                        : alert.status === 'Active'
                                        ? 'bg-white dark:bg-[#0F2A1D] border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm'
                                        : 'bg-gray-50 dark:bg-[#0F2A1D]/50 border-gray-200 dark:border-[#375534]/20 opacity-75'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Status Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getStatusIcon(alert.status)}
                                        </div>

                                        {/* Alert Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priorityLevel)}`}>
                                                    {getAlertTypeIcon(alert.alertType)}
                                                    {alert.alertType}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                    alert.status === 'Active'
                                                        ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                                                        : alert.status === 'Acknowledged'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
                                                        : 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                                                }`}>
                                                    {alert.status}
                                                </span>
                                                <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                    {alert.priorityLevel} Priority
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                                {alert.touristGroupName}
                                            </h3>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Tourists</p>
                                                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {alert.numberOfTourists}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Guide</p>
                                                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {alert.assignedGuideName || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Activity</p>
                                                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4] truncate">
                                                        {alert.activityServiceName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Date & Time</p>
                                                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4] text-sm">
                                                        {alert.activityDateTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                                {alert.description}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                <span>Created: {alert.createdAt}</span>
                                                {alert.resolutionNotes && (
                                                    <span>• Notes: {alert.resolutionNotes}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {alert.status === 'Active' && (
                                        <div className="flex gap-2 flex-shrink-0">
                                            {alert.suggestedAction === 'Acknowledge' || alert.suggestedAction === 'View' ? (
                                                <button
                                                    onClick={() => setShowAcknowledgeModal(alert.id)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors text-sm"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Acknowledge
                                                </button>
                                            ) : null}
                                            {alert.suggestedAction === 'Resolve' ? (
                                                <button
                                                    onClick={() => setShowResolveModal(alert.id)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-sm"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Resolve
                                                </button>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D]">
                            <AlertCircle className="w-12 h-12 text-[#AEC3B0] dark:text-[#375534] mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                No alerts found
                            </p>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                Great! You're all caught up.
                            </p>
                        </div>
                    )}
                </div>

                {/* Acknowledge Modal */}
                {showAcknowledgeModal !== null && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Acknowledge Alert?
                            </h3>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-6">
                                Mark this alert as acknowledged to indicate you've reviewed it.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAcknowledgeModal(null)}
                                    className="flex-1 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleAcknowledge(showAcknowledgeModal);
                                    }}
                                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                >
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resolve Modal */}
                {showResolveModal !== null && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Resolve Alert
                            </h3>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-4">
                                Add notes about how you resolved this alert (optional).
                            </p>
                            <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Enter resolution notes..."
                                className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#AEC3B0] dark:placeholder-[#6B8071] focus:outline-none focus:ring-2 focus:ring-[#375534] dark:focus:ring-[#AEC3B0] mb-4 resize-none"
                                rows={4}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowResolveModal(null);
                                        setResolutionNotes('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleResolve(showResolveModal);
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Resolve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
