import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { LogIn, QrCode, Check, X, AlertTriangle, Users, Clock, TrendingUp, Search, Filter, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'Arrival Logs', href: '/staff/arrivals' },
];

// Mock data - In real implementation, this comes from Laravel API
interface ArrivalLog {
    id: string;
    bookingCode: string;
    guestCount: number;
    guideName: string;
    arrivalTime: string;
    scannedTime: string;
    serviceType: string;
    guideVerified: boolean;
    qrValidated: boolean;
    status: 'verified' | 'pending' | 'rejected';
    notes?: string;
}

const mockArrivals: ArrivalLog[] = [
    {
        id: '1',
        bookingCode: 'BK-001-2026',
        guestCount: 8,
        guideName: 'Maria Garcia',
        arrivalTime: '09:00 AM',
        scannedTime: '09:02 AM',
        serviceType: 'Full Day Tour',
        guideVerified: true,
        qrValidated: true,
        status: 'verified',
    },
    {
        id: '2',
        bookingCode: 'BK-002-2026',
        guestCount: 12,
        guideName: 'Juan Santos',
        arrivalTime: '09:15 AM',
        scannedTime: '09:17 AM',
        serviceType: 'Full Day Tour',
        guideVerified: true,
        qrValidated: true,
        status: 'verified',
    },
    {
        id: '3',
        bookingCode: 'BK-003-2026',
        guestCount: 6,
        guideName: 'Ana Cruz',
        arrivalTime: '09:30 AM',
        scannedTime: '09:35 AM',
        serviceType: 'Half Day Tour',
        guideVerified: false,
        qrValidated: true,
        status: 'pending',
        notes: 'Awaiting guide verification',
    },
    {
        id: '4',
        bookingCode: 'BK-004-2026',
        guestCount: 10,
        guideName: 'Carlos Mendoza',
        arrivalTime: '09:45 AM',
        scannedTime: '10:05 AM',
        serviceType: 'Full Day Tour',
        guideVerified: false,
        qrValidated: false,
        status: 'rejected',
        notes: 'QR code invalid or expired',
    },
];

export default function Arrivals() {
    const maximumCapacity = 350;
    const [arrivals, setArrivals] = useState<ArrivalLog[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
    const [currentVisitors, setCurrentVisitors] = useState(36);
    const [loading, setLoading] = useState(true);

    // Fetch today's arrivals from API
    useEffect(() => {
        const fetchArrivals = async () => {
            try {
                console.log('Fetching today arrivals...');
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                console.log('CSRF Token present:', !!csrfToken);
                
                const response = await fetch('/staff/api/arrivals-today', {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                });
                
                console.log('Arrivals API response status:', response.status);
                
                const responseText = await response.text();
                console.log('Arrivals API response:', responseText);
                
                const data = JSON.parse(responseText);
                
                if (data.success) {
                    // Transform API data to match ArrivalLog interface
                    const transformedArrivals = data.data.map((arrival: any) => ({
                        id: String(arrival.id),
                        bookingCode: `BK-${arrival.guest_list_id}`,
                        guestCount: arrival.guest_count,
                        guideName: arrival.guide_name,
                        arrivalTime: arrival.arrival_time,
                        scannedTime: arrival.arrival_time,
                        serviceType: 'Service',
                        guideVerified: arrival.status === 'arrived',
                        qrValidated: true,
                        status: arrival.status === 'arrived' ? 'verified' : arrival.status === 'denied' ? 'rejected' : 'pending',
                    }));
                    setArrivals(transformedArrivals);
                }
            } catch (error) {
                console.error('Error fetching arrivals:', error);
                // Fall back to mock data if API fails
                setArrivals(mockArrivals);
            } finally {
                setLoading(false);
            }
        };

        fetchArrivals();
        // Refresh every 30 seconds
        const interval = setInterval(fetchArrivals, 30000);
        return () => clearInterval(interval);
    }, []);

    // Calculate metrics
    const totalArrivals = arrivals.length;
    const verifiedArrivals = arrivals.filter(a => a.status === 'verified').length;
    const pendingArrivals = arrivals.filter(a => a.status === 'pending').length;
    const rejectedArrivals = arrivals.filter(a => a.status === 'rejected').length;
    const totalGuests = arrivals.filter(a => a.status === 'verified').reduce((sum, a) => sum + a.guestCount, 0);
    const capacityPercentage = (currentVisitors / maximumCapacity) * 100;

    // Simulate real-time visitor updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVisitors(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                return Math.max(0, Math.min(maximumCapacity, prev + change));
            });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const getCapacityStatus = () => {
        if (capacityPercentage > 90) return { text: 'CRITICAL', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' };
        if (capacityPercentage > 70) return { text: 'WARNING', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
        return { text: 'SAFE', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' };
    };

    const handleAddArrival = (bookingCode: string) => {
        // Simulate QR scan validation and logging
        const newArrival: ArrivalLog = {
            id: String(arrivals.length + 1),
            bookingCode,
            guestCount: Math.floor(Math.random() * 15) + 4,
            guideName: 'New Guide',
            arrivalTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            scannedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            serviceType: 'Full Day Tour',
            guideVerified: false,
            qrValidated: true,
            status: 'pending',
        };
        setArrivals([newArrival, ...arrivals]);
    };

    const handleVerifyGuide = async (id: string) => {
        // In a real scenario, this would update the arrival status via API
        setArrivals(arrivals.map(arrival =>
            arrival.id === id
                ? { ...arrival, guideVerified: true, status: 'verified' }
                : arrival
        ));
    };

    const handleRejectArrival = async (id: string) => {
        // In a real scenario, this would update the arrival status via API
        setArrivals(arrivals.map(arrival =>
            arrival.id === id
                ? { ...arrival, status: 'rejected', notes: 'Rejected by staff' }
                : arrival
        ));
    };

    // Filter arrivals
    let filteredArrivals = arrivals.filter(arrival => {
        const matchesSearch = arrival.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            arrival.guideName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || arrival.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const capacityStatus = getCapacityStatus();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Arrival Logs" />
            <div className="space-y-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-8 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <LogIn className="w-8 h-8" />
                                <h1 className="text-3xl font-bold">Arrival Logging System</h1>
                            </div>
                            <p className="text-[#E3EED4]">Record and monitor guest arrivals in real-time</p>
                        </div>
                        <QrCode className="w-12 h-12 text-[#E3EED4]" />
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Total Arrivals */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Arrivals</p>
                            <LogIn className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{totalArrivals}</p>
                    </div>

                    {/* Verified */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                            <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">{verifiedArrivals}</p>
                    </div>

                    {/* Pending */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">{pendingArrivals}</p>
                    </div>

                    {/* Rejected */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                            <X className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-600">{rejectedArrivals}</p>
                    </div>

                    {/* Total Guests */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Guests</p>
                            <Users className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{totalGuests}</p>
                    </div>
                </div>

                {/* Capacity Status */}
                <div className={`rounded-lg p-6 border-2 ${capacityStatus.bgColor} border-${capacityStatus.color.split('-')[1]}-200`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${capacityStatus.textColor}`}>Current Capacity Status</p>
                            <div className="flex items-center gap-3 mt-2">
                                <p className={`text-2xl font-bold ${capacityStatus.textColor}`}>{currentVisitors} / {maximumCapacity}</p>
                                <Badge className={`${capacityStatus.color} text-white`}>{capacityStatus.text}</Badge>
                            </div>
                        </div>
                        <div className="w-32 h-32 relative">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={`${(capacityPercentage / 100) * 314} 314`}
                                    className={capacityStatus.textColor}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xl font-bold ${capacityStatus.textColor}`}>{Math.round(capacityPercentage)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrival Logs Table */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {/* Controls */}
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by booking code or guide name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Booking Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Guest Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Guide Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Service Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Arrival Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Scanned Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredArrivals.length > 0 ? (
                                    filteredArrivals.map((arrival) => (
                                        <tr key={arrival.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">{arrival.bookingCode}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {arrival.guestCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{arrival.guideName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{arrival.serviceType}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{arrival.arrivalTime}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{arrival.scannedTime}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {arrival.status === 'verified' && (
                                                    <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verified</Badge>
                                                )}
                                                {arrival.status === 'pending' && (
                                                    <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                                                )}
                                                {arrival.status === 'rejected' && (
                                                    <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                {arrival.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerifyGuide(arrival.id)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs font-medium"
                                                        >
                                                            Verify
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectArrival(arrival.id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {arrival.status === 'verified' && (
                                                    <span className="text-green-600 text-xs font-medium">✓ Processed</span>
                                                )}
                                                {arrival.status === 'rejected' && (
                                                    <span className="text-red-600 text-xs font-medium">✗ Blocked</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">No arrivals found</p>
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
