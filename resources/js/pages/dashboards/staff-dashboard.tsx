import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { LogIn, Users, Maximize2, CheckCircle, AlertTriangle, AlertCircle, QrCode as QrCodeIcon, TrendingUp, Check, X, Clock, MapPin, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Entrance Staff Dashboard', href: '/staff-dashboard' },
];

// Mock data
const stats = {
    totalVisitorsToday: 856,
    currentVisitorsInside: 234,
    maximumCapacity: 350,
    guidesAssigned: 12,
};

// Mock booking database for scan simulation
const mockBookings: Record<string, any> = {
    'BK-001-2026': {
        id: 'BK-001-2026',
        bookingCode: 'BK-001-2026',
        guestCount: 8,
        guide: 'Maria Garcia',
        visitDate: '2026-03-05',
        arrivalStatus: 'pending',
        guideCertificateValid: true,
        bookingApproved: true,
        alreadyUsed: false,
    },
    'BK-002-2026': {
        id: 'BK-002-2026',
        bookingCode: 'BK-002-2026',
        guestCount: 12,
        guide: 'Juan Santos',
        visitDate: '2026-03-05',
        arrivalStatus: 'pending',
        guideCertificateValid: true,
        bookingApproved: true,
        alreadyUsed: false,
    },
    'BK-INVALID-001': {
        id: 'BK-INVALID-001',
        bookingCode: 'BK-INVALID-001',
        guestCount: 6,
        guide: 'Ana Cruz',
        visitDate: '2026-03-04', // Past date
        arrivalStatus: 'pending',
        guideCertificateValid: false, // Expired cert
        bookingApproved: false,
        alreadyUsed: false,
    },
    'BK-USED-001': {
        id: 'BK-USED-001',
        bookingCode: 'BK-USED-001',
        guestCount: 5,
        guide: 'Carlos Mendoza',
        visitDate: '2026-03-05',
        arrivalStatus: 'pending',
        guideCertificateValid: true,
        bookingApproved: true,
        alreadyUsed: true, // Already logged
    },
};

const recentlyLoggedArrivals = [
    { id: 1, bookingCode: 'BK-001-2026', guestCount: 8, guide: 'Maria Garcia', loggedTime: '09:45 AM', staffId: 'STAFF-001', status: 'Logged' },
    { id: 2, bookingCode: 'BK-002-2026', guestCount: 12, guide: 'Juan Santos', loggedTime: '09:32 AM', staffId: 'STAFF-002', status: 'Logged' },
    { id: 3, bookingCode: 'BK-004-2026', guestCount: 15, guide: 'Sofia Rodriguez', loggedTime: '09:18 AM', staffId: 'STAFF-001', status: 'Logged' },
];

export default function StaffDashboard() {
    const [scanInput, setScanInput] = useState('');
    const [scannedBooking, setScannedBooking] = useState<any>(null);
    const [scanError, setScanError] = useState('');
    const [verificationIssues, setVerificationIssues] = useState<string[]>([]);
    const [loggedArrivals, setLoggedArrivals] = useState(recentlyLoggedArrivals);

    // Calculate capacity percentage
    const capacityPercent = Math.round((stats.currentVisitorsInside / stats.maximumCapacity) * 100);
    const remainingCapacity = stats.maximumCapacity - stats.currentVisitorsInside;
    
    // Determine capacity status color
    const getCapacityStatusColor = (percent: number) => {
        if (percent <= 60) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Safe' };
        if (percent <= 80) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Warning' };
        return { bg: 'bg-red-500', text: 'text-red-600', label: 'Full' };
    };
    
    const capacityStatus = getCapacityStatusColor(capacityPercent);

    // Handle QR code scan (simulated)
    const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const code = scanInput.trim();
            setScanError('');
            setVerificationIssues([]);

            const booking = mockBookings[code];
            
            if (!booking) {
                setScanError('❌ Booking not found. Please scan a valid QR code.');
                setScannedBooking(null);
                setScanInput('');
                return;
            }

            // Validate booking
            const issues: string[] = [];
            
            if (booking.visitDate !== '2026-03-05') {
                issues.push('Invalid visit date - booking is for a different date');
            }
            
            if (!booking.bookingApproved) {
                issues.push('Booking not approved - contact administrator');
            }
            
            if (booking.alreadyUsed) {
                issues.push('Booking already used - cannot log duplicate entry');
            }
            
            if (!booking.guideCertificateValid) {
                issues.push('Guide certificate expired - guide cannot lead tours');
            }

            setVerificationIssues(issues);
            setScannedBooking(booking);
            setScanInput('');
        }
    };

    // Confirm arrival logging
    const handleConfirmArrival = () => {
        if (scannedBooking && verificationIssues.length === 0) {
            const newLogEntry = {
                id: loggedArrivals.length + 1,
                bookingCode: scannedBooking.bookingCode,
                guestCount: scannedBooking.guestCount,
                guide: scannedBooking.guide,
                loggedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                staffId: 'STAFF-001',
                status: 'Logged',
            };
            setLoggedArrivals([newLogEntry, ...loggedArrivals]);
            setScannedBooking(null);
            setScanError('✅ Arrival successfully logged!');
            setTimeout(() => setScanError(''), 3000);
        }
    };

    // Clear scan
    const handleClearScan = () => {
        setScannedBooking(null);
        setScanError('');
        setVerificationIssues([]);
        setScanInput('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrance Staff Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Entrance Point Control</h1>
                    <p className="text-[#E3EED4]">Smart Arrival Logging System - Scan, Verify, and Log Tourist Arrivals in Real-Time</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1 font-medium">Total Visitors Today</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.totalVisitorsToday}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">Cumulative arrivals</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <LogIn className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1 font-medium">Current Visitors Inside</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.currentVisitorsInside}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">Active on-site</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1 font-medium">Maximum Capacity</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.maximumCapacity}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">Site limit</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1 font-medium">Guides Assigned</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{stats.guidesAssigned}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">Active today</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrival Logging System */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* QR Scanner and Verification - Main Panel */}
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-md overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <div className="flex items-center gap-3 mb-2">
                                <QrCodeIcon className="w-6 h-6 text-[#6B8071]" />
                                <h2 className="text-xl font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Arrival Logging System</h2>
                            </div>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Scan QR code to verify booking and log arrival</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* QR Scanner Input */}
                            <div>
                                <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">QR Code Scanner</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        onKeyDown={handleScan}
                                        placeholder="Scan booking QR code here... (Try: BK-001-2026, BK-002-2026, BK-INVALID-001, BK-USED-001)"
                                        className="w-full px-4 py-3 border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white placeholder:text-[#6B8071] dark:placeholder:text-[#AEC3B0] focus:border-[#6B8071] focus:outline-none"
                                        autoFocus
                                    />
                                    <QrCodeIcon className="absolute right-4 top-3.5 w-5 h-5 text-[#6B8071]" />
                                </div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">Press ENTER to scan</p>
                            </div>

                            {/* Alert Messages */}
                            {scanError && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                                    scanError.includes('✅') 
                                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                        : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                }`}>
                                    {scanError.includes('✅') ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <p className={scanError.includes('✅') ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                                        {scanError}
                                    </p>
                                </div>
                            )}

                            {/* Booking Details - After Scan */}
                            {scannedBooking && (
                                <div className="space-y-4">
                                    {/* Booking Info */}
                                    <div className="p-4 rounded-lg bg-[#E3EED4]/50 dark:bg-[#375534]/30 border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0]">Booking Code</p>
                                                <p className="text-lg font-semibold text-[#0F2A1D] dark:text-white">{scannedBooking.bookingCode}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0]">Visit Date</p>
                                                <p className="text-lg font-semibold text-[#0F2A1D] dark:text-white">{scannedBooking.visitDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guest & Guide Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                            <div className="flex items-start gap-3">
                                                <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0]">Guest Count</p>
                                                    <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{scannedBooking.guestCount}</p>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">tourists</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                            <div className="flex items-start gap-3">
                                                <UserCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0]">Assigned Guide</p>
                                                    <p className="text-sm font-bold text-[#0F2A1D] dark:text-white">{scannedBooking.guide}</p>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">1 guide per group</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Checklist */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Booking Verification</p>
                                        <div className="space-y-2">
                                            <div className={`flex items-center gap-3 p-3 rounded-lg ${
                                                scannedBooking.visitDate === '2026-03-05'
                                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                                    : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                            }`}>
                                                {scannedBooking.visitDate === '2026-03-05' ? (
                                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className={scannedBooking.visitDate === '2026-03-05' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                                                    Valid visit date
                                                </span>
                                            </div>

                                            <div className={`flex items-center gap-3 p-3 rounded-lg ${
                                                scannedBooking.bookingApproved
                                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                                    : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                            }`}>
                                                {scannedBooking.bookingApproved ? (
                                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className={scannedBooking.bookingApproved ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                                                    Booking approved
                                                </span>
                                            </div>

                                            <div className={`flex items-center gap-3 p-3 rounded-lg ${
                                                !scannedBooking.alreadyUsed
                                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                                    : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                            }`}>
                                                {!scannedBooking.alreadyUsed ? (
                                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className={!scannedBooking.alreadyUsed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                                                    Not already used
                                                </span>
                                            </div>

                                            <div className={`flex items-center gap-3 p-3 rounded-lg ${
                                                scannedBooking.guideCertificateValid
                                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                                    : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                            }`}>
                                                {scannedBooking.guideCertificateValid ? (
                                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className={scannedBooking.guideCertificateValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                                                    Guide certificate valid
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Alerts */}
                                    {verificationIssues.length > 0 && (
                                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
                                            <div className="flex items-start gap-3 mb-2">
                                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="font-semibold text-red-800 dark:text-red-300">Verification Issues</p>
                                            </div>
                                            <ul className="space-y-1 ml-8">
                                                {verificationIssues.map((issue, idx) => (
                                                    <li key={idx} className="text-sm text-red-700 dark:text-red-300 list-disc">
                                                        {issue}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        {verificationIssues.length === 0 && (
                                            <button
                                                onClick={handleConfirmArrival}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Confirm & Log Arrival
                                            </button>
                                        )}
                                        <button
                                            onClick={handleClearScan}
                                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                                        >
                                            Clear & Rescan
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!scannedBooking && !scanError && (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                    <QrCodeIcon className="w-12 h-12 mb-3 opacity-50" />
                                    <p className="font-medium">Ready to scan</p>
                                    <p className="text-xs mt-1">Point camera at QR code or type booking code</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Real-Time Visitor Counter */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-md overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-[#6B8071]" />
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Capacity Status</h2>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {/* Current Count */}
                            <div>
                                <div className="flex items-end justify-between mb-3">
                                    <p className="text-sm font-medium text-[#6B8071] dark:text-[#AEC3B0]">Inside Now</p>
                                    <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{stats.currentVisitorsInside}</p>
                                </div>
                                <div className="w-full h-2 bg-[#E3EED4] dark:bg-[#375534]/30 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${capacityStatus.bg} transition-all duration-300`}
                                        style={{ width: `${capacityPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Remaining Capacity */}
                            <div className="p-4 rounded-lg bg-[#E3EED4]/50 dark:bg-[#375534]/30 border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0] mb-2">Remaining Capacity</p>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{remainingCapacity}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">of {stats.maximumCapacity} total</p>
                            </div>

                            {/* Capacity Percentage */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                <div>
                                    <p className="text-xs font-medium text-[#6B8071] dark:text-[#AEC3B0]">Usage</p>
                                    <p className="text-xl font-bold text-[#0F2A1D] dark:text-white">{capacityPercent}%</p>
                                </div>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${capacityStatus.bg} shadow-lg`}>
                                    {capacityPercent}%
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-center">
                                <Badge 
                                    className={`text-sm py-2 px-4 font-semibold ${
                                        capacityPercent <= 60
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : capacityPercent <= 80
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {capacityStatus.label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recently Logged Arrivals */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-md overflow-hidden">
                    <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-[#6B8071]" />
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Recently Logged Arrivals</h2>
                        </div>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Real-time log of processed arrivals with verification details</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#375534]/40 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Booking Code</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guests</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guide</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Logged Time</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Staff ID</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loggedArrivals.map((arrival) => (
                                    <tr key={arrival.id} className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/30 dark:hover:bg-[#375534]/20 transition-colors">
                                        <td className="py-4 px-6 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{arrival.bookingCode}</td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.guestCount}</td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.guide}</td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.loggedTime}</td>
                                        <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.staffId}</td>
                                        <td className="py-4 px-6">
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                ✓ {arrival.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
