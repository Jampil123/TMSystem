import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Users, Calendar, MapPin, QrCode, Eye, Download, Trash2, Info, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface QRCode {
    id: number;
    token: string;
    status: 'Unused' | 'Used' | 'Expired';
    expirationDate: string;
    usedAt: string | null;
}

interface GuestListDetails {
    id: number;
    serviceName: string;
    serviceType: string;
    totalGuests: number;
    localTourists: number;
    foreignTourists: number;
    guestNames: string[];
    visitDate: string;
    status: string;
    notes: string | null;
    createdAt: string;
}

interface QRStats {
    total: number;
    used: number;
    unused: number;
    expired: number;
}

interface Props {
    guestList: GuestListDetails;
    qrCodes: QRCode[];
    qrStats: QRStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Guest Submission', href: '/operator/guest-submission' },
    { title: 'Details', href: '#' },
];

export default function GuestSubmissionDetails({ guestList, qrCodes, qrStats }: Props) {
    const [showQRModal, setShowQRModal] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/operator/guest-submission/${guestList.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteConfirm(false);
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Used':
                return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700';
            case 'Unused':
                return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
            case 'Expired':
                return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Used':
                return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
            case 'Unused':
                return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
            case 'Expired':
                return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guest List Details" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/operator/guest-submission"
                            className="p-2 hover:bg-[#AEC3B0]/20 dark:hover:bg-[#375534]/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[#375534] dark:text-[#E3EED4]" />
                        </Link>
                        <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                            Guest List Details
                        </h1>
                    </div>
                    {guestList.status === 'Pending Entrance' && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Information */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Service Information
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    guestList.status === 'Completed' 
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : guestList.status === 'Pending Entrance'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                }`}>
                                    {guestList.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Service Name</p>
                                    <p className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        {guestList.serviceName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Service Type</p>
                                    <p className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        {guestList.serviceType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Visit Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                                        <p className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {guestList.visitDate}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Submitted On</p>
                                    <p className="text-sm text-[#0F2A1D] dark:text-[#E3EED4]">
                                        {guestList.createdAt}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Guest Information */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Guest Statistics
                            </h2>

                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Total Guests</p>
                                    <p className="text-3xl font-bold text-[#375534] dark:text-[#AEC3B0]">
                                        {guestList.totalGuests}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Local Tourists</p>
                                    <p className="text-3xl font-bold text-[#6B8071] dark:text-[#E3EED4]">
                                        {guestList.localTourists}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Foreign Tourists</p>
                                    <p className="text-3xl font-bold text-[#6B8071] dark:text-[#E3EED4]">
                                        {guestList.foreignTourists}
                                    </p>
                                </div>
                            </div>

                            {guestList.guestNames.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                        Guest Names
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {guestList.guestNames.map((name, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/20 dark:border-[#375534]/20 text-sm text-[#0F2A1D] dark:text-[#E3EED4]"
                                            >
                                                {index + 1}. {name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {guestList.notes && (
                            <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    Additional Notes
                                </h2>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{guestList.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* QR Codes Sidebar */}
                    <div className="space-y-6">
                        {/* QR Stats */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4 flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                QR Code Status
                            </h2>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFB] dark:bg-[#1a3a2e]">
                                    <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Total QR Codes</span>
                                    <span className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">{qrStats.total}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">Unused</span>
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">{qrStats.unused}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                                    <span className="text-sm text-green-700 dark:text-green-300">Used</span>
                                    <span className="font-semibold text-green-700 dark:text-green-300">{qrStats.used}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                                    <span className="text-sm text-red-700 dark:text-red-300">Expired</span>
                                    <span className="font-semibold text-red-700 dark:text-red-300">{qrStats.expired}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Codes List */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                QR Codes ({qrCodes.length})
                            </h2>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {qrCodes.map((qr, index) => (
                                    <div
                                        key={qr.id}
                                        className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(qr.status)}`}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {getStatusIcon(qr.status)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-mono text-[#0F2A1D] dark:text-[#E3EED4] truncate">
                                                    {qr.token.slice(0, 12)}...
                                                </p>
                                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                                                    {qr.status}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowQRModal(qr.token)}
                                            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-colors"
                                        >
                                            <Eye className="w-4 h-4 text-[#375534] dark:text-[#E3EED4]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Delete Guest List?
                            </h3>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-6">
                                This will permanently delete this guest list and all associated QR codes. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Code Modal */}
                {showQRModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                QR Code Details
                            </h3>
                            <div className="bg-[#F8FAFB] dark:bg-[#1a3a2e] p-4 rounded-lg mb-4">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(showQRModal)}`}
                                    alt="QR Code"
                                    className="w-full"
                                />
                            </div>
                            <p className="text-xs font-mono text-[#6B8071] dark:text-[#AEC3B0] break-all mb-6 p-3 bg-[#F8FAFB] dark:bg-[#1a3a2e] rounded-lg">
                                {showQRModal}
                            </p>
                            <button
                                onClick={() => setShowQRModal(null)}
                                className="w-full px-4 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
