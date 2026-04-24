import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { LogIn, Users, Maximize2, CheckCircle, AlertTriangle, AlertCircle, QrCode as QrCodeIcon, TrendingUp, Check, X, Clock, MapPin, UserCheck, Plus, Building2, Camera, StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import WalkInModal from '@/components/staff/walk-in-modal';
import type { BreadcrumbItem } from '@/types';

interface CapacityRule {
    max_visitors: number;
    warning_threshold_percent: number;
    critical_threshold_percent: number;
    max_guests_per_guide: number;
    max_daily_visitors: number;
}

interface Attraction {
    id: number;
    name: string;
    location: string | null;
    category: string | null;
}

interface Props {
    attraction: Attraction;
    capacityRule: CapacityRule;
}

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



export default function StaffDashboard({ attraction, capacityRule }: Props) {
    const [entryMode, setEntryMode] = useState<'qr' | 'walk-in'>('qr');
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [guides, setGuides] = useState<any[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const [scanInput, setScanInput] = useState('');
    const [scannedBooking, setScannedBooking] = useState<any>(null);
    const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
    const [scanError, setScanError] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [scannedQRCodes, setScannedQRCodes] = useState<Set<string>>(new Set());
    const [processingCode, setProcessingCode] = useState<string | null>(null);
    const [loggedArrivals, setLoggedArrivals] = useState<any[]>([]);
    
    // Real-time capacity monitoring state
    const [currentVisitors, setCurrentVisitors] = useState(0);
    const [maximumCapacity, setMaximumCapacity] = useState(capacityRule.max_visitors);
    const [capacityPercentage, setCapacityPercentage] = useState(0);
    const [capacityStatus, setCapacityStatus] = useState('SAFE');
    const [remainingCapacity, setRemainingCapacity] = useState(capacityRule.max_visitors);
    const [isAtCapacity, setIsAtCapacity] = useState(false);
    const [previousCapacityStatus, setPreviousCapacityStatus] = useState<string | null>(null);
    
    // Real-time statistics state
    const [totalVisitorsToday, setTotalVisitorsToday] = useState(0);
    const [verifiedArrivals, setVerifiedArrivals] = useState(0);
    const [deniedArrivals, setDeniedArrivals] = useState(0);
    const [todayStats, setTodayStats] = useState({
        total_arrivals: 0,
        verified_arrivals: 0,
        denied_arrivals: 0,
        total_guests: 0,
    });
    
    // Recent arrivals data
    const [recentArrivalsData, setRecentArrivalsData] = useState<any[]>([]);
    const [arrivalsLoading, setArrivalsLoading] = useState(false);

    // Fetch real visitor count from API
    const fetchCapacityStatus = async () => {
        try {
            const response = await fetch('/staff/api/visitor-count');
            const data = await response.json();
            
            if (data.success) {
                const visitorData = data.data;
                const currentCount = visitorData.current_visitors;

                // Always use the capacity from the attraction's capacity rule (prop),
                // NOT from the API which returns a global/default value.
                const maxCap = capacityRule.max_visitors;
                const percentage = maxCap > 0 ? (currentCount / maxCap) * 100 : 0;
                const remaining = Math.max(0, maxCap - currentCount);

                setCurrentVisitors(currentCount);
                setMaximumCapacity(maxCap);
                setCapacityPercentage(percentage);
                setRemainingCapacity(remaining);
                
                // Determine capacity status based on percentage from capacity rule
                let newStatus = 'SAFE';
                if (percentage >= capacityRule.critical_threshold_percent) {
                    newStatus = 'FULL';
                    setCapacityStatus('FULL');
                    setIsAtCapacity(true);
                    
                    // Notify only if status changed to FULL
                    if (previousCapacityStatus !== 'FULL') {
                        try {
                            await fetch('/staff/api/create-notification', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    type: 'capacity_critical',
                                    current_visitors: currentCount,
                                    maximum_capacity: maxCap,
                                })
                            });
                        } catch (err) {
                            console.error('Error creating capacity critical notification:', err);
                        }
                    }
                } else if (percentage >= capacityRule.warning_threshold_percent) {
                    newStatus = 'WARNING';
                    setCapacityStatus('WARNING');
                    setIsAtCapacity(false);
                    
                    // Notify only if status changed to WARNING (and wasn't FULL before)
                    if (previousCapacityStatus === 'SAFE' || previousCapacityStatus === null) {
                        try {
                            await fetch('/staff/api/create-notification', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    type: 'capacity_warning',
                                    current_visitors: currentCount,
                                    maximum_capacity: maxCap,
                                    capacity_percentage: percentage,
                                })
                            });
                        } catch (err) {
                            console.error('Error creating capacity warning notification:', err);
                        }
                    }
                } else {
                    newStatus = 'SAFE';
                    setCapacityStatus('SAFE');
                    setIsAtCapacity(false);
                }
                
                setPreviousCapacityStatus(newStatus);
            }
        } catch (error) {
            console.error('Error fetching capacity status:', error);
        }
    };
    
    // Fetch today's statistics (total arrivals, verified, denied, total guests)
    const fetchTodayStats = async () => {
        try {
            const response = await fetch('/staff/api/arrival-stats');
            const data = await response.json();
            
            if (data.success) {
                setTodayStats(data.data);
                setTotalVisitorsToday(data.data.total_arrivals);
                setVerifiedArrivals(data.data.verified_arrivals);
                setDeniedArrivals(data.data.denied_arrivals);
            }
        } catch (error) {
            console.error('Error fetching today stats:', error);
        }
    };
    
    // Fetch recent arrivals from API
    const fetchRecentArrivals = async () => {
        setArrivalsLoading(true);
        try {
            const response = await fetch('/staff/api/recent-arrivals');
            const data = await response.json();
            
            if (data.success) {
                setRecentArrivalsData(data.data || []);
                setLoggedArrivals(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching recent arrivals:', error);
        } finally {
            setArrivalsLoading(false);
        }
    };

    // Fetch guides for walk-in modal
    const fetchGuides = async () => {
        try {
            const response = await fetch('/admin/api/guides');
            const data = await response.json();
            
            if (data.success) {
                setGuides(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching guides:', error);
        }
    };

    // Load all data on mount and set up auto-refresh
    useEffect(() => {
        // Fetch all data on mount
        fetchCapacityStatus();
        fetchTodayStats();
        fetchRecentArrivals();
        fetchGuides();
        
        // Set up intervals for real-time updates
        const capacityInterval = setInterval(fetchCapacityStatus, 10000); // Every 10 seconds
        const statsInterval = setInterval(fetchTodayStats, 15000); // Every 15 seconds
        const arrivalsInterval = setInterval(fetchRecentArrivals, 20000); // Every 20 seconds
        
        return () => {
            clearInterval(capacityInterval);
            clearInterval(statsInterval);
            clearInterval(arrivalsInterval);
        };
    }, []);

    useEffect(() => {
        setServices(
            attraction
                ? [
                      {
                          id: attraction.id,
                          name: attraction.name,
                          location: attraction.location ?? undefined,
                          category: attraction.category ?? undefined,
                      },
                  ]
                : [],
        );
    }, [attraction]);

    // Cleanup camera scanner on unmount
    useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    // Start camera scanner
    const startScanner = async () => {
        setCameraError('');
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Camera API not supported in this browser.');
            }
            setIsCameraActive(true);
            await new Promise(resolve => setTimeout(resolve, 300));
            if (!videoRef.current) throw new Error('Video element not ready.');

            let lastCode: string | null = null;
            const scanner = new QrScanner(
                videoRef.current,
                (result: any) => {
                    if (result?.data) {
                        const code = result.data.trim();
                        if (code === lastCode) return;
                        lastCode = code;
                        scanner.stop();
                        handleScanResult(code).finally(() => {
                            scanner.start();
                            lastCode = null;
                        });
                    }
                },
                {
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5,
                    highlightCodeOutline: true,
                    returnDetailedScanResult: true,
                    onDecodeError: () => {},
                }
            );
            scannerRef.current = scanner;
            await scanner.start();
        } catch (err: any) {
            setIsCameraActive(false);
            let msg = 'Camera error: ' + (err.message || 'Unknown error');
            if (err.name === 'NotAllowedError') msg = '📱 Camera permission denied. Please allow camera access in your browser settings.';
            else if (err.name === 'NotFoundError') msg = '📵 No camera found on this device.';
            else if (err.name === 'NotReadableError') msg = '⚠️ Camera is busy or in use by another app.';
            setCameraError(msg);
            if (scannerRef.current) { try { scannerRef.current.destroy(); } catch {} scannerRef.current = null; }
        }
    };

    // Stop camera scanner
    const stopScanner = () => {
        if (scannerRef.current) {
            try { scannerRef.current.stop(); scannerRef.current.destroy(); } catch {}
            scannerRef.current = null;
        }
        setIsCameraActive(false);
    };

    // Handle QR scan result (from camera or manual entry)
    const handleScanResult = async (code: string): Promise<void> => {
        const cleanCode = code.trim();
        if (!cleanCode) return;

        if (isAtCapacity) {
            setScanResult('error');
            setScanError('🚫 Maximum visitor capacity reached. Entry temporarily closed.');
            return;
        }
        if (processingCode === cleanCode) return;
        if (scannedQRCodes.has(cleanCode)) {
            setScanResult('error');
            setScanError('❌ This QR code has already been scanned today.');
            return;
        }

        setProcessingCode(cleanCode);
        setScanResult(null);
        setScanError('');
        setScannedBooking(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Step 1: Validate QR code
            const validateRes = await fetch('/staff/api/validate-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
                body: JSON.stringify({ booking_code: cleanCode }),
            });
            const validateData = await validateRes.json();

            if (!validateData.success) {
                setScanResult('error');
                setScanError(validateData.message || 'Invalid or unrecognized QR code.');
                return;
            }

            // Step 2: Log the arrival
            const logRes = await fetch('/staff/api/log-arrival', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
                body: JSON.stringify({
                    qr_token: cleanCode,
                    guest_name: validateData.booking?.first_guest_name,
                    guide_id: null,
                    arrival_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                }),
            });
            const logData = await logRes.json();

            if (logData.success) {
                setScannedQRCodes(prev => new Set([...prev, cleanCode]));
                setScanResult('success');
                setScannedBooking(logData.data);
                fetchTodayStats();
                fetchRecentArrivals();
                fetchCapacityStatus();
                setTimeout(() => {
                    setScanResult(null);
                    setScannedBooking(null);
                }, 4000);
            } else {
                setScanResult('error');
                setScanError(logData.message || 'Failed to log arrival.');
            }
        } catch (err: any) {
            setScanResult('error');
            setScanError(`Error: ${err.message || 'Unable to process QR code'}`);
        } finally {
            setProcessingCode(null);
        }
    };

    // Clear scan
    const handleClearScan = () => {
        setScannedBooking(null);
        setScanResult(null);
        setScanError('');
        setScanInput('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrance Staff Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">

                {/* Attraction Banner */}
                <div className="flex items-center justify-between rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#375534] to-[#0F2A1D] flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] font-medium">Assigned Attraction</p>
                            <p className="text-base font-bold text-[#0F2A1D] dark:text-white">{attraction.name}</p>
                            {attraction.location && (
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" />{attraction.location}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Max Capacity</p>
                            <p className="text-lg font-bold text-[#0F2A1D] dark:text-white">{capacityRule.max_visitors}</p>
                        </div>
                        <button
                            onClick={() => router.get('/staff/select-attraction')}
                            className="text-xs px-3 py-2 rounded-lg border border-[#AEC3B0]/60 text-[#375534] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#1a3a2a] transition-colors"
                        >
                            Change Attraction
                        </button>
                    </div>
                </div>
               
                {/* Statistics Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-1 font-medium">Total Visitors Today</p>
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{totalVisitorsToday}</p>
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
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{currentVisitors}</p>
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
                                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-white">{maximumCapacity}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">Site limit</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border-2 shadow-sm p-6 hover:shadow-md transition-shadow ${
                        capacityStatus === 'FULL'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : capacityStatus === 'WARNING'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D]'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium mb-1 ${
                                    capacityStatus === 'FULL'
                                        ? 'text-red-700 dark:text-red-300'
                                        : capacityStatus === 'WARNING'
                                        ? 'text-yellow-700 dark:text-yellow-300'
                                        : 'text-[#6B8071] dark:text-[#AEC3B0]'
                                }`}>Capacity Status</p>
                                <p className={`text-3xl font-bold ${
                                    capacityStatus === 'FULL'
                                        ? 'text-red-600 dark:text-red-400'
                                        : capacityStatus === 'WARNING'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'
                                }`}>{Math.round(capacityPercentage)}%</p>
                                <p className={`text-xs mt-2 ${
                                    capacityStatus === 'FULL'
                                        ? 'text-red-600 dark:text-red-400 font-semibold'
                                        : capacityStatus === 'WARNING'
                                        ? 'text-yellow-600 dark:text-yellow-400 font-semibold'
                                        : 'text-[#6B8071] dark:text-[#AEC3B0]'
                                }`}>
                                    {capacityStatus === 'FULL' ? '🔴 FULL' : capacityStatus === 'WARNING' ? '⚠️ WARNING' : '🟢 SAFE'}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                capacityStatus === 'FULL'
                                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                                    : capacityStatus === 'WARNING'
                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                    : 'bg-gradient-to-br from-green-500 to-green-600'
                            }`}>
                                <AlertTriangle className={`w-6 h-6 text-white ${capacityStatus === 'NORMAL' ? 'opacity-50' : ''}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrival Logging System */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* QR Scanner and Verification - Main Panel */}
                    <div className="lg:col-span-2 rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-md overflow-hidden">
                        <div className="p-6 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <QrCodeIcon className="w-6 h-6 text-[#6B8071]" />
                                    <h2 className="text-xl font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Arrival Logging System</h2>
                                </div>
                                {/* Mode Toggle */}
                                <div className="flex gap-2 bg-[#F0F5F0] dark:bg-[#1a3a2a] p-1 rounded-lg">
                                    <button
                                        onClick={() => setEntryMode('qr')}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                                            entryMode === 'qr'
                                                ? 'bg-white dark:bg-[#375534] text-[#375534] dark:text-white shadow-sm'
                                                : 'text-[#6B8071] dark:text-[#AEC3B0] hover:bg-white/50 dark:hover:bg-[#0F2A1D]/50'
                                        }`}
                                    >
                                        <QrCodeIcon className="w-4 h-4 inline-block mr-2" />
                                        QR Code
                                    </button>
                                    <button
                                        onClick={() => setEntryMode('walk-in')}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                                            entryMode === 'walk-in'
                                                ? 'bg-white dark:bg-[#375534] text-[#375534] dark:text-white shadow-sm'
                                                : 'text-[#6B8071] dark:text-[#AEC3B0] hover:bg-white/50 dark:hover:bg-[#0F2A1D]/50'
                                        }`}
                                    >
                                        <Plus className="w-4 h-4 inline-block mr-2" />
                                        Walk-in
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                {entryMode === 'qr' 
                                    ? 'Scan QR code to verify booking and log arrival'
                                    : 'Record a tourist without a pre-existing booking'
                                }
                            </p>
                        </div>

                        <div className="p-8 space-y-6">
                            {entryMode === 'qr' ? (
                                <>
                                    {/* Scanning animation keyframes */}
                                    <style>{`
                                        @keyframes scanLine { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
                                        .scan-line { animation: scanLine 2s ease-in-out infinite; }
                                    `}</style>

                                    {/* Capacity block warning */}
                                    {isAtCapacity && (
                                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                            <p className="text-red-800 dark:text-red-300 font-medium text-sm">🚫 Maximum capacity reached. Entry temporarily closed.</p>
                                        </div>
                                    )}

                                    {/* Camera Scanner */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-2 flex items-center gap-2">
                                            <Camera className="w-4 h-4" /> Camera Scanner
                                        </label>

                                        {/* Video viewport */}
                                        <div className="relative rounded-lg overflow-hidden bg-black mx-auto" style={{ aspectRatio: '4/3', maxWidth: '260px' }}>
                                            <video
                                                ref={videoRef}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                className={`transition-all duration-500 ${isCameraActive ? 'ring-2 ring-green-500' : 'ring-2 ring-gray-400'}`}
                                                playsInline muted autoPlay
                                            />

                                            {/* Scanning overlay */}
                                            {isCameraActive && (
                                                <>
                                                    <div className="absolute inset-0 pointer-events-none" style={{
                                                        background: 'linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.08) 40%,rgba(0,0,0,0.08) 60%,rgba(0,0,0,0.35) 100%)'
                                                    }} />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="relative" style={{ width: '60%', aspectRatio: '1', maxWidth: '200px' }}>
                                                            {/* Corner TL */}
                                                            <div className="absolute top-0 left-0 w-6 h-6">
                                                                <div className="absolute top-0 left-0 w-full h-1 bg-green-400 rounded-full" />
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-green-400 rounded-full" />
                                                            </div>
                                                            {/* Corner TR */}
                                                            <div className="absolute top-0 right-0 w-6 h-6">
                                                                <div className="absolute top-0 right-0 w-full h-1 bg-green-400 rounded-full" />
                                                                <div className="absolute top-0 right-0 w-1 h-full bg-green-400 rounded-full" />
                                                            </div>
                                                            {/* Corner BL */}
                                                            <div className="absolute bottom-0 left-0 w-6 h-6">
                                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-400 rounded-full" />
                                                                <div className="absolute bottom-0 left-0 w-1 h-full bg-green-400 rounded-full" />
                                                            </div>
                                                            {/* Corner BR */}
                                                            <div className="absolute bottom-0 right-0 w-6 h-6">
                                                                <div className="absolute bottom-0 right-0 w-full h-1 bg-green-400 rounded-full" />
                                                                <div className="absolute bottom-0 right-0 w-1 h-full bg-green-400 rounded-full" />
                                                            </div>
                                                            {/* Scan line */}
                                                            <div className="scan-line absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full"
                                                                style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Idle placeholder */}
                                            {!isCameraActive && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <QrCodeIcon className="h-10 w-10 text-white/60 mx-auto mb-2" />
                                                        <p className="text-white text-sm font-semibold">Start camera to scan</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Camera error */}
                                        {cameraError && (
                                            <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg text-sm">
                                                {cameraError}
                                            </div>
                                        )}

                                        {/* Camera toggle */}
                                        <div className="mt-3">
                                            {isCameraActive ? (
                                                <button onClick={stopScanner}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                                                    <StopCircle className="h-4 w-4" /> Stop Camera
                                                </button>
                                            ) : (
                                                <button onClick={startScanner} disabled={isAtCapacity}
                                                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                                                    <Camera className="h-4 w-4" /> 📱 Start Camera
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Manual Entry */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">Manual Entry</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={scanInput}
                                                onChange={(e) => setScanInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && scanInput.trim()) {
                                                        const code = scanInput.trim();
                                                        setScanInput('');
                                                        handleScanResult(code);
                                                    }
                                                }}
                                                placeholder="Enter booking code and press ENTER..."
                                                disabled={isAtCapacity || !!processingCode}
                                                className="w-full px-4 py-3 border-2 border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-white placeholder:text-[#6B8071] dark:placeholder:text-[#AEC3B0] focus:border-[#6B8071] focus:outline-none disabled:opacity-50"
                                            />
                                            <QrCodeIcon className="absolute right-4 top-3.5 w-5 h-5 text-[#6B8071]" />
                                        </div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                            {processingCode ? '⏳ Processing...' : 'Press ENTER to validate and log arrival'}
                                        </p>
                                    </div>

                                    {/* Success result */}
                                    {scanResult === 'success' && scannedBooking && (
                                        <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                                            <div className="flex items-center gap-3 mb-3">
                                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                <p className="font-semibold text-green-900 dark:text-green-300">✅ Arrival Logged Successfully</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-[#6B8071] dark:text-gray-400 mb-1">Guest Name</p>
                                                    <p className="font-semibold text-sm text-[#0F2A1D] dark:text-white">{scannedBooking.guest_name || 'Group'}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-[#6B8071] dark:text-gray-400 mb-1">Arrival Time</p>
                                                    <p className="font-mono font-bold text-sm text-[#0F2A1D] dark:text-white">{scannedBooking.arrival_time}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-[#6B8071] dark:text-gray-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Total Guests</p>
                                                    <p className="font-bold text-blue-600 dark:text-blue-400">{scannedBooking.total_guests}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-[#6B8071] dark:text-gray-400 mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Guide</p>
                                                    <p className="font-semibold text-sm text-[#0F2A1D] dark:text-white">{scannedBooking.guide_name || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <p className="text-center text-xs text-green-700 dark:text-green-400 mt-3">📱 Ready to scan next QR code...</p>
                                        </div>
                                    )}

                                    {/* Error result */}
                                    {scanResult === 'error' && scanError && (
                                        <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-red-900 dark:text-red-300 mb-1">Scan Failed</p>
                                                    <p className="text-sm text-red-700 dark:text-red-400">{scanError}</p>
                                                    <button onClick={handleClearScan} className="mt-2 text-xs text-red-600 dark:text-red-400 underline">Clear & Try Again</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Idle state */}
                                    {!scanResult && !isCameraActive && (
                                        <div className="flex flex-col items-center justify-center py-4 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                            <QrCodeIcon className="w-8 h-8 mb-2 opacity-40" />
                                            <p className="text-sm">Start camera or enter a booking code manually</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Walk-in Entry Section */}
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 flex items-center justify-center">
                                            <Plus className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">Add Walk-in Tourist</h3>
                                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-6">Record a tourist without a pre-existing booking</p>
                                        </div>
                                        <button
                                            onClick={() => setShowWalkInModal(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Start Walk-in Entry
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Real-Time Visitor Counter & Capacity Monitoring */}
                    <div className={`rounded-2xl border-2 shadow-md overflow-hidden transition-all ${
                        capacityStatus === 'FULL'
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                            : capacityStatus === 'WARNING'
                            ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
                            : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D]'
                    }`}>
                        <div className={`p-6 border-b ${
                            capacityStatus === 'FULL'
                                ? 'border-red-300 dark:border-red-700/40 bg-red-100 dark:bg-red-900/20'
                                : capacityStatus === 'WARNING'
                                ? 'border-yellow-300 dark:border-yellow-700/40 bg-yellow-100 dark:bg-yellow-900/20'
                                : 'border-[#AEC3B0]/20 dark:border-[#375534]/20'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className={`w-6 h-6 ${
                                        capacityStatus === 'FULL'
                                            ? 'text-red-600'
                                            : capacityStatus === 'WARNING'
                                            ? 'text-yellow-600'
                                            : 'text-green-600'
                                    }`} />
                                    <h2 className={`text-lg font-semibold ${
                                        capacityStatus === 'FULL'
                                            ? 'text-red-800 dark:text-red-300'
                                            : capacityStatus === 'WARNING'
                                            ? 'text-yellow-800 dark:text-yellow-300'
                                            : 'text-[#0F2A1D] dark:text-[#E3EED4]'
                                    }`}>Capacity Status</h2>
                                </div>
                                <Badge className={`font-semibold py-1 px-3 ${
                                    capacityStatus === 'FULL'
                                        ? 'bg-red-500 text-white'
                                        : capacityStatus === 'WARNING'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-green-500 text-white'
                                }`}>
                                    {capacityStatus === 'FULL' ? '🔴 FULL' : capacityStatus === 'WARNING' ? '⚠️ WARNING' : '🟢 SAFE'}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {/* Capacity Alert - If at maximum */}
                            {capacityStatus === 'FULL' && (
                                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-700 flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-red-800 dark:text-red-300 mb-1">Entry Closed</p>
                                        <p className="text-sm text-red-700 dark:text-red-400">Maximum visitor capacity reached. Entry temporarily closed.</p>
                                    </div>
                                </div>
                            )}

                            {/* Warning Alert - If near capacity */}
                            {capacityStatus === 'WARNING' && (
                                <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 dark:border-yellow-700 flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Approaching Capacity</p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Site is approaching maximum capacity. Monitor visitor levels closely.</p>
                                    </div>
                                </div>
                            )}

                            {/* Current Count */}
                            <div>
                                <div className="flex items-end justify-between mb-3">
                                    <p className={`text-sm font-medium ${
                                        capacityStatus === 'FULL'
                                            ? 'text-red-600 dark:text-red-400'
                                            : capacityStatus === 'WARNING'
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-[#6B8071] dark:text-[#AEC3B0]'
                                    }`}>Inside Now</p>
                                    <p className={`text-2xl font-bold ${
                                        capacityStatus === 'FULL'
                                            ? 'text-red-600 dark:text-red-400'
                                            : capacityStatus === 'WARNING'
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-[#0F2A1D] dark:text-white'
                                    }`}>{currentVisitors} / {maximumCapacity}</p>
                                </div>
                                <div className="w-full h-3 bg-[#E3EED4] dark:bg-[#375534]/30 rounded-full overflow-hidden border border-opacity-30">
                                    <div 
                                        className={`h-full transition-all duration-500 ${
                                            capacityStatus === 'FULL'
                                                ? 'bg-red-500'
                                                : capacityStatus === 'WARNING'
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Remaining Capacity */}
                            <div className={`p-4 rounded-lg border ${
                                capacityStatus === 'FULL'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/40'
                                    : capacityStatus === 'WARNING'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700/40'
                                    : 'bg-[#E3EED4]/50 dark:bg-[#375534]/30 border-[#AEC3B0]/40 dark:border-[#375534]/40'
                            }`}>
                                <p className={`text-xs font-medium mb-2 ${
                                    capacityStatus === 'FULL'
                                        ? 'text-red-600 dark:text-red-400'
                                        : capacityStatus === 'WARNING'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-[#6B8071] dark:text-[#AEC3B0]'
                                }`}>Remaining Capacity</p>
                                <p className={`text-2xl font-bold ${
                                    capacityStatus === 'FULL'
                                        ? 'text-red-600 dark:text-red-400'
                                        : capacityStatus === 'WARNING'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-[#0F2A1D] dark:text-white'
                                }`}>{remainingCapacity}</p>
                                <p className={`text-xs mt-1 ${
                                    capacityStatus === 'FULL'
                                        ? 'text-red-600 dark:text-red-400'
                                        : capacityStatus === 'WARNING'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-[#6B8071] dark:text-[#AEC3B0]'
                                }`}>spaces available</p>
                            </div>

                            {/* Capacity Percentage */}
                            <div className={`flex items-center justify-between p-4 rounded-lg border ${
                                capacityStatus === 'FULL'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/40'
                                    : capacityStatus === 'WARNING'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700/40'
                                    : 'bg-white dark:bg-[#0F2A1D] border-[#AEC3B0]/40 dark:border-[#375534]/40'
                            }`}>
                                <div>
                                    <p className={`text-xs font-medium ${
                                        capacityStatus === 'FULL'
                                            ? 'text-red-600 dark:text-red-400'
                                            : capacityStatus === 'WARNING'
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-[#6B8071] dark:text-[#AEC3B0]'
                                    }`}>Usage</p>
                                    <p className={`text-xl font-bold ${
                                        capacityStatus === 'FULL'
                                            ? 'text-red-600 dark:text-red-400'
                                            : capacityStatus === 'WARNING'
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-[#0F2A1D] dark:text-white'
                                    }`}>{Math.round(capacityPercentage)}%</p>
                                </div>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                                    capacityStatus === 'FULL'
                                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                                        : capacityStatus === 'WARNING'
                                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                        : 'bg-gradient-to-br from-green-500 to-green-600'
                                }`}>
                                    {Math.round(capacityPercentage)}%
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-center">
                                <Badge 
                                    className={`text-sm py-2 px-4 font-semibold ${
                                        capacityPercentage <= 60
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : capacityPercentage <= 80
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {capacityStatus === 'FULL' ? '🔴 FULL' : capacityStatus === 'WARNING' ? '⚠️ WARNING' : '🟢 SAFE'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Walk-in Modal */}
                <WalkInModal 
                    isOpen={showWalkInModal}
                    onClose={() => setShowWalkInModal(false)}
                    services={services}
                    guides={guides}
                />

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
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guest Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guests</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guide</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Arrival Time</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Service</th>
                                    <th className="text-left py-4 px-6 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arrivalsLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 px-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                            Loading recent arrivals...
                                        </td>
                                    </tr>
                                ) : recentArrivalsData && recentArrivalsData.length > 0 ? (
                                    recentArrivalsData.map((arrival: any) => (
                                        <tr key={arrival.id} className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/30 dark:hover:bg-[#375534]/20 transition-colors">
                                            <td className="py-4 px-6 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{arrival.guest_name || `Guest #${arrival.guest_list_id}`}</td>
                                            <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.total_guests}</td>
                                            <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.guide_name}</td>
                                            <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.arrival_time}</td>
                                            <td className="py-4 px-6 text-[#6B8071] dark:text-[#AEC3B0]">{arrival.service_name}</td>
                                            <td className="py-4 px-6">
                                                <Badge className={`${
                                                    arrival.status === 'arrived'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                    {arrival.status === 'arrived' ? '✓ Logged' : 'Pending'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 px-6 text-center text-[#6B8071] dark:text-[#AEC3B0]">
                                            No arrivals logged yet today
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
