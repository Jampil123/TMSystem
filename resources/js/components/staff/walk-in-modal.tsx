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
    const [guestNames, setGuestNames] = useState<string[]>(['']);
    const [guestCount, setGuestCount] = useState(1);
    const [attractionId, setAttractionId] = useState<number | ''>('');
    const [guideId, setGuideId] = useState<number | ''>('');
    const [localTourists, setLocalTourists] = useState<number>(1);
    const [foreignTourists, setForeignTourists] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [successData, setSuccessData] = useState<any>(null);
    const [codesCopied, setCodesCopied] = useState(false);

    // Sync local and foreign tourists with guest count
    useEffect(() => {
        if (localTourists + foreignTourists !== guestCount) {
            setForeignTourists(Math.max(0, guestCount - localTourists));
        }
    }, [guestCount]);

    useEffect(() => {
        setGuestNames((prev) => {
            if (guestCount <= prev.length) return prev.slice(0, guestCount);
            return [...prev, ...Array.from({ length: guestCount - prev.length }, () => '')];
        });
    }, [guestCount]);

    const setGuestNameAtIndex = (index: number, value: string) => {
        setGuestNames((prev) => prev.map((name, i) => (i === index ? value : name)));
    };

    const normalizedGuestNames = () => guestNames.map((name) => name.trim()).filter(Boolean);

    const validateForm = (): boolean => {
        const names = normalizedGuestNames();
        if (names.length !== guestCount) {
            setError(`Please provide all ${guestCount} guest name${guestCount > 1 ? 's' : ''}`);
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
                    guest_name: normalizedGuestNames()[0] ?? '',
                    guest_names: normalizedGuestNames(),
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
                if (onSuccess) {
                    onSuccess(data.data);
                }
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
        setGuestNames(['']);
        setGuestCount(1);
        setAttractionId('');
        setGuideId('');
        setLocalTourists(1);
        setForeignTourists(0);
        setError('');
        setCodesCopied(false);
        setSuccessData(null);
    };

    if (!isOpen) return null;
    const successQrTokens: string[] =
        successData && Array.isArray(successData.qr_tokens)
            ? successData.qr_tokens
            : successData?.qr_token
              ? [successData.qr_token]
              : [];

    const handlePrintCodes = () => {
        if (!successData) return;

        const qrTokens: string[] = Array.isArray(successData.qr_tokens)
            ? successData.qr_tokens
            : successData.qr_token
              ? [successData.qr_token]
              : [];

        if (qrTokens.length === 0) return;

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) return;

        const serviceName = String(successData.service_name ?? 'Walk-in Service');
        const visitDate = String(successData.arrival_date ?? new Date().toISOString().slice(0, 10));
        const guestNamesList: string[] = Array.isArray(successData.guest_names) ? successData.guest_names : [];
        const wristbandsHtml = qrTokens
            .map((token: string, idx: number) => {
                const guestName = guestNamesList[idx] || `Guest ${idx + 1}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(token)}`;

                return `
                    <div class="band-wrap">
                        <div class="band-row">
                            <div class="perf left"><div class="cut"></div></div>
                            <div class="band-main">
                                <div class="band-left">
                                    <div class="title">${serviceName.toUpperCase()}</div>
                                    <div class="sub">Wristband • ${visitDate}</div>
                                </div>
                                <div class="band-right">
                                    <div class="guest-block">
                                        <div class="guest-name">${guestName}</div>
                                        <div class="guest-sub">Wristband Pass</div>
                                    </div>
                                    <div class="qr-box">
                                        <img src="${qrUrl}" alt="QR ${idx + 1}" />
                                    </div>
                                </div>
                            </div>
                            <div class="perf right"><div class="cut"></div></div>
                        </div>
                    </div>
                `;
            })
            .join('');

        printWindow.document.write(`
            <html>
              <head>
                <title>Print Wristbands</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; background: #fff; }
                  h1 { margin: 0 0 8px; color: #05361f; }
                  p { margin: 4px 0; }
                  .wrap { max-width: 1000px; margin: 0 auto; }
                  .bands { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
                  .band-wrap { width: 100%; page-break-inside: avoid; max-width: 1000px; }
                  .band-row { width: 100%; height: 72px; display: flex; align-items: center; border-radius: 6px; overflow: hidden; }
                  .perf { width: 40px; background: #fff; display: flex; align-items: center; justify-content: center; }
                  .perf.left .cut { width: 28px; height: 28px; background: #fff; border-right: 1px dashed rgba(0,0,0,0.12); }
                  .perf.right .cut { width: 28px; height: 28px; background: #fff; border-left: 1px dashed rgba(0,0,0,0.12); }
                  .band-main {
                    flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px;
                    background: linear-gradient(90deg, #ffffff 0%, #e6fff2 30%, #a7f3d0 100%);
                  }
                  .title { font-size: 20px; font-weight: 800; color: #05361f; letter-spacing: 1px; }
                  .sub { font-size: 11px; color: #05361f; margin-top: 2px; }
                  .band-right { display: flex; align-items: center; gap: 12px; }
                  .guest-block { text-align: right; color: #05361f; margin-right: 8px; }
                  .guest-name { font-size: 13px; font-weight: 700; }
                  .guest-sub { font-size: 10px; }
                  .qr-box { width: 64px; height: 64px; background: #fff; padding: 6px; }
                  .qr-box img { width: 100%; height: 100%; object-fit: contain; }
                  .no-print { margin-bottom: 12px; }
                  @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; }
                    @page { size: A4 landscape; margin: 6mm; }
                  }
                </style>
              </head>
              <body>
                <div class="wrap">
                  <div class="no-print">
                    <h1>Print Wristbands</h1>
                    <p><strong>Attraction:</strong> ${serviceName}</p>
                    <p><strong>Date:</strong> ${visitDate}</p>
                    <p><strong>Total Guests:</strong> ${successData.total_guests ?? qrTokens.length}</p>
                  </div>
                  <div class="bands">
                    ${wristbandsHtml}
                  </div>
                </div>
              </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleCopyCodes = async () => {
        if (successQrTokens.length === 0) return;
        try {
            await navigator.clipboard.writeText(successQrTokens.join('\n'));
            setCodesCopied(true);
            setTimeout(() => setCodesCopied(false), 1500);
        } catch {
            setCodesCopied(false);
        }
    };

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
                    <div className="p-6 md:p-7 space-y-5 bg-slate-50/60 dark:bg-slate-900/30">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Walk-in Recorded Successfully
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Arrival details and access codes are ready for processing.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Guest Name</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{successData.guest_name}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Guest Count</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{successData.total_guests} guests</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Arrival Time</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{successData.arrival_time}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Attraction</p>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{successData.service_name}</p>
                            </div>
                        </div>

                        {successQrTokens.length > 0 && (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="h-4 w-4 text-emerald-600" />
                                        <p className="font-semibold text-slate-900 dark:text-white">QR Codes Generated</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopyCodes}
                                        className="text-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    >
                                        {codesCopied ? 'Copied' : 'Copy Codes'}
                                    </button>
                                </div>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {successQrTokens.map((token: string, idx: number) => (
                                        <p key={`${token}-${idx}`} className="text-sm text-slate-700 dark:text-slate-200 font-mono">
                                            {idx + 1}. {token}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {successData.fee_paid > 0 && (
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20 p-4">
                                <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Total Fee Collected</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                                    PHP {Number(successData.fee_paid).toFixed(2)}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handlePrintCodes}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-sm hover:shadow-md"
                            >
                                Print Codes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
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

                        {/* Guest Names */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Guest Names *
                                </div>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                                {Array.from({ length: guestCount }).map((_, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={guestNames[index] ?? ''}
                                        onChange={(e) => setGuestNameAtIndex(index, e.target.value)}
                                        placeholder={`Guest ${index + 1} name`}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
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
