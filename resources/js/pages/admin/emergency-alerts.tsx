import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import axios from 'axios';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Emergency Alerts', href: '#' },
];

interface Emergency {
    id: string;
    emergency_type: string;
    severity: string;
    title: string;
    description: string;
    details: Record<string, any>;
    is_active: boolean;
    triggered_by_user_id: string;
    triggered_by?: { name: string; email: string };
    created_at: string;
    resolved_at?: string;
    resolved_by_user_id?: string;
    resolution_notes?: string;
}

interface EmergencyStatus {
    active_count: number;
    total_emergency_types: number;
    entry_blocked: boolean;
    should_block_entry: boolean;
    recently_resolved_count: number;
    type_breakdown: Record<string, number>;
}

const EmergencyAlertsDashboard = () => {
    const [activeEmergencies, setActiveEmergencies] = useState<Emergency[]>([]);
    const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus | null>(null);
    const [emergencyHistory, setEmergencyHistory] = useState<Emergency[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTriggerForm, setShowTriggerForm] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState<string | null>(null);
    const [triggerFormData, setTriggerFormData] = useState({
        title: '',
        description: '',
        details: {},
    });
    const [resolveNotes, setResolveNotes] = useState('');
    const [filterType, setFilterType] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch all emergency data
    const fetchEmergencyData = useCallback(async () => {
        setLoading(true);
        try {
            const [activeRes, statusRes, historyRes] = await Promise.all([
                axios.get('/admin/api/emergency-alerts'),
                axios.get('/admin/api/emergency-alerts/status'),
                axios.get('/admin/api/emergency-alerts/history'),
            ]);

            setActiveEmergencies(activeRes.data.data || []);
            setEmergencyStatus(statusRes.data.data || null);
            setEmergencyHistory(historyRes.data.data || []);
        } catch (error) {
            console.error('Error fetching emergency data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchEmergencyData();

        let interval: NodeJS.Timeout | null = null;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchEmergencyData();
            }, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, fetchEmergencyData]);

    const handleTriggerEmergency = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!triggerFormData.title.trim() || !triggerFormData.description.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await axios.post('/admin/api/emergency-alerts/trigger', triggerFormData);
            setShowTriggerForm(false);
            setTriggerFormData({ title: '', description: '', details: {} });
            fetchEmergencyData();
        } catch (error) {
            console.error('Error triggering emergency:', error);
            alert('Failed to trigger emergency alert');
        }
    };

    const handleResolveEmergency = async (emergencyId: string) => {
        if (!resolveNotes.trim()) {
            alert('Please provide resolution notes');
            return;
        }

        try {
            await axios.post(`/admin/api/emergency-alerts/${emergencyId}/resolve`, {
                resolution_notes: resolveNotes,
            });
            setShowResolveModal(null);
            setResolveNotes('');
            fetchEmergencyData();
        } catch (error) {
            console.error('Error resolving emergency:', error);
            alert('Failed to resolve emergency');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-50 border-red-500 text-red-900';
            case 'warning':
                return 'bg-yellow-50 border-yellow-500 text-yellow-900';
            default:
                return 'bg-orange-50 border-orange-500 text-orange-900';
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-orange-100 text-orange-800';
        }
    };

    const getEmergencyIcon = (type: string) => {
        switch (type) {
            case 'capacity_exceeded':
                return <AlertTriangle className="w-6 h-6" />;
            case 'no_guide_assignment':
                return <AlertCircle className="w-6 h-6" />;
            case 'unsafe_density':
                return <Zap className="w-6 h-6" />;
            case 'manual_trigger':
                return <AlertTriangle className="w-6 h-6" />;
            case 'system_error':
                return <AlertCircle className="w-6 h-6" />;
            default:
                return <AlertTriangle className="w-6 h-6" />;
        }
    };

    const filteredHistory =
        filterType === ''
            ? emergencyHistory
            : emergencyHistory.filter((e) => e.emergency_type === filterType);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Emergency Alerts Management" />

            <div className="p-6 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen space-y-6">
                <div className="max-w-7xl mx-auto">

                    {/* Status Cards */}
                    {emergencyStatus && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-green-900 rounded-lg border-l-4 border-red-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Active Emergencies</p>
                                        <p className="text-3xl font-bold text-red-300">
                                            {emergencyStatus.active_count}
                                        </p>
                                    </div>
                                    <AlertTriangle className="w-12 h-12 text-red-400 opacity-30" />
                                </div>
                            </div>

                            <div className="bg-green-900 rounded-lg border-l-4 border-orange-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Emergency Types Active</p>
                                        <p className="text-3xl font-bold text-orange-300">
                                            {emergencyStatus.total_emergency_types}
                                        </p>
                                    </div>
                                    <Zap className="w-12 h-12 text-orange-400 opacity-30" />
                                </div>
                            </div>

                            <div
                                className={`bg-green-900 rounded-lg border-l-4 p-6 ${
                                    emergencyStatus.should_block_entry
                                        ? 'border-red-500'
                                        : 'border-green-500'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Entry Status</p>
                                        <p
                                            className={`text-3xl font-bold ${
                                                emergencyStatus.should_block_entry
                                                    ? 'text-red-300'
                                                    : 'text-green-300'
                                            }`}
                                        >
                                            {emergencyStatus.should_block_entry ? 'BLOCKED' : 'ACTIVE'}
                                        </p>
                                    </div>
                                    {emergencyStatus.should_block_entry ? (
                                        <AlertTriangle className="w-12 h-12 text-red-400 opacity-30" />
                                    ) : (
                                        <CheckCircle className="w-12 h-12 text-green-400 opacity-30" />
                                    )}
                                </div>
                            </div>

                            <div className="bg-green-900 rounded-lg border-l-4 border-green-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Recently Resolved</p>
                                        <p className="text-3xl font-bold text-green-200">
                                            {emergencyStatus.recently_resolved_count}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-12 h-12 text-green-300 opacity-20" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex gap-3">
                            <button
                                onClick={() => fetchEmergencyData()}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowTriggerForm(!showTriggerForm)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Trigger Emergency
                            </button>
                        </div>
                    </div>
                

                    {/* Trigger Form */}
                    {showTriggerForm && (
                        <div className="bg-white rounded-lg border border-red-300 p-6 mb-8">
                            <h2 className="text-lg font-bold text-red-900 mb-4">Manually Trigger Emergency</h2>
                            <form onSubmit={handleTriggerEmergency}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Emergency Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={triggerFormData.title}
                                            onChange={(e) =>
                                                setTriggerFormData({
                                                    ...triggerFormData,
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="e.g., Structural Damage Detected"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={triggerFormData.description}
                                            onChange={(e) =>
                                                setTriggerFormData({
                                                    ...triggerFormData,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Detailed description of the emergency..."
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                        >
                                            Trigger Emergency
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowTriggerForm(false)}
                                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Active Emergencies */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Emergencies</h2>
                        {activeEmergencies.length === 0 ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-green-800 font-medium">No active emergencies detected</p>
                                <p className="text-green-600 text-sm mt-1">All systems operating normally</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                {activeEmergencies.map((emergency) => (
                                    <div
                                        key={emergency.id}
                                        className={`border-l-4 rounded-lg p-6 ${getSeverityColor(
                                            emergency.severity
                                        )} border`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl mt-1">
                                                    {getEmergencyIcon(emergency.emergency_type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{emergency.title}</h3>
                                                    <p className="text-sm opacity-75">
                                                        Type: {emergency.emergency_type.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(emergency.severity)}`}>
                                                {emergency.severity.toUpperCase()}
                                            </span>
                                        </div>

                                        <p className="mb-3">{emergency.description}</p>

                                        {emergency.details && (
                                            <div className="bg-black bg-opacity-10 rounded p-3 mb-4 text-sm font-mono">
                                                {Object.entries(emergency.details).map(([key, value]) => (
                                                    <div key={key} className="opacity-80">
                                                        <strong>{key}:</strong> {JSON.stringify(value)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm opacity-75 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(emergency.created_at).toLocaleString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowResolveModal(emergency.id)}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                                        >
                                            Resolve Emergency
                                        </button>

                                        {/* Resolve Modal */}
                                        {showResolveModal === emergency.id && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                        Resolve Emergency
                                                    </h3>
                                                    <textarea
                                                        value={resolveNotes}
                                                        onChange={(e) => setResolveNotes(e.target.value)}
                                                        placeholder="Enter resolution notes..."
                                                        rows={5}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleResolveEmergency(emergency.id)}
                                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                                        >
                                                            Resolve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowResolveModal(null);
                                                                setResolveNotes('');
                                                            }}
                                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Emergency History */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Emergency History</h2>
                            <div className="flex gap-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="capacity_exceeded">Capacity Exceeded</option>
                                    <option value="no_guide_assignment">No Guide Assignment</option>
                                    <option value="unsafe_density">Unsafe Density</option>
                                    <option value="manual_trigger">Manual Trigger</option>
                                    <option value="system_error">System Error</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-[#6B9071] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-white dark:text-[#E3EED4]">Title</th>
                                        <th className="text-left py-3 px-4 font-semibold text-white dark:text-[#E3EED4]">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-white dark:text-[#E3EED4]">Severity</th>
                                        <th className="text-left py-3 px-4 font-semibold text-white dark:text-[#E3EED4]">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-white dark:text-[#E3EED4]">Triggered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No emergency records found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHistory.map((emergency) => (
                                            <tr
                                                key={emergency.id}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                    {emergency.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {emergency.emergency_type.replace(/_/g, ' ')}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(
                                                            emergency.severity
                                                        )}`}
                                                    >
                                                        {emergency.severity.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {emergency.is_active ? (
                                                        <span className="text-red-600 font-semibold">🚨 ACTIVE</span>
                                                    ) : (
                                                        <span className="text-green-600 font-semibold">✓ Resolved</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(emergency.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default EmergencyAlertsDashboard;
