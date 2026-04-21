import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle, AlertCircle, XCircle, Info, ArrowLeft, Eye, Check, X, Loader, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const statusBadge = {
    approved: { label: 'Approved', color: 'bg-[#E3EED4] text-[#375534]', icon: CheckCircle },
    pending: { label: 'Pending Initial Review', color: 'bg-blue-100 text-blue-600', icon: AlertCircle },
    submitted_for_review: { label: 'Submitted for Review', color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
    suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-600', icon: AlertCircle },
    blocked: { label: 'Blocked', color: 'bg-red-200 text-red-700', icon: XCircle },
};

const docStatusBadge = {
    approved: { label: 'Approved', color: 'bg-[#E3EED4] text-[#375534]', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
    requires_update: { label: 'Needs Update', color: 'bg-orange-100 text-orange-600', icon: Info },
    missing: { label: 'Missing', color: 'bg-gray-200 text-gray-600', icon: Info },
};

interface Document {
    id: number;
    name: string;
    status: string;
    file_path: string | null;
    uploaded_date: string | null;
    expires_date: string | null;
    notes: string | null;
}

interface Operator {
    id: number;
    name: string;
    email: string;
    username: string;
    status: string;
    account_status_id: number;
    business_name: string;
    operator_type: string;
    description: string;
    years_of_operation: number | null;
    contact_name: string;
    phone: string;
    address: string;
    lgu_area: string;
    joinDate: string;
    documents_submitted_at: string | null;
}

interface PageProps {
    operator: Operator;
    documents: Document[];
    statuses: Record<string, string>;
}

export default function OperatorDetail({ operator, documents, statuses }: PageProps) {
    const { put, processing } = useForm();
    const { props } = usePage();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState<string | null>(null);

    useEffect(() => {
        const flash = props.flash as any;
        if (flash?.success) {
            setSuccessMessage(flash.success);
            if (flash.email_sent) {
                setEmailSent(true);
                setEmailRecipient(flash.email_recipient);
            }
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setEmailSent(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [props.flash]);

    const handleApproveDocument = (docId: number) => {
        if (confirm('Are you sure you want to approve this document?')) {
            put(`/operators/${operator.id}/documents/${docId}/approve`);
        }
    };

    const handleRejectDocument = (docId: number) => {
        if (confirm('Are you sure you want to reject this document?')) {
            put(`/operators/${operator.id}/documents/${docId}/reject`);
        }
    };

    const statusInfo = statusBadge[operator.status?.toLowerCase() as keyof typeof statusBadge] || statusBadge.pending;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/lgu-dot-dashboard' },
        { title: 'Operator Management', href: '/operators' },
        { title: operator.business_name, href: `/operators/${operator.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Operator - ${operator.business_name}`} />

            <div className="p-6 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <Link href="/operators" className="inline-flex items-center gap-2 text-[#375534] dark:text-[#E3EED4] hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Operators
                    </Link>
                </div>

                {/* Success Notifications */}
                {successMessage && (
                    <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 p-4">
                        <div className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-green-900 dark:text-green-100">{successMessage}</p>
                                {emailSent && emailRecipient && (
                                    <div className="mt-2 flex items-center gap-2 bg-white dark:bg-green-950/50 rounded-lg p-3">
                                        <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900 dark:text-green-100">✓ Approval email sent</p>
                                            <p className="text-xs text-green-700 dark:text-green-300">To: {emailRecipient}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Operator Info Card */}
                <div className="rounded-2xl bg-gradient-to-r from-[#0F2A1D] to-[#375534] p-8 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{operator.business_name}</h1>
                            <p className="text-[#E3EED4] mb-4">{operator.operator_type}</p>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                    <statusInfo.icon className="w-4 h-4" /> {statusInfo.label}
                                </span>
                                {operator.documents_submitted_at && (
                                    <span className="text-sm text-[#AEC3B0]">Submitted: {operator.documents_submitted_at}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Operator approval happens automatically when all documents are approved */}
                        </div>
                    </div>
                </div>

                {/* Operator Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Contact Information */}
                    <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Contact Information</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Contact Person</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{operator.contact_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Email</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{operator.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Phone</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{operator.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Address</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{operator.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Business Information</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Username</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4] font-medium">{operator.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Years of Operation</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{operator.years_of_operation ?? 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">LGU Area</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{operator.lgu_area}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Registered</p>
                                <p className="text-[#0F2A1D] dark:text-[#E3EED4]">{operator.joinDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {operator.description && (
                    <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Business Description</h2>
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">{operator.description}</p>
                    </div>
                )}

                {/* Document Submissions */}
                <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">Required Documents</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E3EED4] dark:bg-[#0F2A1D]/50 border-b border-[#AEC3B0]/20 dark:border-[#375534]/20">
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Document Name
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Uploaded Date
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Expires
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => {
                                    const docStatus = docStatusBadge[doc.status?.toLowerCase() as keyof typeof docStatusBadge] || docStatusBadge.missing;
                                    return (
                                        <tr
                                            key={doc.id}
                                            className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 hover:bg-[#E3EED4]/50 dark:hover:bg-[#375534]/20 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-[#0F2A1D] dark:text-[#E3EED4] font-medium">
                                                {doc.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${docStatus.color}`}>
                                                    <docStatus.icon className="w-3 h-3" /> {docStatus.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                                {doc.uploaded_date || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-[#6B8071] dark:text-[#AEC3B0]">
                                                {doc.expires_date || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {doc.file_path ? (
                                                        <a
                                                            href={`/storage/${doc.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#375534] text-white text-xs hover:bg-[#6B8071] transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" /> View
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Not uploaded</span>
                                                    )}
                                                    {doc.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveDocument(doc.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                            >
                                                                {processing ? (
                                                                    <>
                                                                        <Loader className="w-3 h-3 animate-spin" /> Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check className="w-3 h-3" /> Approve
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectDocument(doc.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                            >
                                                                {processing ? (
                                                                    <>
                                                                        <Loader className="w-3 h-3 animate-spin" /> Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <X className="w-3 h-3" /> Reject
                                                                    </>
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
