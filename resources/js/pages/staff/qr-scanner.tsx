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

    // Debug function to add debug info
    const addDebugInfo = (message: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString();
        const logLine = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data, null, 2) : ''}`;
        console.log(logLine);
        setDebugInfo(prev => prev + '\n' + logLine);
    };

    // Test camera function
    const testCameraAccess = async () => {
        addDebugInfo('=== TESTING CAMERA ACCESS ===');
        
        try {
            // Check if mediaDevices API exists
            if (!navigator.mediaDevices) {
                addDebugInfo('❌ navigator.mediaDevices is not available');
                return false;
            }
            
            if (!navigator.mediaDevices.enumerateDevices) {
                addDebugInfo('❌ enumerateDevices is not available');
                return false;
            }
            
            // Get all devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            addDebugInfo('✓ enumerateDevices success', devices.length + ' devices found');
            
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            addDebugInfo('Video devices found:', videoDevices.length);
            
            videoDevices.forEach((device, index) => {
                addDebugInfo(`  Camera ${index + 1}: ${device.label || 'No label'} (ID: ${device.deviceId.substring(0, 20)}...)`);
            });
            
            if (videoDevices.length === 0) {
                addDebugInfo('❌ No video devices found!');
                return false;
            }
            
            // Try to access camera
            addDebugInfo('Attempting to access camera...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: { ideal: 'environment' }
                } 
            });
            
            addDebugInfo('✓ Camera access granted!');
            const videoTrack = stream.getVideoTracks()[0];
            addDebugInfo('Video track info:', {
                label: videoTrack.label,
                settings: videoTrack.getSettings(),
                readyState: videoTrack.readyState
            });
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            addDebugInfo('✓ Test stream stopped');
            
            return true;
            
        } catch (error: any) {
            addDebugInfo('❌ Camera test failed:', {
                name: error.name,
                message: error.message,
                constraint: error.constraint
            });
            return false;
        }
    };

    // Start Camera Scanner with full debug
    const startScanner = async () => {
        addDebugInfo('=== STARTING SCANNER ===');
        addDebugInfo('Browser info:', navigator.userAgent);
        addDebugInfo('HTTPS:', window.location.protocol === 'https:');
        
        try {
            // Run camera test first
            const cameraAccessible = await testCameraAccess();
            if (!cameraAccessible) {
                throw new Error('Camera test failed. Please check permissions.');
            }
            
            // Set camera active
            setIsCameraActive(true);
            setCameraError('');
            addDebugInfo('Camera active state set to true');
            
            // Wait for DOM
            await new Promise(resolve => setTimeout(resolve, 500));
            addDebugInfo('✓ DOM delay complete');
            
            // Check video element
            if (!videoRef.current) {
                throw new Error('Video element reference is null');
            }
            addDebugInfo('✓ Video element found', {
                id: videoRef.current.id,
                tagName: videoRef.current.tagName,
                readyState: videoRef.current.readyState
            });
            
            // Create scanner
            addDebugInfo('Creating QrScanner instance...');
            let scanCount = 0;
            let lastDetectedCode: string | null = null;
            
            const scanner = new QrScanner(
                videoRef.current,
                (result: any) => {
                    scanCount++;
                    addDebugInfo('─────────────────────────────────────────');
                    addDebugInfo(`📱 Scan Attempt #${scanCount}:`);
                    addDebugInfo('─────────────────────────────────────────');
                    addDebugInfo('Result object:', {
                        hasData: !!result?.data,
                        dataType: typeof result?.data,
                        dataLength: result?.data?.length || 0,
                    });
                    
                    if (result && result.data) {
                        const detectedCode = result.data.trim();
                        
                        // Check for duplicate scans
                        if (lastDetectedCode === detectedCode) {
                            addDebugInfo('⚠️ Duplicate scan detected - skipping to prevent double processing');
                            return;
                        }
                        
                        lastDetectedCode = detectedCode;
                        addDebugInfo('Detected QR Code:', detectedCode);
                        addDebugInfo('Code length:', detectedCode.length);
                        addDebugInfo('Calling handleScanResult...');
                        
                        // Disable scanner briefly to prevent duplicate processing
                        scanner.stop();
                        addDebugInfo('Scanner paused to process scan');
                        
                        handleScanResult(detectedCode).finally(() => {
                            // Resume scanner after processing
                            scanner.start();
                            addDebugInfo('Scanner resumed after processing');
                            lastDetectedCode = null; // Reset last code
                        });
                    } else {
                        addDebugInfo('⚠️ Scan result missing data property');
                        addDebugInfo('Result keys:', result ? Object.keys(result) : 'null');
                    }
                    addDebugInfo('─────────────────────────────────────────');
                },
                {
                    onDecodeError: (error: any) => {
                        // Only log significant errors, not "No QR code found"
                        if (error && error.message && !error.message.includes('No QR code found')) {
                            addDebugInfo('⚠️ Decode error (non-critical):', {
                                name: error.name,
                                message: error.message,
                            });
                        }
                    },
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5,
                    highlightCodeOutline: true,
                    returnDetailedScanResult: true,
                }
            );
            
            scannerRef.current = scanner;
            addDebugInfo('✓ QrScanner instance created');
            
            // Start scanner
            addDebugInfo('Starting scanner...');
            await scanner.start();
            addDebugInfo('✅ Scanner started successfully!');
            
            // Check if video is actually playing
            setTimeout(() => {
                if (videoRef.current) {
                    addDebugInfo('Video element status:', {
                        readyState: videoRef.current.readyState,
                        videoWidth: videoRef.current.videoWidth,
                        videoHeight: videoRef.current.videoHeight,
                        paused: videoRef.current.paused
                    });
                    
                    if (videoRef.current.videoWidth === 0) {
                        addDebugInfo('⚠️ Warning: Video dimensions are 0 - camera may not be streaming');
                    } else {
                        addDebugInfo('✅ Video is playing correctly');
                    }
                }
            }, 1000);
            
            // Monitor scanner state
            let frameCount = 0;
            const monitorInterval = setInterval(() => {
                frameCount++;
                if (frameCount % 30 === 0) { // Log every ~30 seconds
                    addDebugInfo(`Scanner still active (${frameCount/2} seconds)`);
                }
            }, 1000);
            
            // Store interval to clear later
            (scanner as any).monitorInterval = monitorInterval;
            
        } catch (error: any) {
            addDebugInfo('❌ ERROR starting scanner:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
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
                    if ((scannerRef.current as any).monitorInterval) {
                        clearInterval((scannerRef.current as any).monitorInterval);
                    }
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
                scannerRef.current = null;
            }
        }
    };

    // Stop Camera Scanner
    const stopScanner = () => {
        addDebugInfo('Stopping scanner...');
        if (scannerRef.current) {
            try {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                if ((scannerRef.current as any).monitorInterval) {
                    clearInterval((scannerRef.current as any).monitorInterval);
                }
            } catch (e) {
                console.error('Stop error:', e);
            }
            scannerRef.current = null;
            setIsCameraActive(false);
            addDebugInfo('✅ Scanner stopped');
        }
    };

    // Handle scan result
    const handleScanResult = async (code: string) => {
        const cleanCode = code.trim();
        addDebugInfo('═══════════════════════════════════════════');
        addDebugInfo('▶ PROCESSING QR CODE SCAN');
        addDebugInfo('═══════════════════════════════════════════');
        addDebugInfo('QR Code detected:', cleanCode);
        addDebugInfo('Code length:', cleanCode.length);
        addDebugInfo('Code type:', typeof cleanCode);
        
        // CHECK: Validate QR code is not already being processed
        addDebugInfo('Validation: Checking if code is already being processed...');
        if (processingCode === cleanCode) {
            addDebugInfo('⚠️ CODE ALREADY PROCESSING - Duplicate attempt blocked');
            setScanResult('error');
            setValidationDetails({ 
                allValid: false, 
                issues: ['This QR code is currently being processed. Please wait...'] 
            });
            setShowValidationModal(true);
            return;
        }
        setProcessingCode(cleanCode);
        
        // CHECK: Validate QR code has not been scanned before today
        addDebugInfo('Validation: Checking if code was already scanned today...');
        if (scannedQRCodes.has(cleanCode)) {
            addDebugInfo('❌ DUPLICATE QR CODE - Already scanned today!');
            addDebugInfo('Previously scanned codes:', Array.from(scannedQRCodes));
            
            setScanResult('error');
            setValidationDetails({ 
                allValid: false, 
                issues: [
                    '❌ This QR code has already been scanned today.',
                    'Each QR code can only be scanned once to prevent duplicate arrivals.',
                    'If this is a different guest group, please use a different QR code.'
                ] 
            });
            setShowValidationModal(true);
            setProcessingCode(null);
            return;
        }
        
        addDebugInfo('✓ Code is new - proceeding with processing');
        
        setScanResult(null);
        setValidationDetails(null);

        try {
            // Step 1: Validate input
            addDebugInfo('Step 1: Validating input...');
            if (!cleanCode || cleanCode.length === 0) {
                throw new Error('Empty QR code');
            }
            addDebugInfo('✓ Input validation passed');

            // Step 2: Get CSRF token
            addDebugInfo('Step 2: Getting CSRF token...');
            const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfTokenElement?.getAttribute('content');
            addDebugInfo('CSRF token found:', !!csrfToken);
            addDebugInfo('CSRF token preview:', csrfToken ? csrfToken.substring(0, 20) + '...' : 'NOT FOUND');
            
            // Step 3: Prepare request
            addDebugInfo('Step 3: Preparing API request...');
            const apiUrl = '/staff/api/qr-arrival';
            const requestHeaders = {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            };
            const requestBody = JSON.stringify({ qr_token: cleanCode });
            addDebugInfo('API URL:', apiUrl);
            addDebugInfo('Request headers:', requestHeaders);
            addDebugInfo('Request body:', requestBody);
            
            // Step 4: Send API request
            addDebugInfo('Step 4: Sending API request...');
            const startTime = performance.now();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: requestHeaders,
                body: requestBody,
            });
            const endTime = performance.now();
            addDebugInfo('Request completed in:', Math.round(endTime - startTime) + 'ms');
            
            // Step 5: Read response body (only once!)
            addDebugInfo('Step 5: Reading response body...');
            let responseBody: string;
            try {
                responseBody = await response.text();
                addDebugInfo('✓ Response body received (' + responseBody.length + ' chars)');
            } catch (readError: any) {
                addDebugInfo('✗ Error reading response body:', readError.message);
                throw new Error('Failed to read response: ' + readError.message);
            }
            
            // Step 6: Check response status
            addDebugInfo('Step 6: Checking response status...');
            addDebugInfo('Response status:', response.status);
            addDebugInfo('Response status text:', response.statusText);
            addDebugInfo('Response headers:', {
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
            });
            
            if (!response.ok) {
                addDebugInfo('⚠️ Response not OK (status ' + response.status + ')');
                addDebugInfo('Response body preview:', responseBody.substring(0, 300));
            }
            
            // Step 7: Parse JSON response
            addDebugInfo('Step 7: Parsing JSON response...');
            let data: any;
            try {
                data = JSON.parse(responseBody);
                addDebugInfo('✓ JSON parsed successfully');
                addDebugInfo('Response data:', data);
            } catch (parseError: any) {
                addDebugInfo('✗ JSON parse error:', parseError.message);
                addDebugInfo('Response body that failed to parse:', responseBody.substring(0, 500));
                throw new Error('Invalid JSON response from server: ' + parseError.message);
            }

            // Step 8: Process response
            addDebugInfo('Step 8: Processing API response...');
            if (data.success) {
                addDebugInfo('✅ SUCCESS - Arrival logged!');
                addDebugInfo('Scan data:', data.data);
                
                // ADD CODE TO SCANNED CODES SET
                addDebugInfo('Step 8.5: Recording QR code as scanned...');
                setScannedQRCodes(prev => new Set([...prev, cleanCode]));
                addDebugInfo('✓ QR code added to scanned list');
                addDebugInfo('Total scanned codes:', scannedQRCodes.size + 1);
                
                setScanResult('success');
                setScannedBooking(data.data);
                setValidationDetails({ allValid: true, issues: [] });
                
                addDebugInfo('Step 9: Updating statistics...');
                fetchTodayStats();
                fetchRecentArrivals();
                addDebugInfo('✓ Statistics fetch triggered');
                
                setTimeout(() => {
                    setScanResult(null);
                    setScannedBooking(null);
                    setValidationDetails(null);
                    setScanInput('');
                }, 3000);
            } else {
                addDebugInfo('✗ API returned success=false');
                addDebugInfo('Error code:', data.code);
                addDebugInfo('Error message:', data.message);
                
                setScanResult('error');
                setValidationDetails({ allValid: false, issues: [data.message] });
                setShowValidationModal(true);
            }
        } catch (error: any) {
            addDebugInfo('═══════════════════════════════════════════');
            addDebugInfo('❌ ERROR OCCURRED');
            addDebugInfo('═══════════════════════════════════════════');
            addDebugInfo('Error type:', error.name);
            addDebugInfo('Error message:', error.message);
            addDebugInfo('Error stack:', error.stack?.substring(0, 300));
            
            setScanResult('error');
            setValidationDetails({
                allValid: false,
                issues: [`Error: ${error.message || 'Unable to process QR code'}`],
            });
            setShowValidationModal(true);
        } finally {
            addDebugInfo('═══════════════════════════════════════════');
            addDebugInfo('◀ PROCESSING COMPLETE');
            addDebugInfo('═══════════════════════════════════════════');
            setProcessingCode(null);
        }
    };

    // Handle manual entry
    const handleManualScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addDebugInfo('');
            addDebugInfo('🖐️  MANUAL ENTRY INITIATED');
            addDebugInfo('Input field value:', scanInput);
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
        addDebugInfo('');
        addDebugInfo('🔄 CLEARING ALL SCANNED CODES');
        addDebugInfo('Previous count:', scannedQRCodes.size);
        setScannedQRCodes(new Set());
        addDebugInfo('✓ All scanned codes cleared - scanner reset');
        addDebugInfo('');
    };

    // Fetch today's stats
    const fetchTodayStats = async () => {
        setIsLoadingStats(true);
        try {
            const response = await fetch('/staff/api/arrival-stats');
            const data = await response.json();
            addDebugInfo('Stats API Response:', data);
            if (data.success && data.data) {
                setTodayStats(data.data);
            }
        } catch (error) {
            addDebugInfo('Error fetching stats:', (error as any).message);
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Fetch recent arrivals
    const fetchRecentArrivals = async () => {
        setIsLoadingRecents(true);
        try {
            const response = await fetch('/staff/api/recent-arrivals');
            const data = await response.json();
            addDebugInfo('Recent Arrivals API Response:', data);
            if (data.success && data.data) {
                setRecentArrivals(data.data);
            }
        } catch (error) {
            addDebugInfo('Error fetching recent arrivals:', (error as any).message);
            console.error('Error fetching recent arrivals:', error);
        } finally {
            setIsLoadingRecents(false);
        }
    };

    // Load stats on mount and set up auto-refresh
    useEffect(() => {
        // Fetch immediately on mount
        addDebugInfo('');
        addDebugInfo('🔄 Component mounted - fetching initial stats');
        fetchTodayStats();
        fetchRecentArrivals();
        
        // Refresh every 10 seconds (more responsive)
        const statsInterval = setInterval(() => {
            fetchTodayStats();
            fetchRecentArrivals();
        }, 10000);

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

                {/* Validation Error Modal */}
                {showValidationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                            {/* Modal Header */}
                            <div className={`px-6 py-4 border-b ${
                                validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned'))
                                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        {validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned')) ? (
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50">
                                                <QrCodeIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        ) : (
                                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        {validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned')) ? (
                                            <>
                                                <p className="font-bold text-lg text-orange-900 dark:text-orange-300">⚠️ QR Code Already Used</p>
                                                <p className="text-sm text-orange-700 dark:text-orange-400">This QR code has already been scanned today</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-lg text-red-900 dark:text-red-300">❌ Validation Error</p>
                                                <p className="text-sm text-red-700 dark:text-red-400">Please review the issue below</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-4 space-y-4">
                                {validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned')) ? (
                                    <>
                                        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border-l-4 border-orange-500">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Why does this happen?</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Each QR code can only be scanned once to prevent duplicate guest arrivals in the system and protect data integrity.
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 What should you do?</p>
                                            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                                                    <span>If this is the same group: The arrival is already logged</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                                                    <span>If this is a different group: Use their unique QR code</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                                                    <span>To reset codes: Click "Reset Codes" in debug console (admin only)</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Issues Found:</p>
                                        </div>
                                        {validationDetails?.issues && (
                                            <div className="space-y-2">
                                                {validationDetails.issues.map((issue: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-900 dark:text-white">{issue}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowValidationModal(false);
                                        handleClearScan();
                                    }}
                                    className={`flex-1 font-semibold py-2 px-4 rounded-lg transition text-sm ${
                                        validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned'))
                                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                            : 'bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white'
                                    }`}
                                >
                                    {validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned')) ? 'Dismiss' : 'Try Again'}
                                </button>
                                {validationDetails?.issues?.some((issue: string) => issue.includes('already been scanned')) && (
                                    <button
                                        onClick={() => {
                                            setShowValidationModal(false);
                                            handleClearScan();
                                            setScanInput('');
                                            // Focus input for next scan
                                            setTimeout(() => {
                                                (document.querySelector('[placeholder="Enter booking code (or press ENTER to scan)..."]') as HTMLInputElement)?.focus();
                                            }, 100);
                                        }}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                    >
                                        Scan Next QR
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}