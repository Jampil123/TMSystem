import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, CheckCircle, AlertTriangle, Zap, RefreshCw, Trash2, Filter } from 'lucide-react';

interface SafetyAlert {
    id: number;
    type: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    target_role: string;
    severity_color: string;
    type_icon: string;
    details: Record<string, any>;
    created_at: string;
    is_resolved?: boolean;
}

interface SummaryData {
    total: number;
    by_severity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    by_type: Record<string, number>;
}

export default function SafetyAlerts() {
    const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchAlerts();
        fetchSummary();
        // Poll for new alerts every 30 seconds
        const interval = setInterval(() => {
            fetchAlerts();
            fetchSummary();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/admin/api/safety-alerts');
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data || []);
            }
        } catch (error) {
            setErrorMessage('Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await fetch('/admin/api/safety-alerts/summary');
            const data = await response.json();
            if (data.success) {
                setSummary(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch summary');
        }
    };

    const runSafetyCheck = async () => {
        try {
            setRunning(true);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await fetch('/admin/api/safety-alerts/check', {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMessage('Safety check completed. Alerts refreshed.');
                await fetchAlerts();
                await fetchSummary();
            } else {
                setErrorMessage('Failed to run safety check');
            }
        } catch (error) {
            setErrorMessage('Error running safety check');
        } finally {
            setRunning(false);
        }
    };

    const resolveAlert = async (alertId: number) => {
        try {
            const response = await fetch(`/admin/api/safety-alerts/${alertId}/resolve`, {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await response.json();
            if (data.success) {
                setAlerts(alerts.filter(a => a.id !== alertId));
                setSuccessMessage('Alert resolved');
                await fetchSummary();
            }
        } catch (error) {
            setErrorMessage('Failed to resolve alert');
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
        const typeMatch = selectedType === 'all' || alert.type === selectedType;
        return severityMatch && typeMatch;
    });

    const severityColors = {
        critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
        high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
        medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
        low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'high':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'medium':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'low':
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    return (
        <AppLayout>
            <Head title="Safety Alerts" />

            <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Safety Alert Engine</h1>
                    <p className="mt-2 text-gray-600">
                        Monitor and manage system safety alerts generated by continuous evaluation of visitor activity, guide assignments, and capacity compliance.
                    </p>
                </div>

                {/* Alert Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-green-900">{successMessage}</h3>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-900">{errorMessage}</h3>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-sm font-medium text-gray-600">Total Alerts</div>
                            <div className="text-2xl font-bold text-gray-900 mt-2">{summary.total}</div>
                        </div>
                        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                            <div className="text-sm font-medium text-red-700">Critical</div>
                            <div className="text-2xl font-bold text-red-900 mt-2">{summary.by_severity.critical}</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                            <div className="text-sm font-medium text-orange-700">High</div>
                            <div className="text-2xl font-bold text-orange-900 mt-2">{summary.by_severity.high}</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                            <div className="text-sm font-medium text-yellow-700">Medium</div>
                            <div className="text-2xl font-bold text-yellow-900 mt-2">{summary.by_severity.medium}</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div className="text-sm font-medium text-blue-700">Low</div>
                            <div className="text-2xl font-bold text-blue-900 mt-2">{summary.by_severity.low}</div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Severities</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="capacity_warning">Capacity Warning</option>
                                    <option value="capacity_critical">Capacity Critical</option>
                                    <option value="guide_assignment_issue">Guide Assignment Issue</option>
                                    <option value="guide_unavailable">Guide Unavailable</option>
                                    <option value="invalid_qr">Invalid QR</option>
                                    <option value="duplicate_entry">Duplicate Entry</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={runSafetyCheck}
                            disabled={running}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
                        >
                            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                            {running ? 'Checking...' : 'Run Safety Check'}
                        </button>
                    </div>
                </div>

                {/* Alerts List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                        <p className="text-gray-600">
                            All safety conditions are within normal operating parameters.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAlerts.map((alert) => {
                            const colors = severityColors[alert.severity as keyof typeof severityColors] || severityColors.low;
                            return (
                                <div key={alert.id} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {getSeverityIcon(alert.severity)}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`font-semibold ${colors.text}`}>
                                                        {alert.title}
                                                    </h3>
                                                    <span className={`${colors.badge} px-2 py-1 rounded text-xs font-medium`}>
                                                        {alert.severity.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${colors.text} mb-2`}>
                                                    {alert.message}
                                                </p>
                                                {alert.details && Object.keys(alert.details).length > 0 && (
                                                    <div className={`text-xs ${colors.text} opacity-75 space-y-1 mt-2`}>
                                                        {Object.entries(alert.details).map(([key, value]) => (
                                                            <div key={key}>
                                                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {new Date(alert.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => resolveAlert(alert.id)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition ${colors.badge} ${colors.text} hover:opacity-80`}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Safety Alert Engine Overview</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Monitors guide-to-guest ratio compliance</li>
                        <li>✓ Tracks capacity thresholds (warning and critical)</li>
                        <li>✓ Detects missing guide assignments</li>
                        <li>✓ Identifies guide schedule conflicts</li>
                        <li>✓ Triggers alerts for system administrators and staff</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
