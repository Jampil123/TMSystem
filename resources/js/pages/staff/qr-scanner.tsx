import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { QrCode as QrCodeIcon, Check, X, AlertTriangle, AlertCircle, Users, UserCheck, Calendar, CheckCircle, Clock, Shield, Camera, StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';
import QrScanner from 'qr-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'QR Code Scanner', href: '/staff/qr-scanner' },
];

export default function QRCodeScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    
    const [scanInput, setScanInput] = useState('');
    const [scannedBooking, setScannedBooking] = useState<any>(null);
    const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
    const [validationDetails, setValidationDetails] = useState<any>(null);
    const [recentScansList, setRecentScansList] = useState<any[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string>('');
    
    // Stats from backend API
    const [todayStats, setTodayStats] = useState<any>({
        total_scans: 0,
        successful_arrivals: 0,
        failed_scans: 0
    });
    const [recentArrivals, setRecentArrivals] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingRecents, setIsLoadingRecents] = useState(false);

    // Start Camera Scanner
    const startScanner = async () => {
        try {
            // DEBUG: Log environment info
            console.log('=== CAMERA DEBUG START ===');
            console.log('Browser:', navigator.userAgent);
            console.log('Navigator object exists:', !!navigator);
            console.log('navigator.mediaDevices:', navigator.mediaDevices);
            console.log('navigator.mediaDevices?.getUserMedia:', navigator.mediaDevices?.getUserMedia);
            console.log('Window location:', window.location);
            console.log('Is HTTPS:', window.location.protocol === 'https:');
            
            // First, set camera active so video element renders
            setIsCameraActive(true);
            setCameraError('');
            
            // Longer delay to ensure video element is fully in the DOM
            await new Promise(resolve => setTimeout(resolve, 200));

            if (!videoRef.current) {
                console.error('Video ref is null');
                setCameraError('❌ Video element not found. Please try again or refresh the page.');
                setIsCameraActive(false);
                return;
            }

            console.log('✓ Video element found:', videoRef.current);
            console.log('Creating QrScanner with video element...');

            // Check if mediaDevices API is available
            if (!navigator.mediaDevices) {
                console.error('navigator.mediaDevices is not available');
                throw new Error('Camera API not available. Please use a modern browser (Chrome, Firefox, Edge, Safari).');
            }

            if (!navigator.mediaDevices.getUserMedia) {
                console.error('getUserMedia is not available');
                throw new Error('getUserMedia not supported. Please use a modern browser.');
            }

            // Request camera permission explicitly first
            try {
                console.log('Requesting camera permission with facingMode: user...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'user'  // Front camera for laptops
                    }
                });
                console.log('✓ Camera permission granted');
                console.log('Stream tracks:', stream.getTracks());
                
                // Stop the stream - we just needed permission
                stream.getTracks().forEach(track => {
                    console.log('Stopping track:', track.kind);
                    track.stop();
                });
                console.log('✓ Stream stopped');
            } catch (permError: any) {
                console.error('Camera permission error:', permError);
                console.error('Permission error name:', permError.name);
                console.error('Permission error message:', permError.message);
                throw permError;
            }

            // Create scanner instance
            const scanner = new QrScanner(
                videoRef.current,
                (result: any) => {
                    console.log('✓ QR Code detected:', result);
                    if (result && result.data) {
                        handleScanResult(result.data);
                    }
                },
                {
                    onDecodeError: (error: any) => {
                        // Silently ignore decode errors during scanning
                    },
                    preferredCamera: 'user',  // Use front camera for laptops
                    maxScansPerSecond: 5,
                    highlightCodeOutline: true,
                }
            );

            scannerRef.current = scanner;

            console.log('Starting scanner...');
            // Start the scanner
            await scanner.start();
            console.log('✓ Scanner started successfully');
            console.log('=== CAMERA DEBUG END (SUCCESS) ===');
            setCameraError('');
        } catch (error: any) {
            console.error('=== CAMERA ERROR ===');
            console.error('Full error object:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Error toString:', error.toString());
            console.error('=== END CAMERA ERROR ===');
            
            // Determine the specific error type
            let errorMessage = '❌ Camera error occurred';
            
            if (error.message?.includes('getUserMedia')) {
                errorMessage = '⚠️ getUserMedia not available. Browser or device may not support camera access.';
            } else if (error.message?.includes('https') || error.message?.includes('secure')) {
                errorMessage = '🔒 HTTPS Required: Your browser requires HTTPS for camera access. Try using https://localhost or a different browser.';
            } else if (error.name === 'NotAllowedError' || error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
                errorMessage = '📱 Camera permission denied. Please:\n1. Check browser permissions\n2. Allow camera when prompted\n3. Refresh page (Ctrl+R)';
            } else if (error.message?.includes('Camera not found') || error.name === 'NotFoundError') {
                errorMessage = '📵 No camera found. Please:\n1. Check camera is connected\n2. Check Windows Device Manager\n3. Restart browser';
            } else if (error.name === 'NotReadableError' || error.message?.includes('in use')) {
                errorMessage = '⚠️ Camera is busy. Close other apps using camera (Zoom, Teams, Skype).';
            } else if (error.message) {
                errorMessage = `❌ ${error.message.substring(0, 120)}`;
            }
            
            setCameraError(errorMessage + '\n\n✅ You can still use manual entry below.');
            setIsCameraActive(false);
            
            // Clean up on error
            if (scannerRef.current) {
                try {
                    scannerRef.current.destroy();
                } catch (e) {
                    console.error('Error destroying scanner:', e);
                }
                scannerRef.current = null;
            }
        }
    };

    // Stop Camera Scanner
    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
            setIsCameraActive(false);
        }
    };

    // Handle scan result
    const handleScanResult = async (code: string) => {
        const cleanCode = code.trim();
        setScanResult(null);
        setValidationDetails(null);

        try {
            // Call API to process QR token from guest_lists_qr_codes table
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            console.log('Processing QR token:', cleanCode);
            console.log('CSRF Token present:', !!csrfToken);
            
            const response = await fetch('/staff/api/qr-arrival', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ qr_token: cleanCode }),
            });

            console.log('QR Arrival Response Status:', response.status);

            const responseText = await response.text();
            console.log('QR Arrival Response Body:', responseText);

            const data = JSON.parse(responseText);

            if (data.success) {
                // Arrival logged successfully
                setScanResult('success');
                setScannedBooking(data.data);
                setValidationDetails({
                    allValid: true,
                    issues: [],
                });

                // Auto-clear after 3 seconds
                setTimeout(() => {
                    setScanResult(null);
                    setScannedBooking(null);
                    setValidationDetails(null);
                    setScanInput('');
                }, 3000);
            } else {
                // Error processing QR code
                setScanResult('error');
                setValidationDetails({
                    allValid: false,
                    issues: [data.message],
                });
            }

            // Add to recent scans
            const newScan = {
                id: recentScansList.length + 1,
                qrToken: cleanCode,
                guestName: data.data?.guest_name || 'Unknown',
                guideName: data.data?.guide_name || 'N/A',
                scanTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                result: data.success ? 'Logged' : (data.code || 'Error'),
                status: data.success ? 'success' : 'error',
            };
            setRecentScansList([newScan, ...recentScansList]);
        } catch (error: any) {
            console.error('QR code processing error:', error);
            setScanResult('error');
            setValidationDetails({
                allValid: false,
                issues: [`❌ Error: ${error.message || 'Unable to process QR code. Please check your connection and try again.'}`],
            });
        }
    };

    // Validate booking
    // Note: Booking validation is now handled by the API validateBooking endpoint
    // which queries the actual guest_lists database table

    // Handle manual entry
    const handleManualScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleScanResult(scanInput);
            setScanInput('');
        }
    };

    // Confirm arrival (now automatic on successful QR scan)
    const handleConfirmArrival = async () => {
        // Arrival is now automatically logged when QR code is successfully processed
        // This function kept for backward compatibility
        setScanResult(null);
        setScannedBooking(null);
        setValidationDetails(null);
        setScanInput('');
    };

    // Clear scan
    const handleClearScan = () => {
        setScannedBooking(null);
        setScanResult(null);
        setValidationDetails(null);
        setScanInput('');
    };

    // Fetch today's stats from API
    const fetchTodayStats = async () => {
        setIsLoadingStats(true);
        try {
            const response = await fetch('/staff/api/arrival-stats');
            const data = await response.json();
            if (data.success) {
                setTodayStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Fetch recent arrivals from API
    const fetchRecentArrivals = async () => {
        setIsLoadingRecents(true);
        try {
            const response = await fetch('/staff/api/recent-arrivals');
            const data = await response.json();
            if (data.success) {
                setRecentArrivals(data.data);
            }
        } catch (error) {
            console.error('Error fetching recent arrivals:', error);
        } finally {
            setIsLoadingRecents(false);
        }
    };

    // Load stats on mount
    useEffect(() => {
        fetchTodayStats();
        fetchRecentArrivals();
        
        // Refresh stats every 5 seconds to show real-time updates
        const statsInterval = setInterval(() => {
            fetchTodayStats();
            fetchRecentArrivals();
        }, 5000);

        return () => clearInterval(statsInterval);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Code Scanner" />
            <div className="space-y-6 p-8 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#375534] to-[#0F2A1D] rounded-lg p-6 text-white">
                    <div>
                        <h1 className="text-3xl font-bold">QR Code Scanner</h1>
                        <p className="mt-1 text-sm text-[#E3EED4]">Scan or manually enter booking codes to verify and log arrivals</p>
                    </div>
                    <QrCodeIcon className="h-12 w-12 text-[#E3EED4]" />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Scanner Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Camera Feed */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Camera className="h-5 w-5 text-blue-500" />
                                Camera Scanner
                            </h2>

                            {/* Video Element - Always Present but Hidden Initially */}
                            <video
                                ref={videoRef}
                                style={{ 
                                    display: isCameraActive ? 'block' : 'none',
                                    maxHeight: '400px',
                                    width: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '0.5rem'
                                }}
                                playsInline
                                muted
                                autoPlay
                            />

                            {isCameraActive ? (
                                <div className="space-y-4 mt-4">
                                    <div className="relative rounded-lg overflow-hidden bg-black" style={{ display: 'none' }}>
                                        <div className="absolute inset-0 border-2 border-green-400 opacity-50 pointer-events-none">
                                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400"></div>
                                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400"></div>
                                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400"></div>
                                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Camera scanner is active and ready to detect QR codes</p>
                                    <button
                                        onClick={stopScanner}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <StopCircle className="h-5 w-5" />
                                        Stop Camera Scanner
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-4">
                                    {cameraError && (
                                        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg text-sm">
                                            {cameraError}
                                        </div>
                                    )}
                                    <button
                                        onClick={startScanner}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <Camera className="h-5 w-5" />
                                        📱 Start Camera Scanner
                                    </button>
                                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                                        Click above to enable your device camera and start scanning QR codes
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Manual Entry */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manual Entry</h2>
                            <div className="relative">
                                <QrCodeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    onKeyPress={handleManualScan}
                                    placeholder="Enter booking code (or press ENTER to scan)..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Example: BK-001-2026</p>
                        </div>

                        {/* Scan Result */}
                        {scanResult && (
                            <div className={`rounded-lg border p-6 ${
                                scanResult === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                            }`}>
                                {scanResult === 'success' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                            <div>
                                                <p className="font-semibold text-green-900 dark:text-green-300">✅ Arrival Logged Successfully</p>
                                                <p className="text-sm text-green-700 dark:text-green-400">Guest entry recorded in system</p>
                                            </div>
                                        </div>

                                        {scannedBooking && (
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Guest Name</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{scannedBooking.guest_name || 'Group'}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Arrival Time</p>
                                                    <p className="font-mono font-bold text-gray-900 dark:text-white">{scannedBooking.arrival_time}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> Total Guests
                                                    </p>
                                                    <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">{scannedBooking.total_guests}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <UserCheck className="h-3 w-3" /> Assigned Guide
                                                    </p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{scannedBooking.guide_name || 'N/A'}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg col-span-2">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Service Type</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{scannedBooking.service_name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-center text-sm text-green-700 dark:text-green-400 mt-4">
                                            📱 Ready to scan next QR code...
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                            <div>
                                                <p className="font-semibold text-red-900 dark:text-red-300">❌ Booking Verification Failed</p>
                                                <p className="text-sm text-red-700 dark:text-red-400">Please review the issues below</p>
                                            </div>
                                        </div>
                                        {validationDetails?.issues && (
                                            <div className="space-y-2 mt-4">
                                                {validationDetails.issues.map((issue: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-900 dark:text-white">{issue}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleClearScan}
                                            className="w-full mt-4 bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold py-3 rounded-lg transition"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Stats */}
                    <div className="space-y-6">
                        {/* Scanner Status */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Scanner Status</h3>
                            <div className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className={`font-semibold ${isCameraActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {isCameraActive ? '🟢 Live' : '⚫ Standby'}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Today's Stats</h3>
                            {isLoadingStats ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <p className="text-sm">Loading...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Scans</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.total_scans || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Valid Bookings</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todayStats.successful_arrivals || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Failed Scans</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{todayStats.failed_scans || 0}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Scans */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Scans</h3>
                            {isLoadingRecents ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <p className="text-sm">Loading...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentArrivals && recentArrivals.length > 0 ? (
                                        recentArrivals.slice(0, 5).map((arrival, idx) => (
                                            <div key={idx} className="p-3 rounded-lg text-sm flex items-center justify-between border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                                                <div className="flex-1">
                                                    <p className="font-mono text-xs font-semibold text-green-700 dark:text-green-400">
                                                        {arrival.qr_token || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {arrival.guest_name && `${arrival.guest_name} • `}
                                                        {new Date(arrival.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No arrivals logged yet</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
