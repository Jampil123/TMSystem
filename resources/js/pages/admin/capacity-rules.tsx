import React, { useState, useEffect, FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, Check, Save, RotateCcw, ChevronDown } from 'lucide-react';

interface CapacityRule {
    id: number;
    max_visitors: number;
    warning_threshold_percent: number;
    critical_threshold_percent: number;
    max_guests_per_guide: number;
    max_daily_visitors: number;
    created_at: string;
    updated_at: string;
}

interface HistoryEntry {
    id: number;
    capacity_rule_id: number;
    admin_id?: number;
    changes: Record<string, any>;
    created_at: string;
    admin?: { name: string; email: string };
}

interface FormErrors {
    [key: string]: string | null;
}

export default function CapacityRules() {
    const [rules, setRules] = useState<CapacityRule | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const [formData, setFormData] = useState({
        max_visitors: 0,
        warning_threshold_percent: 0,
        critical_threshold_percent: 0,
        max_guests_per_guide: 0,
        max_daily_visitors: 0,
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Fetch current capacity rules
    useEffect(() => {
        fetchCapacityRules();
    }, []);

    const fetchCapacityRules = async () => {
        try {
            setLoading(true);
            const response = await fetch('/admin/api/capacity-rules');
            const data = await response.json();

            if (data.success) {
                setRules(data.data);
                setFormData(data.data);
                setErrorMessage('');
            } else {
                setErrorMessage(data.error || 'Failed to load capacity rules');
            }
        } catch (error) {
            setErrorMessage('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch('/admin/api/capacity-rules/history');
            const data = await response.json();

            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleShowHistory = () => {
        setShowHistory(!showHistory);
        if (!showHistory && history.length === 0) {
            fetchHistory();
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field when user starts editing
        setFormErrors(prev => ({
            ...prev,
            [field]: null,
        }));
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        // Validation rules based on controller
        if (formData.max_visitors < 10 || formData.max_visitors > 10000) {
            errors.max_visitors = 'Must be between 10 and 10,000';
        }

        if (formData.warning_threshold_percent < 1 || formData.warning_threshold_percent > 99) {
            errors.warning_threshold_percent = 'Must be between 1% and 99%';
        }

        if (formData.critical_threshold_percent < 1 || formData.critical_threshold_percent > 100) {
            errors.critical_threshold_percent = 'Must be between 1% and 100%';
        }

        if (formData.warning_threshold_percent >= formData.critical_threshold_percent) {
            errors.warning_threshold_percent = 'Must be less than critical threshold';
        }

        if (formData.max_guests_per_guide < 1 || formData.max_guests_per_guide > 100) {
            errors.max_guests_per_guide = 'Must be between 1 and 100';
        }

        if (formData.max_daily_visitors < 10 || formData.max_daily_visitors > 10000) {
            errors.max_daily_visitors = 'Must be between 10 and 10,000';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setErrorMessage('Please fix validation errors below');
            return;
        }

        try {
            setSaving(true);
            setSuccessMessage('');
            setErrorMessage('');

            const response = await fetch('/admin/api/capacity-rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setRules(data.data);
                setSuccessMessage('Capacity rules updated successfully');
                // Refresh history
                fetchHistory();
            } else {
                setErrorMessage(data.error || 'Failed to update capacity rules');
            }
        } catch (error) {
            setErrorMessage('Error saving capacity rules');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!showResetConfirm) {
            setShowResetConfirm(true);
            return;
        }

        try {
            setResetting(true);
            setErrorMessage('');
            setSuccessMessage('');

            const response = await fetch('/admin/api/capacity-rules/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setRules(data.data);
                setFormData(data.data);
                setSuccessMessage('Capacity rules reset to default values');
                setShowResetConfirm(false);
                // Refresh history
                fetchHistory();
            } else {
                setErrorMessage(data.error || 'Failed to reset capacity rules');
            }
        } catch (error) {
            setErrorMessage('Error resetting capacity rules');
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <Head title="Capacity Rules Configuration" />
                <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Capacity Rules Configuration" />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Capacity Rules Configuration</h1>
                    <p className="mt-2 text-gray-600">
                        Configure system capacity limits and thresholds for visitor monitoring and alerts
                    </p>
                </div>

                {/* Alert Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Max Visitors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Visitors
                            </label>
                            <input
                                type="number"
                                value={formData.max_visitors}
                                onChange={(e) => handleInputChange('max_visitors', parseInt(e.target.value))}
                                min="10"
                                max="10000"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    formErrors.max_visitors
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            <p className="mt-1 text-xs text-gray-500">Range: 10 - 10,000</p>
                            {formErrors.max_visitors && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.max_visitors}</p>
                            )}
                        </div>

                        {/* Warning Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Warning Threshold (%)
                            </label>
                            <input
                                type="number"
                                value={formData.warning_threshold_percent}
                                onChange={(e) => handleInputChange('warning_threshold_percent', parseInt(e.target.value))}
                                min="1"
                                max="99"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    formErrors.warning_threshold_percent
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            <p className="mt-1 text-xs text-gray-500">Range: 1% - 99% (less than critical)</p>
                            {formErrors.warning_threshold_percent && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.warning_threshold_percent}</p>
                            )}
                        </div>

                        {/* Critical Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Critical Threshold (%)
                            </label>
                            <input
                                type="number"
                                value={formData.critical_threshold_percent}
                                onChange={(e) => handleInputChange('critical_threshold_percent', parseInt(e.target.value))}
                                min="1"
                                max="100"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    formErrors.critical_threshold_percent
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            <p className="mt-1 text-xs text-gray-500">Range: 1% - 100%</p>
                            {formErrors.critical_threshold_percent && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.critical_threshold_percent}</p>
                            )}
                        </div>

                        {/* Max Guests Per Guide */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Guests Per Guide
                            </label>
                            <input
                                type="number"
                                value={formData.max_guests_per_guide}
                                onChange={(e) => handleInputChange('max_guests_per_guide', parseInt(e.target.value))}
                                min="1"
                                max="100"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    formErrors.max_guests_per_guide
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            <p className="mt-1 text-xs text-gray-500">Range: 1 - 100 guests</p>
                            {formErrors.max_guests_per_guide && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.max_guests_per_guide}</p>
                            )}
                        </div>

                        {/* Max Daily Visitors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Daily Visitors
                            </label>
                            <input
                                type="number"
                                value={formData.max_daily_visitors}
                                onChange={(e) => handleInputChange('max_daily_visitors', parseInt(e.target.value))}
                                min="10"
                                max="10000"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    formErrors.max_daily_visitors
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            <p className="mt-1 text-xs text-gray-500">Range: 10 - 10,000</p>
                            {formErrors.max_daily_visitors && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.max_daily_visitors}</p>
                            )}
                        </div>
                    </div>

                    {/* Summary Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Current Configuration Summary</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Maximum capacity: <span className="font-semibold">{formData.max_visitors}</span> visitors</li>
                            <li>• Warning level: <span className="font-semibold">{formData.warning_threshold_percent}%</span> capacity</li>
                            <li>• Critical level: <span className="font-semibold">{formData.critical_threshold_percent}%</span> capacity</li>
                            <li>• Safe capacity: <span className="font-semibold">{Math.round((formData.max_visitors * formData.warning_threshold_percent) / 100)}</span> visitors</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={resetting}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {showResetConfirm ? 'Confirm Reset?' : 'Reset to Defaults'}
                        </button>

                        {showResetConfirm && (
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Change History */}
                <div className="mt-8 border-t pt-8">
                    <button
                        onClick={handleShowHistory}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
                    >
                        <ChevronDown className={`w-4 h-4 transform ${showHistory ? 'rotate-180' : ''}`} />
                        Change History
                    </button>

                    {showHistory && (
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <p className="text-gray-500 text-sm">No changes recorded yet</p>
                            ) : (
                                history.map((entry) => (
                                    <div key={entry.id} className="border rounded-lg p-3 text-sm bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {entry.admin?.name || 'System'} updated rules
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {entry.changes && Object.keys(entry.changes).length > 0 && (
                                            <div className="mt-2 text-xs space-y-1">
                                                {Object.entries(entry.changes).map(([field, value]) => (
                                                    <p key={field} className="text-gray-600">
                                                        <span className="font-medium">{field}:</span> {JSON.stringify(value)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
