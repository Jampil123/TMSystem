import { useState, useEffect } from 'react';
import { X, Users, User, MapPin, AlertCircle, CheckCircle, QrCode } from 'lucide-react';

interface Attraction {
    id: number;
    name: string;
    location?: string;
    category?: string;
    image_url?: string;
}

interface Guide {
    id: number;
    name: string;
    full_name: string;
    specialty_areas?: string[];
    years_of_experience?: number;
}

interface WalkInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: any) => void;
    services?: Attraction[];
    guides?: Guide[];
}

export default function WalkInModal({ isOpen, onClose, onSuccess, services = [], guides = [] }: WalkInModalProps) {
    const [guestName, setGuestName] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [attractionId, setAttractionId] = useState<number | ''>('');
    const [guideId, setGuideId] = useState<number | ''>('');
    const [localTourists, setLocalTourists] = useState<number>(1);
    const [foreignTourists, setForeignTourists] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [successData, setSuccessData] = useState<any>(null);

    // Sync local and foreign tourists with guest count
    useEffect(() => {
        if (localTourists + foreignTourists !== guestCount) {
            setForeignTourists(Math.max(0, guestCount - localTourists));
        }
    }, [guestCount]);

    const validateForm = (): boolean => {
        if (!guestName.trim()) {
            setError('Guest name is required');
            return false;
        }
        if (guestCount < 1) {
            setError('Guest count must be at least 1');
            return false;
        }
        if (!attractionId) {
            setError('Please select an attraction');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessData(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/staff/api/log-walk-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    guest_name: guestName.trim(),
                    guest_count: guestCount,
                    service_id: attractionId,
                    guide_id: guideId || null,
                    local_tourists: localTourists,
                    foreign_tourists: foreignTourists,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data.data);
                // Reset form after success
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(data.data);
                    }
                    resetForm();
                    onClose();
                }, 3000);
            } else {
                setError(data.message || 'Failed to log walk-in arrival');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while logging the walk-in');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setGuestName('');
        setGuestCount(1);
        setAttractionId('');
        setGuideId('');
        setLocalTourists(1);
        setForeignTourists(0);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-[#375534] to-[#0F2A1D] px-6 py-4 text-white flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6" />
                        <h2 className="text-xl font-bold">Record Walk-in Tourist</h2>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Success State */}
                {successData && (
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg animate-pulse"></div>
                                <div className="relative bg-green-100 dark:bg-green-900/30 rounded-full p-6">
                                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                ✅ Walk-in Recorded Successfully!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Guest arrival has been logged in the system
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Guest Name</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{successData.guest_name}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Guest Count</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{successData.total_guests} guests</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Arrival Time</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{successData.arrival_time}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Attraction</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{successData.service_name}</p>
                            </div>
                        </div>

                        {successData.qr_token && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <p className="font-semibold text-blue-900 dark:text-blue-300">QR Code Generated</p>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-400 font-mono">{successData.qr_token}</p>
                            </div>
                        )}

                        {successData.fee_paid > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Total Fee Collected: <span className="font-bold">${successData.fee_paid.toFixed(2)}</span>
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Form State */}
                {!successData && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Guest Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Guest Name *
                                </div>
                            </label>
                            <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Enter guest group leader name"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Guest Count */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Total Guests *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Local Tourists
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={localTourists}
                                    onChange={(e) => setLocalTourists(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Foreign Tourists
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={foreignTourists}
                                    onChange={(e) => setForeignTourists(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Attraction Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Attraction / Destination *
                                </div>
                            </label>
                            <select
                                value={attractionId}
                                onChange={(e) => setAttractionId(e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                disabled={isLoading}
                            >
                                <option value="">Select an attraction...</option>
                                {services && services.length > 0 ? (
                                    services.map((attraction: any) => (
                                        <option key={attraction.id} value={attraction.id}>
                                            {attraction.name} {attraction.location && `(${attraction.location})`}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No attractions available</option>
                                )}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Select the attraction for this walk-in group
                            </p>
                        </div>

                        {/* Guide Selection (Optional) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Assigned Guide (Optional)
                            </label>
                            <select
                                value={guideId}
                                onChange={(e) => setGuideId(e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                disabled={isLoading}
                            >
                                <option value="">No guide assigned</option>
                                {guides && guides.length > 0 ? (
                                    guides.map((guide: any) => (
                                        <option key={guide.id} value={guide.id}>
                                            {guide.full_name || guide.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No guides available</option>
                                )}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Optionally assign a guide to this group
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-[#375534] hover:bg-[#2a4029] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Recording...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Record Walk-in
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
