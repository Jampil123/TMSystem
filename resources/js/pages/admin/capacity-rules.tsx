import React, { useState, useEffect, FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, Check, Save, X, ChevronRight, MapPin, Tag } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Capacity Rules', href: '#' },
];

interface Attraction {
    id: number;
    name: string;
    location: string;
    category: string;
    image_url?: string;
}

interface CapacityRule {
    id: number;
    attraction_id: number;
    max_visitors: number;
    warning_threshold_percent: number;
    critical_threshold_percent: number;
    max_guests_per_guide: number;
    max_daily_visitors: number;
    created_at: string;
    updated_at: string;
}

interface FormErrors {
    [key: string]: string | null;
}

export default function CapacityRules() {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [capacityRules, setCapacityRules] = useState<Record<number, CapacityRule>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [editingAttractionId, setEditingAttractionId] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState({
        max_visitors: 0,
        warning_threshold_percent: 0,
        critical_threshold_percent: 0,
        max_guests_per_guide: 0,
        max_daily_visitors: 0,
    });

    // Fetch attractions and capacity rules
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attractionsRes, rulesRes] = await Promise.all([
                fetch('/admin/api/attractions'),
                fetch('/admin/api/capacity-rules/all'),
            ]);

            const attractionsData = await attractionsRes.json();
            const rulesData = await rulesRes.json();

            if (attractionsData.success) {
                setAttractions(attractionsData.data || []);
            }

            if (rulesData.success) {
                const rulesMap: Record<number, CapacityRule> = {};
                (rulesData.data || []).forEach((rule: CapacityRule) => {
                    rulesMap[rule.attraction_id] = rule;
                });
                setCapacityRules(rulesMap);
            }

            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAttraction = (attractionId: number) => {
        const rule = capacityRules[attractionId];
        if (rule) {
            setFormData({
                max_visitors: rule.max_visitors,
                warning_threshold_percent: rule.warning_threshold_percent,
                critical_threshold_percent: rule.critical_threshold_percent,
                max_guests_per_guide: rule.max_guests_per_guide,
                max_daily_visitors: rule.max_daily_visitors,
            });
        } else {
            setFormData({
                max_visitors: 350,
                warning_threshold_percent: 80,
                critical_threshold_percent: 100,
                max_guests_per_guide: 20,
                max_daily_visitors: 500,
            });
        }
        setEditingAttractionId(attractionId);
        setFormErrors({});
    };

    const handleInputChange = (field: keyof typeof formData, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        setFormErrors(prev => ({
            ...prev,
            [field]: null,
        }));
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

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

        if (!validateForm() || !editingAttractionId) {
            setErrorMessage('Please fix validation errors');
            return;
        }

        try {
            setSaving(true);
            setSuccessMessage('');
            setErrorMessage('');

            const response = await fetch(`/admin/api/capacity-rules/${editingAttractionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    attraction_id: editingAttractionId,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setCapacityRules(prev => ({
                    ...prev,
                    [editingAttractionId]: data.data,
                }));
                setSuccessMessage('Capacity rules updated successfully');
                setEditingAttractionId(null);
            } else {
                setErrorMessage(data.error || 'Failed to update capacity rules');
            }
        } catch (error) {
            setErrorMessage('Error saving capacity rules');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Capacity Rules Configuration" />
                <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Capacity Rules Configuration" />

            <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-[#E3EED4]">
                {/* Header */}
                <div className="bg-white border-b border-[#AEC3B0] px-6 py-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0F2A1D]">Attraction Capacity Management</h1>
                            <p className="text-sm text-[#375534] mt-1">Configure visitor limits and thresholds for each attraction</p>
                        </div>
                    </div>
                </div>

                {/* Alert Messages - Fixed Position */}
                <div className="px-6 pt-4">
                    {successMessage && (
                        <div className="mb-4 p-4 bg-[#E3EED4] border border-[#AEC3B0] rounded-lg flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#375534] flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-[#0F2A1D]">{successMessage}</h3>
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
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#375534]"></div>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
                        {/* Left Panel - Attractions List */}
                        <div className="w-80 bg-white rounded-lg shadow border border-[#AEC3B0] overflow-hidden flex flex-col">
                            {/* List Header */}
                            <div className="bg-gradient-to-r from-[#0F2A1D] to-[#375534] px-6 py-4">
                                <h2 className="text-lg font-semibold text-[#E3EED4]">Attractions</h2>
                                <p className="text-sm text-[#AEC3B0] mt-1">{attractions.length} attractions</p>
                            </div>

                            {/* Attractions List */}
                            <div className="flex-1 overflow-y-auto">
                                {attractions.length > 0 ? (
                                    <div className="p-4 space-y-2">
                                        {attractions.map(attraction => {
                                            const rule = capacityRules[attraction.id];
                                            const isSelected = editingAttractionId === attraction.id;

                                            return (
                                                <button
                                                    key={attraction.id}
                                                    onClick={() => handleEditAttraction(attraction.id)}
                                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-[#375534] bg-[#E3EED4]'
                                                            : 'border-[#AEC3B0] bg-white hover:border-[#6B8071] hover:bg-[#E3EED4]'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-semibold truncate ${isSelected ? 'text-[#0F2A1D]' : 'text-[#375534]'}`}>
                                                                {attraction.name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-2 text-xs text-[#6B8071]">
                                                                <MapPin className="w-3 h-3" />
                                                                <span className="truncate">{attraction.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-[#6B8071]">
                                                                <Tag className="w-3 h-3" />
                                                                <span>{attraction.category}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {rule ? (
                                                                <div className="text-right">
                                                                    <span className="inline-block bg-[#AEC3B0] text-[#0F2A1D] px-2 py-1 rounded text-xs font-semibold">
                                                                        {rule.max_visitors}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="inline-block bg-[#E3EED4] text-[#6B8071] px-2 py-1 rounded text-xs">
                                                                    Not set
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-[#6B8071] text-center">No attractions found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel - Edit Form */}
                        <div className="flex-1 bg-white rounded-lg shadow border border-[#AEC3B0] flex flex-col">
                            {editingAttractionId ? (
                                <>
                                    {/* Form Header */}
                                    <div className="bg-gradient-to-r from-[#0F2A1D] to-[#375534] px-8 py-6 border-b border-[#AEC3B0]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-[#E3EED4]">
                                                    Capacity Configuration
                                                </h2>
                                                <p className="text-sm text-[#AEC3B0] mt-1">
                                                    {attractions.find(a => a.id === editingAttractionId)?.name}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setEditingAttractionId(null)}
                                                className="text-[#AEC3B0] hover:text-[#E3EED4] transition"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Form Content */}
                                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-8 py-6 overflow-y-auto">
                                        {/* Current Settings Preview */}
                                        {capacityRules[editingAttractionId] && (
                                            <div className="mb-6 p-4 bg-[#E3EED4] border border-[#AEC3B0] rounded-lg">
                                                <p className="text-sm font-medium text-[#0F2A1D] mb-3">Current Settings</p>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-[#375534] font-semibold">{capacityRules[editingAttractionId].max_visitors}</span>
                                                        <p className="text-xs text-[#6B8071] mt-1">Max Visitors</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#375534] font-semibold">{capacityRules[editingAttractionId].warning_threshold_percent}%</span>
                                                        <p className="text-xs text-[#6B8071] mt-1">Warning Level</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#375534] font-semibold">{capacityRules[editingAttractionId].critical_threshold_percent}%</span>
                                                        <p className="text-xs text-[#6B8071] mt-1">Critical Level</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Form Fields Grid */}
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            {/* Max Visitors */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F2A1D] mb-2">
                                                    Maximum Visitors
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.max_visitors}
                                                    onChange={(e) => handleInputChange('max_visitors', parseInt(e.target.value))}
                                                    min="10"
                                                    max="10000"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                                        formErrors.max_visitors
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                            : 'border-[#AEC3B0] focus:ring-[#375534] bg-[#E3EED4]'
                                                    }`}
                                                />
                                                <p className="mt-1 text-xs text-[#6B8071]">Range: 10 - 10,000</p>
                                                {formErrors.max_visitors && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.max_visitors}</p>
                                                )}
                                            </div>

                                            {/* Warning Threshold */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F2A1D] mb-2">
                                                    Warning Threshold (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.warning_threshold_percent}
                                                    onChange={(e) => handleInputChange('warning_threshold_percent', parseInt(e.target.value))}
                                                    min="1"
                                                    max="99"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                                        formErrors.warning_threshold_percent
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                            : 'border-[#AEC3B0] focus:ring-[#375534] bg-[#E3EED4]'
                                                    }`}
                                                />
                                                <p className="mt-1 text-xs text-[#6B8071]">Range: 1% - 99%</p>
                                                {formErrors.warning_threshold_percent && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.warning_threshold_percent}</p>
                                                )}
                                            </div>

                                            {/* Critical Threshold */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F2A1D] mb-2">
                                                    Critical Threshold (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.critical_threshold_percent}
                                                    onChange={(e) => handleInputChange('critical_threshold_percent', parseInt(e.target.value))}
                                                    min="1"
                                                    max="100"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                                        formErrors.critical_threshold_percent
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                            : 'border-[#AEC3B0] focus:ring-[#375534] bg-[#E3EED4]'
                                                    }`}
                                                />
                                                <p className="mt-1 text-xs text-[#6B8071]">Range: 1% - 100%</p>
                                                {formErrors.critical_threshold_percent && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.critical_threshold_percent}</p>
                                                )}
                                            </div>

                                            {/* Max Guests Per Guide */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F2A1D] mb-2">
                                                    Max Guests Per Guide
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.max_guests_per_guide}
                                                    onChange={(e) => handleInputChange('max_guests_per_guide', parseInt(e.target.value))}
                                                    min="1"
                                                    max="100"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                                        formErrors.max_guests_per_guide
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                            : 'border-[#AEC3B0] focus:ring-[#375534] bg-[#E3EED4]'
                                                    }`}
                                                />
                                                <p className="mt-1 text-xs text-[#6B8071]">Range: 1 - 100</p>
                                                {formErrors.max_guests_per_guide && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.max_guests_per_guide}</p>
                                                )}
                                            </div>

                                            {/* Max Daily Visitors */}
                                            <div col-span-2>
                                                <label className="block text-sm font-semibold text-[#0F2A1D] mb-2">
                                                    Max Daily Visitors
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.max_daily_visitors}
                                                    onChange={(e) => handleInputChange('max_daily_visitors', parseInt(e.target.value))}
                                                    min="10"
                                                    max="10000"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                                                        formErrors.max_daily_visitors
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                            : 'border-[#AEC3B0] focus:ring-[#375534] bg-[#E3EED4]'
                                                    }`}
                                                />
                                                <p className="mt-1 text-xs text-[#6B8071]">Range: 10 - 10,000</p>
                                                {formErrors.max_daily_visitors && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.max_daily_visitors}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Summary Card */}
                                        <div className="p-4 bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] border border-[#6B8071] rounded-lg mb-6">
                                            <h3 className="text-sm font-semibold text-[#0F2A1D] mb-3">Quick Summary</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-[#375534] font-semibold text-lg">{formData.max_visitors}</p>
                                                    <p className="text-xs text-[#6B8071]">Total Capacity</p>
                                                </div>
                                                <div>
                                                    <p className="text-[#375534] font-semibold text-lg">
                                                        {Math.round((formData.max_visitors * formData.warning_threshold_percent) / 100)}
                                                    </p>
                                                    <p className="text-xs text-[#6B8071]">Safe Capacity ({formData.warning_threshold_percent}%)</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex-1 flex items-end gap-3 pt-6 border-t border-[#AEC3B0]">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0F2A1D] to-[#375534] text-white rounded-lg hover:from-[#1A3A2A] hover:to-[#456344] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                                            >
                                                <Save className="w-5 h-5" />
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingAttractionId(null)}
                                                className="px-6 py-3 border border-[#AEC3B0] text-[#375534] rounded-lg hover:bg-[#E3EED4] transition font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-[#6B8071]">
                                    <div className="text-center">
                                        <ChevronRight className="w-12 h-12 mx-auto mb-3 text-[#AEC3B0]" />
                                        <p className="font-medium">Select an attraction</p>
                                        <p className="text-sm mt-1">Click on an attraction from the list to configure capacity rules</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
