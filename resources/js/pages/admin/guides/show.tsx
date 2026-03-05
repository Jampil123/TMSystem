import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Download, AlertCircle, AlertTriangle, Check, X, Calendar } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Certification {
    id: number;
    certification_name: string;
    issued_by: string;
    issued_date: string;
    expiry_date: string | null;
    certificate_file_path: string | null;
    status: string;
    days_until_expiry: number | null;
}

interface Guide {
    id: number;
    full_name: string;
    email: string;
    contact_number: string;
    id_type: string;
    id_number: string;
    id_image_path: string | null;
    years_of_experience: number;
    specialty_areas: string[];
    status: string;
    rejection_reason: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    certifications: Certification[];
    has_expiring_certs: boolean;
    has_expired_certs: boolean;
}

interface Props {
    guide: Guide;
}

export default function GuideShow({ guide }: Props) {
    const [isApproving, setIsApproving] = useState(false);
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });
    const [isRejecting, setIsRejecting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Guide Management', href: '/guides' },
        { title: guide.full_name, href: '#' },
    ];

    const handleApprove = () => {
        setApproveModal(true);
    };

    const handleConfirmApprove = () => {
        setIsApproving(true);
        router.post(`/guides/${guide.id}/approve`, {}, {
            onFinish: () => {
                setIsApproving(false);
                setApproveModal(false);
            },
        });
    };

    const handleReject = () => {
        if (!rejectModal.reason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setIsRejecting(true);
        router.post(`/guides/${guide.id}/reject`, 
            { rejection_reason: rejectModal.reason },
            {
                onFinish: () => setIsRejecting(false),
            }
        );
    };

    const getCertificationStatusColor = (status: string) => {
        switch (status) {
            case 'Valid':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
            case 'Expiring Soon':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
            case 'Expired':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${guide.full_name} - Guide Details`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/guides"
                            className="p-2 hover:bg-[#AEC3B0]/20 dark:hover:bg-[#375534]/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[#375534] dark:text-[#E3EED4]" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                                {guide.full_name}
                            </h1>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                Registered {guide.created_at}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            guide.status === 'Approved'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : guide.status === 'Pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        }`}>
                            {guide.status}
                        </span>
                        {guide.has_expired_certs && (
                            <div title="Has expired certifications">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        )}
                        {guide.has_expiring_certs && (
                            <div title="Has expiring certifications">
                                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Personal Information
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Email</p>
                                        <p className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {guide.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Contact Number</p>
                                        <p className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {guide.contact_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40 pt-4">
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-2">ID Verification</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Type</p>
                                            <p className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {guide.id_type}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Number</p>
                                            <p className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {guide.id_number}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {guide.id_image_path && (
                                    <div className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40 pt-4">
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-2">ID Image</p>
                                        <img
                                            src={`/storage/${guide.id_image_path}`}
                                            alt="ID Image"
                                            className="max-w-xs rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Professional Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-2">Years of Experience</p>
                                    <p className="text-2xl font-bold text-[#375534] dark:text-[#AEC3B0]">
                                        {guide.years_of_experience} years
                                    </p>
                                </div>

                                <div className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40 pt-4">
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-3">Specialty Areas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {guide.specialty_areas?.map((specialty) => (
                                            <span
                                                key={specialty}
                                                className="px-3 py-1 bg-[#F8FAFB] dark:bg-[#1a3a2e] border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-full text-sm text-[#0F2A1D] dark:text-[#E3EED4]"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Certifications & Trainings
                            </h2>

                            {guide.certifications.length > 0 ? (
                                <div className="space-y-4">
                                    {guide.certifications.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {cert.certification_name}
                                                    </h3>
                                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                        Issued by {cert.issued_by}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCertificationStatusColor(cert.status)}`}>
                                                    {cert.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Issued Date</p>
                                                    <p className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                        {cert.issued_date}
                                                    </p>
                                                </div>
                                                {cert.expiry_date && (
                                                    <div>
                                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Expiry Date</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                                {cert.expiry_date}
                                                            </p>
                                                            {cert.days_until_expiry !== null && cert.days_until_expiry <= 30 && (
                                                                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {cert.certificate_file_path && (
                                                <a
                                                    href={`/storage/${cert.certificate_file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm text-[#375534] dark:text-[#AEC3B0] hover:underline"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    View Certificate
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                    No certifications submitted
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Review Status */}
                        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                            <h3 className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Review Status</h3>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Current Status</p>
                                    <p className="text-lg font-bold text-[#375534] dark:text-[#E3EED4]">
                                        {guide.status}
                                    </p>
                                </div>

                                {guide.reviewed_by && (
                                    <>
                                        <div className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40 pt-3">
                                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Reviewed By</p>
                                            <p className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {guide.reviewed_by}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mb-1">Reviewed At</p>
                                            <p className="text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                {guide.reviewed_at}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {guide.rejection_reason && (
                                    <div className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40 pt-3 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                                        <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">
                                            Rejection Reason
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-300">
                                            {guide.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {guide.status === 'Pending' && (
                            <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                                <h3 className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Actions</h3>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        <Check className="w-4 h-4" />
                                        {isApproving ? 'Approving...' : 'Approve Guide'}
                                    </button>

                                    <button
                                        onClick={() => setRejectModal({ show: true, reason: '' })}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Guide
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Approve Confirmation Modal */}
                {approveModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Approve Guide?
                                </h3>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-2">
                                    Are you sure you want to approve <strong>{guide.full_name}</strong> as a guide?
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setApproveModal(false)}
                                    disabled={isApproving}
                                    className="flex-1 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmApprove}
                                    disabled={isApproving}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isApproving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Approving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {rejectModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Reject Guide Application
                            </h3>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) =>
                                    setRejectModal({ ...rejectModal, reason: e.target.value })
                                }
                                placeholder="Please provide a reason for rejection..."
                                className="w-full px-4 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] mb-4 resize-none"
                                rows={4}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRejectModal({ show: false, reason: '' })}
                                    disabled={isRejecting}
                                    className="flex-1 px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isRejecting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Rejecting...
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-4 h-4" />
                                            Reject
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
