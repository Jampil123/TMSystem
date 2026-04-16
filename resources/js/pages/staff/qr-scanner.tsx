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
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [recentScansList, setRecentScansList] = useState<any[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string>('');
    const [debugInfo, setDebugInfo] = useState<string>('');
    
    // Stats from backend API
    const [todayStats, setTodayStats] = useState<any>({
        total_scans: 0,
        successful_arrivals: 0,
        failed_scans: 0
    });
    const [recentArrivals, setRecentArrivals] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingRecents, setIsLoadingRecents] = useState(false);

    // Track scanned QR codes today to prevent duplicates
    const [scannedQRCodes, setScannedQRCodes] = useState<Set<string>>(new Set());
    const [processingCode, setProcessingCode] = useState<string | null>(null);
    const [validationType, setValidationType] = useState<'arrival_duplicate' | 'departure_duplicate' | 'error' | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAction, setSuccessAction] = useState<'entry' | 'exit' | null>(null);
    const [successDetails, setSuccessDetails] = useState<any>(null);

    // Simplified debug function - only logs to console, not to state
    const addDebugInfo = (message: string, data?: any) => {
        // Only log errors and critical info, not verbose debug steps
        if (message.includes('ERROR') || message.includes('❌') || message.includes('✅')) {
            console.log(`[${new Date().toLocaleTimeString()}] ${message}`, data || '');
        }
    };

    // Test camera function
    const testCameraAccess = async () => {
        try {
            // Check if mediaDevices API exists
            if (!navigator.mediaDevices) {
                console.error('mediaDevices not available');
                return false;
            }
            
            if (!navigator.mediaDevices.enumerateDevices) {
                console.error('enumerateDevices not available');
                return false;
            }
            
            // Get all devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length === 0) {
                console.error('No video devices found');
                return false;
            }
            
            // Try to access camera
            addDebugInfo('Attempting to access camera...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: { ideal: 'environment' }
                } 
            });
            
            const videoTrack = stream.getVideoTracks()[0];
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            
            return true;
            
        } catch (error: any) {
            console.error('Camera test failed:', error);
            return false;
        }
    };

    // Start Camera Scanner
    const startScanner = async () => {
        try {
            // Run camera test first
            const cameraAccessible = await testCameraAccess();
            if (!cameraAccessible) {
                throw new Error('Camera test failed. Please check permissions.');
            }
            
            // Set camera active
            setIsCameraActive(true);
            setCameraError('');
            
            // Wait for DOM
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check video element
            if (!videoRef.current) {
                throw new Error('Video element reference is null');
            }
            
            // Create scanner
            let lastDetectedCode: string | null = null;
            
            const scanner = new QrScanner(
                videoRef.current,
                (result: any) => {
                    if (result && result.data) {
                        const detectedCode = result.data.trim();
                        
                        // Check for duplicate scans
                        if (lastDetectedCode === detectedCode) {
                            return;
                        }
                        
                        lastDetectedCode = detectedCode;
                        console.log('QR Code detected:', detectedCode);
                        
                        // Disable scanner briefly to prevent duplicate processing
                        scanner.stop();
                        
                        handleScanResult(detectedCode).finally(() => {
                            // Resume scanner after processing
                            scanner.start();
                            lastDetectedCode = null; // Reset last code
                        });
                    }
                },
                {
                    onDecodeError: (error: any) => {
                        // Silently ignore decode errors (normal when no QR in frame)
                    },
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5,
                    highlightCodeOutline: true,
                    returnDetailedScanResult: true,
                }
            );
            
            scannerRef.current = scanner;
            
            // Start scanner
            await scanner.start();
            console.log('Scanner started');
            
        } catch (error: any) {
            console.error('ERROR starting scanner:', error);
            
            let errorMessage = 'Camera error: ';
            if (error.name === 'NotAllowedError') {
                errorMessage = '📱 Camera permission denied. Please allow camera access in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '📵 No camera found on this device.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '⚠️ Camera is busy or in use by another app.';
            } else if (error.message?.includes('HTTP')) {
                errorMessage = '🔒 HTTPS required. Please use HTTPS:// or localhost';
            } else {
                errorMessage += error.message || 'Unknown error';
            }
            
            setCameraError(errorMessage);
            setIsCameraActive(false);
            
            // Clean up
            if (scannerRef.current) {
                try {
                    scannerRef.current.destroy();
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
                scannerRef.current = null;
            }
        }
    };

    // Stop Camera Scanner
    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.stop();
                scannerRef.current.destroy();
            } catch (e) {
                console.error('Stop error:', e);
            }
            scannerRef.current = null;
            setIsCameraActive(false);
        }
    };

    // Handle scan result
    const handleScanResult = async (code: string) => {
        const cleanCode = code.trim();
        
        // CHECK: Validate QR code is not already being processed
        if (processingCode === cleanCode) {
            setScanResult('error');
            setValidationDetails({ 
                allValid: false, 
                issues: ['This QR code is currently being processed. Please wait...'] 
            });
            setShowValidationModal(true);
            return;
        }
        setProcessingCode(cleanCode);
        
        setScanResult(null);
        setValidationDetails(null);

        try {
            // Validate input
            if (!cleanCode || cleanCode.length === 0) {
                throw new Error('Empty QR code');
            }

            // Get CSRF token
            const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfTokenElement?.getAttribute('content');
            
            // Call toggle-guest-status endpoint
            const response = await fetch('/staff/api/toggle-guest-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ qr_token: cleanCode }),
            });
            
            // Read response body
            let responseBody: string;
            try {
                responseBody = await response.text();
            } catch (readError: any) {
                throw new Error('Failed to read response: ' + readError.message);
            }
            
            // Parse JSON response
            let data: any;
            try {
                data = JSON.parse(responseBody);
            } catch (parseError: any) {
                throw new Error('Invalid JSON response from server: ' + parseError.message);
            }

            // Process response
            if (data.success) {
                console.log(`✅ ${data.action === 'entry' ? 'Entry' : 'Exit'} recorded:`, data.data);
                
                // ADD CODE TO SCANNED CODES SET
                setScannedQRCodes(prev => new Set([...prev, cleanCode]));
                
                setScanResult('success');
                setScannedBooking(data.data);
                setSuccessAction(data.action);
                setSuccessDetails(data.data);
                setShowSuccessModal(true);
                
                fetchTodayStats();
                fetchRecentArrivals();
                
                // Auto-close success modal after 4 seconds
                setTimeout(() => {
                    setShowSuccessModal(false);
                    handleClearScan();
                }, 4000);
            } else {
                setScanResult('error');
                
                // Determine validation type based on error message
                const msgLower = data.message?.toLowerCase() || '';
                if (msgLower.includes('already arrived') || msgLower.includes('already checked in')) {
                    setValidationType('arrival_duplicate');
                } else if (msgLower.includes('already departed') || msgLower.includes('already checked out')) {
                    setValidationType('departure_duplicate');
                } else {
                    setValidationType('error');
                }
                
                setValidationDetails({ 
                    allValid: false, 
                    issues: [data.message],
                    guestName: data.data?.guest_name,
                    arrivalTime: data.data?.arrival_time,
                    departureTime: data.data?.departure_time,
                });
                setShowValidationModal(true);
            }
            
            setTimeout(() => {
                setScanResult(null);
                setScannedBooking(null);
                setValidationDetails(null);
                setScanInput('');
            }, 3000);
        } catch (error: any) {
            console.error('Error processing QR code:', error);
            
            setScanResult('error');
            setValidationType('error');
            setValidationDetails({
                allValid: false,
                issues: [`Error: ${error.message || 'Unable to process QR code'}`],
            });
            setShowValidationModal(true);
        } finally {
            setProcessingCode(null);
        }
    };

    // Handle manual entry
    const handleManualScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setValidationType(null);
            handleScanResult(scanInput);
            setScanInput('');
        }
    };

    // Clear scan
    const handleClearScan = () => {
        setScannedBooking(null);
        setScanResult(null);
        setValidationDetails(null);
        setScanInput('');
    };

    // Clear all scanned codes (admin reset)
    const handleClearScannedCodes = () => {
        setScannedQRCodes(new Set());
    };

    // Fetch today's stats
    const fetchTodayStats = async () => {
        setIsLoadingStats(true);
        try {
            const response = await fetch('/staff/api/arrivals-today');
            const data = await response.json();
            if (data.success && data.data) {
                const arrivals = data.data;
                const verified = arrivals.filter((a: any) => a.status === 'arrived').length;
                const failed = arrivals.filter((a: any) => a.status === 'denied').length;
                setTodayStats({
                    total_scans: arrivals.length,
                    successful_arrivals: verified,
                    failed_scans: failed,
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Fetch recent arrivals
    const fetchRecentArrivals = async () => {
        setIsLoadingRecents(true);
        try {
            const response = await fetch('/staff/api/arrivals-today');
            const data = await response.json();
            if (data.success && data.data) {
                const arrivals = data.data.slice(0, 10); // Last 10 arrivals
                setRecentArrivals(arrivals);
            }
        } catch (error) {
            console.error('Error fetching recent arrivals:', error);
        } finally {
            setIsLoadingRecents(false);
        }
    };

    // Load stats on mount and set up auto-refresh
    useEffect(() => {
        // Fetch immediately on mount
        fetchTodayStats();
        fetchRecentArrivals();
        
        // Refresh every 30 seconds to reduce browser load
        const statsInterval = setInterval(() => {
            fetchTodayStats();
            fetchRecentArrivals();
        }, 30000);

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
                        {/* Debug Panel - Only show in development */}
                        <div className="bg-gray-900 text-green-400 rounded-lg border border-gray-700 p-4 font-mono text-xs overflow-auto max-h-64">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <strong className="text-white">🔍 Debug Console</strong>
                                    <span className="ml-3 text-yellow-400 font-semibold">
                                        Scanned Today: {scannedQRCodes.size}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setDebugInfo('')}
                                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                                    >
                                        Clear Log
                                    </button>
                                    {scannedQRCodes.size > 0 && (
                                        <button 
                                            onClick={handleClearScannedCodes}
                                            className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
                                            title="Reset the scanned QR codes list (admin only)"
                                        >
                                            Reset Codes
                                        </button>
                                    )}
                                </div>
                            </div>
                            {scannedQRCodes.size > 0 && (
                                <div className="mb-2 p-2 bg-gray-800 rounded border border-green-600">
                                    <strong className="text-white">✅ Scanned Codes:</strong>
                                    <div className="mt-1 text-cyan-400">
                                        {Array.from(scannedQRCodes).map((code, idx) => (
                                            <div key={idx}>• {code}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <pre className="whitespace-pre-wrap break-all">
                                {debugInfo || 'Waiting for actions... Click "Start Camera Scanner" to begin'}
                            </pre>
                        </div>

                        {/* Camera Feed - Enhanced UI */}
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Camera className="h-5 w-5 text-blue-500" />
                                Camera Scanner
                            </h2>

                            {/* Scanner Container */}
                            <div className="relative w-full mx-auto" style={{ aspectRatio: '4/5', maxWidth: '500px' }}>
                                {/* Video Element - Background */}
                                <video
                                    ref={videoRef}
                                    style={{ 
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#000',
                                    }}
                                    className={`absolute inset-0 transition-all duration-500 ${
                                        isCameraActive ? 'ring-2 ring-green-500' : 'ring-2 ring-gray-400'
                                    }`}
                                    playsInline
                                    muted
                                    autoPlay
                                    controls={false}
                                />

                                {/* Overlay - Darkened Background */}
                                {isCameraActive && (
                                    <div 
                                        className="absolute inset-0 rounded-lg"
                                        style={{
                                            background: `
                                                linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)
                                            `,
                                            pointerEvents: 'none',
                                        }}
                                    />
                                )}

                                {/* Scanning Frame Container */}
                                {isCameraActive && (
                                    <div className="absolute inset-0 rounded-lg flex items-center justify-center overflow-hidden">
                                        {/* Centered Square Frame */}
                                        <div 
                                            className="relative"
                                            style={{
                                                width: '70%',
                                                aspectRatio: '1',
                                                maxWidth: '280px',
                                                maxHeight: '280px',
                                            }}
                                        >
                                            {/* Corner Guides - Top Left */}
                                            <div className="absolute top-0 left-0 w-8 h-8">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-300 rounded-full" />
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-300 rounded-full" />
                                            </div>

                                            {/* Corner Guides - Top Right */}
                                            <div className="absolute top-0 right-0 w-8 h-8">
                                                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-green-400 to-green-300 rounded-full" />
                                                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-300 rounded-full" />
                                            </div>

                                            {/* Corner Guides - Bottom Left */}
                                            <div className="absolute bottom-0 left-0 w-8 h-8">
                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-300 rounded-full" />
                                                <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-green-400 to-green-300 rounded-full" />
                                            </div>

                                            {/* Corner Guides - Bottom Right */}
                                            <div className="absolute bottom-0 right-0 w-8 h-8">
                                                <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-green-400 to-green-300 rounded-full" />
                                                <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-green-400 to-green-300 rounded-full" />
                                            </div>

                                            {/* Scanning Line - Horizontal */}
                                            <style>
                                                {`
                                                    @keyframes scanLine {
                                                        0% { top: 0%; }
                                                        50% { top: 100%; }
                                                        100% { top: 0%; }
                                                    }

                                                    @keyframes dotBlink1 {
                                                        0%, 20% { opacity: 0.3; }
                                                        40%, 100% { opacity: 1; }
                                                    }

                                                    @keyframes dotBlink2 {
                                                        0%, 40% { opacity: 0.3; }
                                                        60%, 100% { opacity: 1; }
                                                    }

                                                    @keyframes dotBlink3 {
                                                        0%, 60% { opacity: 0.3; }
                                                        80%, 100% { opacity: 1; }
                                                    }

                                                    .scan-line {
                                                        animation: scanLine 2s ease-in-out infinite;
                                                    }

                                                    .dot-1 {
                                                        animation: dotBlink1 1.4s ease-in-out infinite;
                                                    }

                                                    .dot-2 {
                                                        animation: dotBlink2 1.4s ease-in-out infinite;
                                                    }

                                                    .dot-3 {
                                                        animation: dotBlink3 1.4s ease-in-out infinite;
                                                    }
                                                `}
                                            </style>
                                            <div 
                                                className="scan-line absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full"
                                                style={{
                                                    boxShadow: '0 0 10px rgba(74, 222, 128, 0.8)',
                                                }}
                                            />

                                            {/* Loading Dots - Bottom Center */}
                                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2">
                                                <div 
                                                    className="dot-1 w-2 h-2 rounded-full bg-green-400"
                                                    style={{ boxShadow: '0 0 6px rgba(74, 222, 128, 0.8)' }}
                                                />
                                                <div 
                                                    className="dot-2 w-2 h-2 rounded-full bg-green-400"
                                                    style={{ boxShadow: '0 0 6px rgba(74, 222, 128, 0.8)' }}
                                                />
                                                <div 
                                                    className="dot-3 w-2 h-2 rounded-full bg-green-400"
                                                    style={{ boxShadow: '0 0 6px rgba(74, 222, 128, 0.8)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ready to Scan Message */}
                                {!isCameraActive && (
                                    <div className="absolute inset-0 rounded-lg bg-black/30 dark:bg-black/50 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="mb-3">
                                                <QrCodeIcon className="h-12 w-12 text-white/60 mx-auto" />
                                            </div>
                                            <p className="text-white text-sm font-semibold">Start scanning to begin</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Message */}
                            {isCameraActive && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                                        📷 <strong>Position the QR code inside the frame</strong>
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">
                                        💡 Tip: Keep the code within the green guides. System is actively scanning...
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {isCameraActive ? (
                                <div className="space-y-4 mt-4">
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

                        {/* Scan Result - Success Display Inline */}
                        {scanResult === 'success' && (
                            <div className="rounded-lg border p-6 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
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

                {/* SUCCESS MODAL - Arrival Recorded */}
                {showSuccessModal && successAction === 'entry' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in">
                            {/* Header - Green Success */}
                            <div className="px-6 py-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b border-green-200 dark:border-green-800">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-200 dark:bg-green-900/60 animate-pulse">
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-2xl text-green-900 dark:text-green-200">✓ Arrival Recorded</p>
                                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">Guest successfully checked in</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body - Guest Details */}
                            <div className="px-6 py-6 space-y-4">
                                {/* Guest Name */}
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-2">Guest Name</p>
                                    <p className="text-lg font-bold text-green-900 dark:text-green-200">{successDetails?.guest_name || 'N/A'}</p>
                                </div>

                                {/* Arrival Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Arrival Time</p>
                                        </div>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{successDetails?.arrival_time || 'N/A'}</p>
                                    </div>

                                    {/* Entry Fee */}
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Fee Paid</p>
                                        </div>
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">₱{successDetails?.fee_paid || '0'}</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/40 rounded-lg py-3 border border-green-300 dark:border-green-700">
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-700 dark:text-green-300">Status: Arrived</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                                <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                                    🎯 Scan the same QR code again to record departure
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUCCESS MODAL - Exit Recorded */}
                {showSuccessModal && successAction === 'exit' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in">
                            {/* Header - Purple Success */}
                            <div className="px-6 py-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-b border-purple-200 dark:border-purple-800">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-200 dark:bg-purple-900/60 animate-pulse">
                                        <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-2xl text-purple-900 dark:text-purple-200">✓ Departure Recorded</p>
                                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Guest successfully checked out</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body - Guest Details */}
                            <div className="px-6 py-6 space-y-4">
                                {/* Guest Name */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2">Guest Name</p>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-200">{successDetails?.guest_name || 'N/A'}</p>
                                </div>

                                {/* Times */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Arrival</p>
                                        </div>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{successDetails?.arrival_time || 'N/A'}</p>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <StopCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Departure</p>
                                        </div>
                                        <p className="text-sm font-bold text-red-900 dark:text-red-200">{successDetails?.departure_time || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Visit Summary */}
                                <div className="flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg py-3 border border-purple-300 dark:border-purple-700">
                                    <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <span className="font-semibold text-purple-700 dark:text-purple-300">Visit Complete</span>
                                </div>
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    <p>Fee Paid: <span className="font-bold text-green-600 dark:text-green-400">₱{successDetails?.fee_paid || '0'}</span></p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                                <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                                    👋 Ready to scan the next QR code
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validation Modal - with Different Scenarios */}
                {showValidationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                            
                            {/* ARRIVAL DUPLICATE Modal */}
                            {validationType === 'arrival_duplicate' && (
                                <>
                                    <div className="px-6 py-5 border-b bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center justify-center h-11 w-11 rounded-full bg-amber-200 dark:bg-amber-900/60">
                                                    <AlertTriangle className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-amber-900 dark:text-amber-200">⚠️ Guest Already Arrived</p>
                                                <p className="text-sm text-amber-700 dark:text-amber-300">This guest has already checked in today</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 space-y-4">
                                        <div className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Guest Information:</p>
                                            {validationDetails?.guestName && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{validationDetails.guestName}</span>
                                                </div>
                                            )}
                                            {validationDetails?.arrivalTime && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Arrived at {validationDetails.arrivalTime}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">ℹ️ What does this mean?</p>
                                            <p className="text-sm text-blue-800 dark:text-blue-400">
                                                This QR code was already scanned for entry today. To record this guest's departure, scan their code again.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowValidationModal(false);
                                                setValidationType(null);
                                                handleClearScan();
                                            }}
                                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            Understand
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowValidationModal(false);
                                                setValidationType(null);
                                                handleClearScan();
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            Scan Next
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* DEPARTURE DUPLICATE Modal */}
                            {validationType === 'departure_duplicate' && (
                                <>
                                    <div className="px-6 py-5 border-b bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center justify-center h-11 w-11 rounded-full bg-purple-200 dark:bg-purple-900/60">
                                                    <StopCircle className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-purple-900 dark:text-purple-200">🚪 Guest Already Departed</p>
                                                <p className="text-sm text-purple-700 dark:text-purple-300">This guest has already checked out</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 space-y-4">
                                        <div className="bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Guest Information:</p>
                                            {validationDetails?.guestName && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{validationDetails.guestName}</span>
                                                </div>
                                            )}
                                            {validationDetails?.departureTime && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Departed at {validationDetails.departureTime}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-300 dark:border-green-700">
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">✓ Transaction Complete</p>
                                            <p className="text-sm text-green-800 dark:text-green-400">
                                                The guest's entry and exit have been recorded. Their visit is now closed.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowValidationModal(false);
                                                setValidationType(null);
                                                handleClearScan();
                                            }}
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            Done
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowValidationModal(false);
                                                setValidationType(null);
                                                handleClearScan();
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            Scan Next
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* GENERAL ERROR Modal */}
                            {validationType === 'error' && (
                                <>
                                    <div className="px-6 py-5 border-b bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center justify-center h-11 w-11 rounded-full bg-red-200 dark:bg-red-900/60">
                                                    <AlertCircle className="h-6 w-6 text-red-700 dark:text-red-300" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-red-900 dark:text-red-200">❌ Validation Error</p>
                                                <p className="text-sm text-red-700 dark:text-red-300">Unable to process this QR code</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 space-y-4">
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
                                            {validationDetails?.issues && (
                                                <div className="space-y-2">
                                                    {validationDetails.issues.map((issue: string, idx: number) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-red-800 dark:text-red-300">{issue}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Try this:</p>
                                            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                                <li>• Check if the QR code is valid and not damaged</li>
                                                <li>• Ensure good lighting for camera scanning</li>
                                                <li>• Try scanning again or use manual entry</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowValidationModal(false);
                                                setValidationType(null);
                                                handleClearScan();
                                            }}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowValidationModal(false);
                                                setValidationType(null);
                                                handleClearScan();
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}