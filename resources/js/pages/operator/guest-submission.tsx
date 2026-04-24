import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Users, Plus, Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Service {
    id: number;
    name: string;
    type: string;
    date: string;
    tourist_spot_id: number;
}

interface GuestSubmission {
    id: number;
    serviceId: number;
    serviceName: string;
    date: string;
    guestCount: number;
    status: string;
    qrCodeCount: number;
}

interface Props {
    services: Service[];
    guestSubmissions: GuestSubmission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Guest Submission', href: '/operator/guest-submission' },
];

export default function GuestSubmission({ services, guestSubmissions }: Props) {
    const { errors } = usePage().props;
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [visitDate, setVisitDate] = useState('');
    const [totalGuests, setTotalGuests] = useState('');
    const [localTourists, setLocalTourists] = useState('');
    const [foreignTourists, setForeignTourists] = useState('');
    const [guestNames, setGuestNames] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const todayDate = new Date().toISOString().split('T')[0];

    // Computed properties
    const total = parseInt(totalGuests) || 0;
    const local = parseInt(localTourists) || 0;
    const foreign = parseInt(foreignTourists) || 0;
    const isBalanced = total > 0 && local + foreign === total;
    const hasError = total > 0 && local + foreign !== total;

    // QR Code Name Generator
    // Example: TR-BDN-2026-0001
    // TR: Prefix (e.g., Tourist)
    // BDN: Location code (example static)
    // 2026: Year
    // 0001: Serial number (padded)
    const generateQRCodeName = (prefix: string, locationCode: string, year: number, serial: number) => {
        return `${prefix}-${locationCode}-${year}-${serial.toString().padStart(4, '0')}`;
    };

    // Example usage: Generate QR code names for each guest
    const qrPrefix = "TR"; // static or from config
    const qrLocation = "BDN"; // static or from service/location
    const qrYear = new Date().getFullYear();
    const qrCodeNames = guestNames.map((_, idx) => generateQRCodeName(qrPrefix, qrLocation, qrYear, idx + 1));

    // Update guest names array when total guests changes
    const handleTotalGuestsChange = (value: string) => {
        setTotalGuests(value);
        const newTotal = parseInt(value) || 0;
        if (newTotal > guestNames.length) {
            // Add empty strings for new guests
            setGuestNames([...guestNames, ...Array(newTotal - guestNames.length).fill('')]);
        } else if (newTotal < guestNames.length) {
            // Remove excess guest names
            setGuestNames(guestNames.slice(0, newTotal));
        }
    };

    const handleGuestNameChange = (index: number, value: string) => {
        const newNames = [...guestNames];
        newNames[index] = value;
        setGuestNames(newNames);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isBalanced) {
            alert('Local tourists + Foreign tourists must equal Total guests');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get the selected service to extract attraction_id
            const selected = services.find(s => s.id === selectedService);
            
            router.post('/operator/guest-submission', {
                service_id: selectedService,
                attraction_id: selected?.tourist_spot_id,
                visit_date: visitDate,
                total_guests: totalGuests,
                local_tourists: localTourists,
                foreign_tourists: foreignTourists,
                guest_names: guestNames.filter(name => name.trim() !== ''),
                notes: notes,
            }, {
                onSuccess: () => {
                    // Show success modal
                    setShowSuccessModal(true);
                    // Reset form fields on successful submission
                    setSelectedService(null);
                    setVisitDate('');
                    setTotalGuests('');
                    setLocalTourists('');
                    setForeignTourists('');
                    setGuestNames([]);
                    setNotes('');
                    setIsSubmitting(false);
                    
                    // Reload page after 2 seconds
                    setTimeout(() => {
                        router.get('/operator/guest-submission');
                    }, 2000);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Error submitting guests:', error);
            alert('Error submitting guests. Please try again.');
            setIsSubmitting(false);
        }
    };

    const isFormValid = selectedService && visitDate && isBalanced;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guest Submission" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-[#375534] text-white p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Guest Submission</h1>
                    </div>
                    <p className="text-[#E3EED4] text-sm mt-1">
                        Submit guest information for your approved services
                    </p>
                </div>

                {/* Errors Display */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-6 text-red-700 dark:text-red-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-2">Form Errors</h3>
                                <ul className="space-y-1 text-sm">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>• {String(message)}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Submission Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                                New Guest Submission
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Service Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Select Service *
                                    </label>
                                    <select
                                        value={selectedService || ''}
                                        onChange={(e) => setSelectedService(Number(e.target.value))}
                                        className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                        required
                                    >
                                        <option value="">Choose a service...</option>
                                        {services.length > 0 ? (
                                            services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} ({service.type})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>
                                                No approved services available
                                            </option>
                                        )}
                                    </select>
                                </div>

                                {/* Visit Date */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Visit Date * (Today or future dates)
                                    </label>
                                    <input
                                        type="date"
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        min={todayDate}
                                        className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                        required
                                    />
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                        Must be today or a future date
                                    </p>
                                </div>

                                {/* Guest Count Section */}
                                <div className="space-y-4 p-4 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <h3 className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Guest Information
                                    </h3>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {/* Total Guests */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">
                                                Total Guests *
                                            </label>
                                            <input
                                                type="number"
                                                value={totalGuests}
                                                onChange={(e) => handleTotalGuestsChange(e.target.value)}
                                                placeholder="0"
                                                min="1"
                                                className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                                required
                                            />
                                        </div>

                                        {/* Local Tourists */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">
                                                Local Tourists *
                                            </label>
                                            <input
                                                type="number"
                                                value={localTourists}
                                                onChange={(e) => setLocalTourists(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                                required
                                            />
                                        </div>

                                        {/* Foreign Tourists */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">
                                                Foreign Tourists *
                                            </label>
                                            <input
                                                type="number"
                                                value={foreignTourists}
                                                onChange={(e) => setForeignTourists(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Validation Message */}
                                    {total > 0 && (
                                        <div className={`text-sm p-3 rounded-lg ${hasError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-200'}`}>
                                            {local} + {foreign} = {local + foreign} {total > 0 ? `(Total: ${total})` : ''}
                                            {hasError && ' ❌ Does not match total'}
                                            {isBalanced && ' ✓ Balanced'}
                                        </div>
                                    )}
                                </div>

                                {/* Guest Names Section */}
                                {total > 0 && (
                                    <div className="space-y-3 p-4 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                        <h3 className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                            Guest Names (Optional)
                                        </h3>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                            Enter individual guest names. This helps with entry tracking and record-keeping.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                            {guestNames.map((name, index) => (
                                                <div key={index}>
                                                    <label className="block text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-1">
                                                        Guest {index + 1} <span className="ml-2 text-green-700 dark:text-green-300">QR: {qrCodeNames[index]}</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => handleGuestNameChange(index, e.target.value)}
                                                        placeholder={`Name (optional)`}
                                                        maxLength={255}
                                                        className="w-full px-3 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any special requirements or additional information..."
                                        rows={4}
                                        className="w-full px-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isSubmitting}
                                    className="w-full px-6 py-3 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isSubmitting ? 'Submitting...' : `Submit Guest List ${total > 0 ? `(${total} QR codes)` : ''}`}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                            Recent Submissions
                        </h2>

                        {guestSubmissions.length > 0 ? (
                            <div className="space-y-3">
                                {guestSubmissions.map((submission) => (
                                    <Link
                                        key={submission.id}
                                        href={`/operator/guest-submission/${submission.id}`}
                                        className="block p-4 rounded-lg border border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-[#0F2A1D] dark:text-[#E3EED4] text-sm">
                                                {submission.serviceName}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                {submission.status === 'Pending Entrance' ? (
                                                    <>
                                                        <Clock className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                                            Pending
                                                        </span>
                                                    </>
                                                ) : submission.status === 'Completed' ? (
                                                    <>
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span className="text-xs text-green-600 dark:text-green-400">
                                                            Completed
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                        <span className="text-xs text-red-600 dark:text-red-400">
                                                            Cancelled
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                            Date: {submission.date}
                                        </p>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                            Guests: {submission.guestCount}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            QR Codes Assigned: {submission.qrCodeCount}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] text-center py-8">
                                No submissions yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                                    <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Success!
                            </h3>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-6">
                                Guest list submitted successfully. The page will refresh automatically in a moment.
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-400"></div>
                                <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Refreshing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
