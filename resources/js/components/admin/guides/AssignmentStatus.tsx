import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, Trash2, Check, X, Eye } from 'lucide-react';
import axios from 'axios';

interface Assignment {
    id: number;
    guide: {
        id: number;
        full_name: string;
        email: string;
        specialty_areas: string[];
    };
    assignment_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
    compliance_status: 'Good' | 'Warning' | 'Flagged';
    has_certification_warning: boolean;
    has_availability_conflict: boolean;
}

interface AssignmentStatusProps {
    assignment: Assignment | null;
    isLoading?: boolean;
    onRefresh?: () => void;
}

export default function AssignmentStatus({ assignment, isLoading = false, onRefresh }: AssignmentStatusProps) {
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    if (!assignment) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                No assignment yet. Please assign a guide above.
            </div>
        );
    }

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-50 border-green-200 text-green-700';
            case 'Pending':
                return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'Completed':
                return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'Cancelled':
                return 'bg-red-50 border-red-200 text-red-700';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const getComplianceColor = (status: string): string => {
        switch (status) {
            case 'Good':
                return 'text-green-600 bg-green-50';
            case 'Warning':
                return 'text-yellow-600 bg-yellow-50';
            case 'Flagged':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const handleConfirm = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await axios.post(`/guide-assignments/${assignment.id}/confirm`);
            onRefresh?.();
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to confirm assignment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await axios.post(`/guide-assignments/${assignment.id}/complete`);
            onRefresh?.();
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to complete assignment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this assignment?')) return;

        setActionLoading(true);
        setActionError(null);
        try {
            await axios.post(`/guide-assignments/${assignment.id}/cancel`, {
                reason: 'Cancelled by operator',
            });
            onRefresh?.();
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to cancel assignment');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Error */}
            {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {actionError}
                </div>
            )}

            {/* Main Assignment Card */}
            <div className={`p-4 border-2 rounded-lg ${getStatusColor(assignment.status)}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{assignment.guide.full_name}</h3>
                        <p className="text-sm opacity-75">{assignment.guide.email}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-white bg-opacity-50 rounded-full text-sm font-semibold">
                            {assignment.status}
                        </span>
                    </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                        <span className="text-gray-600 opacity-75">Date</span>
                        <p className="font-medium">
                            {new Date(assignment.assignment_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600 opacity-75">Time</span>
                        <p className="font-medium">
                            {assignment.start_time} - {assignment.end_time}
                        </p>
                    </div>
                </div>

                {/* Guest Count and Specialties */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                        <span className="text-gray-600 opacity-75">Guests</span>
                        <p className="font-medium">{assignment.guest_count}</p>
                    </div>
                    <div>
                        <span className="text-gray-600 opacity-75">Specialties</span>
                        <p className="font-medium text-xs">
                            {assignment.guide.specialty_areas.slice(0, 2).join(', ')}
                        </p>
                    </div>
                </div>

                {/* Compliance Status */}
                <div className={`p-2 rounded text-sm font-medium mb-3 ${getComplianceColor(assignment.compliance_status)}`}>
                    {assignment.compliance_status === 'Good' && (
                        <>
                            <CheckCircle className="inline mr-1" size={14} />
                            All systems normal
                        </>
                    )}
                    {assignment.compliance_status === 'Warning' && (
                        <>
                            <AlertTriangle className="inline mr-1" size={14} />
                            Check warnings below
                        </>
                    )}
                    {assignment.compliance_status === 'Flagged' && (
                        <>
                            <X className="inline mr-1" size={14} />
                            Compliance issue detected
                        </>
                    )}
                </div>

                {/* Warnings */}
                {(assignment.has_certification_warning || assignment.has_availability_conflict) && (
                    <div className="p-2 bg-white bg-opacity-50 rounded text-xs text-yellow-700 space-y-1 mb-3">
                        {assignment.has_certification_warning && (
                            <p>
                                <AlertTriangle size={12} className="inline mr-1" />
                                ⚠️ Guide certification expiring soon
                            </p>
                        )}
                        {assignment.has_availability_conflict && (
                            <p>
                                <Clock size={12} className="inline mr-1" />
                                ⚠️ Potential schedule conflict
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                    <Eye size={14} />
                    Details
                </button>

                {assignment.status === 'Pending' && (
                    <>
                        <button
                            onClick={handleConfirm}
                            disabled={actionLoading}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                        >
                            <Check size={14} />
                            Confirm
                        </button>
                    </>
                )}

                {(assignment.status === 'Pending' || assignment.status === 'Confirmed') && (
                    <>
                        {assignment.status === 'Confirmed' && (
                            <button
                                onClick={handleComplete}
                                disabled={actionLoading}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                                <CheckCircle size={14} />
                                Complete
                            </button>
                        )}
                        <button
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:bg-gray-100 flex items-center justify-center gap-1"
                        >
                            <Trash2 size={14} />
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {/* Detailed View */}
            {showDetails && (
                <div className="p-4 bg-gray-50 border rounded-lg space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Assignment ID</p>
                            <p className="font-mono font-medium">{assignment.id}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Status</p>
                            <p className="font-medium">{assignment.status}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Compliance Status</p>
                            <p className="font-medium">{assignment.compliance_status}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Certification Warning</p>
                            <p className="font-medium">
                                {assignment.has_certification_warning ? '⚠️ Yes' : '✓ No'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
