import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, Send } from 'lucide-react';
import axios from 'axios';

interface Guide {
    id: number;
    full_name: string;
    email: string;
    contact_number: string;
    years_of_experience: number;
    specialty_areas: string[];
    expiring_soon_certifications?: any[];
}

interface AssignmentConfirmModalProps {
    guestListId: number;
    guide: Guide | null;
    visitDate: string;
    totalGuests: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: any) => void;
}

export default function AssignmentConfirmModal({
    guestListId,
    guide,
    visitDate,
    totalGuests,
    isOpen,
    onClose,
    onSuccess,
}: AssignmentConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('17:00');
    const [notes, setNotes] = useState('');
    const [agreedToWarnings, setAgreedToWarnings] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !guide) return null;

    const hasExpiringCerts = (guide.expiring_soon_certifications || []).length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!startTime || !endTime) {
            setError('Please select both start and end times');
            setLoading(false);
            return;
        }

        if (hasExpiringCerts && !agreedToWarnings) {
            setError('You must acknowledge the certification warning to proceed');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `/guest-lists/${guestListId}/assign-guide`,
                {
                    guide_id: guide.id,
                    start_time: startTime,
                    end_time: endTime,
                    service_type: 'Tour',
                    notes: notes,
                }
            );

            onSuccess?.(response.data.data);
            // Reset form
            setStartTime('08:00');
            setEndTime('17:00');
            setNotes('');
            setAgreedToWarnings(false);
            onClose();
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to assign guide. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 overflow-hidden">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Confirm Assignment</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Guide Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h3 className="font-semibold text-gray-900 mb-2">{guide.full_name}</h3>
                        <div className="text-sm space-y-1 text-gray-600">
                            <p>📧 {guide.email}</p>
                            <p>📞 {guide.contact_number}</p>
                            <p>⭐ {guide.years_of_experience} years experience</p>
                        </div>
                    </div>

                    {/* Assignment Details */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assignment Date
                            </label>
                            <input
                                type="text"
                                value={visitDate}
                                disabled
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Guest Count
                            </label>
                            <input
                                type="text"
                                value={totalGuests}
                                disabled
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any special instructions or notes..."
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Warnings Section */}
                    {hasExpiringCerts && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-900 mb-2">
                                        ⚠️ Certification Expiring Soon
                                    </p>
                                    <ul className="text-xs text-yellow-800 space-y-1 mb-3">
                                        {(guide.expiring_soon_certifications || []).map((cert, idx) => (
                                            <li key={idx}>
                                                • {cert.name} expires in {cert.days_until_expiry} days
                                            </li>
                                        ))}
                                    </ul>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={agreedToWarnings}
                                            onChange={(e) => setAgreedToWarnings(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-xs text-yellow-900">
                                            I acknowledge this warning and want to proceed with the assignment
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (hasExpiringCerts && !agreedToWarnings)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Assign Guide
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
