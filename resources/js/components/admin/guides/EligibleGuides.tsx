import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Guide {
    id: number;
    full_name: string;
    email: string;
    contact_number: string;
    years_of_experience: number;
    specialty_areas: string[];
    is_available: boolean;
    expiry_status: string;
    assignment_summary: {
        total_assignments: number;
        total_guests: number;
        assignments: any[];
    };
    expired_certifications: any[];
    expiring_soon_certifications: any[];
}

interface EligibleGuidesProps {
    guestListId: number;
    visitDate: string;
    totalGuests: number;
    serviceType?: string;
    onGuideSelected?: (guide: Guide) => void;
    onAutoAssign?: () => void;
    isLoading?: boolean;
    isOpen?: boolean;
}

export default function EligibleGuides({
    guestListId,
    visitDate,
    totalGuests,
    serviceType,
    onGuideSelected,
    onAutoAssign,
    isLoading = false,
    isOpen = true,
}: EligibleGuidesProps) {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [filterHasWarnings, setFilterHasWarnings] = useState(false);

    useEffect(() => {
        console.log('EligibleGuides component mounted/updated. isOpen:', isOpen, 'guestListId:', guestListId);
        if (isOpen) {
            fetchEligibleGuides();
        }
    }, [guestListId, isOpen]);

    const fetchEligibleGuides = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching eligible guides for guest list:', guestListId);
            const response = await axios.get(
                `/guest-lists/${guestListId}/eligible-guides`,
                {
                    params: serviceType ? { service_type: serviceType } : {},
                }
            );
            
            console.log('Eligible guides response:', response.data);
            
            // Handle both response.data.data and response.data formats
            let guidesData = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                guidesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                guidesData = response.data;
            }
            
            console.log('Processed guides data:', guidesData);
            setGuides(guidesData);
        } catch (err: any) {
            console.error('Error fetching eligible guides:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to load eligible guides';
            setError(errorMsg);
            setGuides([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredGuides = Array.isArray(guides) ? (
        filterHasWarnings
            ? guides.filter(
                  (g) =>
                      g.expiring_soon_certifications.length > 0 ||
                      g.assignment_summary.total_assignments > 0
              )
            : guides
    ) : [];

    const handleSelectGuide = (guide: Guide) => {
        setSelectedGuide(guide);
        onGuideSelected?.(guide);
    };

    const getComplianceColorClass = (status: string): string => {
        switch (status) {
            case 'Good':
                return 'bg-green-50 border-green-200';
            case 'Warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'Flagged':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getComplianceIconClass = (status: string): string => {
        switch (status) {
            case 'Good':
                return 'text-green-600';
            case 'Warning':
                return 'text-yellow-600';
            case 'Flagged':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Available Guides</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {filteredGuides.length} eligible guide{filteredGuides.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            onAutoAssign?.();
                            fetchEligibleGuides();
                        }}
                        disabled={isLoading || guides.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 text-sm"
                    >
                        <CheckCircle size={16} />
                        Auto-Assign Best Match
                    </button>
                </div>

                {/* Filter Toggle */}
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={filterHasWarnings}
                        onChange={(e) => setFilterHasWarnings(e.target.checked)}
                        className="rounded"
                    />
                    <span className="text-gray-600">Show only guides with warnings</span>
                </label>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* No Guides Available */}
            {!loading && filteredGuides.length === 0 && (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-yellow-800">
                            No eligible guides available for this assignment.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Confirm that at least one guide is <strong>Approved</strong>,
                            available on {visitDate}, and matches the service type.
                        </p>
                    </div>
                </div>
            )}

            {/* Guides List */}
            <div className="space-y-3">
                {filteredGuides.map((guide) => (
                    <div
                        key={guide.id}
                        onClick={() => handleSelectGuide(guide)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            selectedGuide?.id === guide.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        } ${getComplianceColorClass(guide.expiry_status)}`}
                    >
                        {/* Header with name and status */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{guide.full_name}</h4>
                                <p className="text-sm text-gray-600">{guide.email}</p>
                                <p className="text-sm text-gray-600">{guide.contact_number}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <CheckCircle
                                        size={16}
                                        className={getComplianceIconClass(guide.expiry_status)}
                                    />
                                    {guide.is_available ? (
                                        <span className="text-green-600">Available</span>
                                    ) : (
                                        <span className="text-red-600">Unavailable</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div>
                                <span className="text-gray-600">Experience:</span>
                                <p className="font-medium">{guide.years_of_experience} years</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Specialties:</span>
                                <p className="font-medium">
                                    {guide.specialty_areas.slice(0, 2).join(', ')}
                                </p>
                            </div>
                        </div>

                        {/* Certifications Status */}
                        {(guide.expired_certifications.length > 0 ||
                            guide.expiring_soon_certifications.length > 0) && (
                            <div className="mb-3 p-2 bg-white bg-opacity-50 rounded">
                                {guide.expired_certifications.length > 0 && (
                                    <div className="text-xs text-red-700 mb-1">
                                        <AlertTriangle size={12} className="inline mr-1" />
                                        ❌ {guide.expired_certifications.length} expired certification
                                        {guide.expired_certifications.length > 1 ? 's' : ''}
                                    </div>
                                )}
                                {guide.expiring_soon_certifications.length > 0 && (
                                    <div className="text-xs text-yellow-700">
                                        <Clock size={12} className="inline mr-1" />
                                        ⚠️ {guide.expiring_soon_certifications.length} cert expiring soon
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Assignment Summary */}
                        {guide.assignment_summary.total_assignments > 0 && (
                            <div className="p-2 bg-white bg-opacity-50 rounded text-xs">
                                <div className="text-gray-700">
                                    <Users size={12} className="inline mr-1" />
                                    Current assignments: {guide.assignment_summary.total_assignments}
                                    <br />
                                    Already assigned: {guide.assignment_summary.total_guests} guest
                                    {guide.assignment_summary.total_guests !== 1 ? 's' : ''}
                                </div>
                            </div>
                        )}

                        {/* Selection indicator */}
                        {selectedGuide?.id === guide.id && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <span className="text-xs font-semibold text-blue-600">
                                    ✓ Selected for assignment
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
