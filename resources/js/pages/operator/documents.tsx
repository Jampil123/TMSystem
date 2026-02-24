import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle, AlertCircle, XCircle, Info, Upload, X, Eye } from 'lucide-react';
import DynamicSpinner from '@/components/dynamic-spinner';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Documents', href: '/operator/documents' },
];

interface Document {
    id: number;
    name: string;
    file_path?: string;
    uploaded_date?: string;
    expires_date?: string;
    status: string;
    notes?: string;
}

const REQUIRED_DOCUMENTS = [
    'Business Permit',
    'Mayor\'s Permit',
    'Tourism Accreditation',
    'Insurance Certificate',
    'Valid ID',
];

interface UploadState {
    [key: number]: 'idle' | 'loading' | 'success' | 'error';
}

const statusBadge = {
    approved: { label: 'Approved', color: 'bg-[#E3EED4] text-[#375534]', icon: CheckCircle },
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
    requires_update: { label: 'Requires Update', color: 'bg-orange-100 text-orange-600', icon: Info },
    missing: { label: 'Missing', color: 'bg-gray-200 text-gray-600', icon: Info },
};

function DocumentCard({ doc, onUpload, onRemove, uploadState = 'idle', uploadError, isDeletingDoc }: { doc: Document; onUpload: (file: File, docId: number) => void; onRemove: (docId: number) => void; uploadState?: 'idle' | 'loading' | 'success' | 'error'; uploadError?: string; isDeletingDoc?: boolean }) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const reuploadInputRef = React.useRef<HTMLInputElement>(null);
    const status = statusBadge[doc.status as keyof typeof statusBadge] || statusBadge.missing;
    const isUploading = uploadState === 'loading';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file, doc.id);
        }
    };

    const handleViewDocument = () => {
        if (doc.file_path) {
            // Open document in new tab
            window.open(`/storage/${doc.file_path}`, '_blank');
        }
    };

    return (
        <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-[#375534] dark:text-[#E3EED4]">
                    {doc.name}
                </h3>
                {doc.uploaded_date && (
                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                        Uploaded {doc.uploaded_date}
                    </p>
                )}
                {doc.expires_date && (
                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">
                        Expires {doc.expires_date}
                    </p>
                )}
                {doc.notes && (
                    <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                        {doc.notes}
                    </p>
                )}
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    <status.icon className="w-4 h-4" /> {status.label}
                </span>
                <div className="flex gap-2 items-center">
                    {/* Delete button - show if document exists */}
                    {doc.file_path && (
                        <button onClick={() => onRemove(doc.id)} disabled={isUploading} className="text-red-600 dark:text-red-400 text-sm hover:underline disabled:opacity-50" title="Delete document">
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* If document is uploaded, show View and Upload buttons */}
                    {doc.file_path ? (
                        <>
                            <button
                                onClick={handleViewDocument}
                                disabled={isUploading}
                                className="text-[#375534] dark:text-[#AEC3B0] text-sm hover:underline disabled:opacity-50 flex items-center gap-1"
                                title="View document"
                            >
                                <Eye className="w-4 h-4" /> View
                            </button>
                            <button
                                onClick={() => reuploadInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[#375534] dark:text-[#AEC3B0] text-sm hover:underline disabled:opacity-50 flex items-center gap-1"
                                title="Upload new document"
                            >
                                <Upload className="w-4 h-4" /> Upload
                            </button>
                            <input ref={reuploadInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                        </>
                    ) : (
                        /* If document not uploaded, show Upload button */
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[#375534] dark:text-[#AEC3B0] text-sm hover:underline disabled:opacity-50 flex items-center gap-1"
                            >
                                <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                            <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function CompletionSummary({ documents }: { documents: Document[] }) {
    const total = REQUIRED_DOCUMENTS.length;
    const completed = documents.filter((d) => d.status !== 'missing').length;
    const missing = total - completed;
    const percent = Math.round((completed / total) * 100);
    return (
        <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow p-4 w-full max-w-xs">
            <p className="text-sm font-medium text-[#375534] dark:text-[#E3EED4]">Documents Completed: {completed} / {total}</p>
            <div className="h-2 bg-[#E3EED4] dark:bg-[#375534]/20 rounded-full mt-2">
                <div className="h-2 bg-[#375534] rounded-full" style={{ width: `${percent}%` }} />
            </div>
            {missing > 0 && (
                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-2">
                    {missing} required document{missing > 1 ? 's' : ''} missing.
                </p>
            )}
        </div>
    );
}

export default function OperatorDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploadStates, setUploadStates] = useState<UploadState>({});
    const [uploadErrors, setUploadErrors] = useState<{ [key: number]: string }>({});
    const [deletingDocs, setDeletingDocs] = useState<Set<number>>(new Set());
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch documents on component mount
        fetch('/operator/documents', {
            headers: {
                'Accept': 'application/json',
            }
        })
            .then((res) => {
                console.log('Fetch response status:', res.status);
                return res.json();
            })
            .then((data) => {
                console.log('Documents loaded:', data);
                console.log('Documents array:', data.documents);
                setDocuments(data.documents || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error loading documents:', err);
                setError('Failed to load documents: ' + err.message);
                setLoading(false);
            });
    }, []);

    const handleUpload = async (file: File, docId: number) => {
        setUploadStates((prev) => ({ ...prev, [docId]: 'loading' }));
        setUploadErrors((prev) => ({ ...prev, [docId]: '' }));
        setError('');
        setSuccess('');

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        console.log('CSRF Token:', csrfToken ? 'Present' : 'MISSING!');

        const formData = new FormData();
        formData.append('document_id', docId.toString());
        formData.append('file', file);
        formData.append('_token', csrfToken || '');

        try {
            console.log('Uploading file:', file.name, 'to document ID:', docId);
            const response = await fetch('/operator/documents/upload', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'same-origin',
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                setUploadStates((prev) => ({ ...prev, [docId]: 'success' }));
                setSuccess(data.message);
                setTimeout(() => {
                    setUploadStates((prev) => ({ ...prev, [docId]: 'idle' }));
                }, 2000);
                setDocuments((prev) =>
                    prev.map((doc) =>
                        doc.id === docId
                            ? {
                                ...doc,
                                file_path: data.document.file_path,
                                uploaded_date: data.document.uploaded_date,
                                status: data.document.status,
                            }
                            : doc
                    )
                );
            } else {
                const errorMsg = data.message || 'Upload failed';
                setUploadStates((prev) => ({ ...prev, [docId]: 'error' }));
                setUploadErrors((prev) => ({ ...prev, [docId]: errorMsg }));
                setError(errorMsg);
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            const errorMsg = err.message || 'Upload failed';
            setUploadStates((prev) => ({ ...prev, [docId]: 'error' }));
            setUploadErrors((prev) => ({ ...prev, [docId]: errorMsg }));
            setError(errorMsg);
        }
    };

    // Check if all required documents are uploaded
    const hasCompletedDocuments = () => {
        return documents.every((doc) => doc.file_path && doc.file_path.trim() !== '');
    };

    // Handle submit for review
    const handleSubmit = async () => {
        if (!hasCompletedDocuments()) {
            setError('Please upload all required documents before submitting for review.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        try {
            const response = await fetch('/operator/documents/submit', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(data.message || 'Documents submitted for review successfully!');
                setTimeout(() => {
                    window.location.href = '/operator-dashboard';
                }, 2000);
            } else {
                setError(data.message || 'Failed to submit documents for review.');
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit documents for review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (docId: number) => {
        if (!confirm('Are you sure you want to remove this document?')) return;

        setUploadStates((prev) => ({ ...prev, [docId]: 'loading' }));
        setDeletingDocs((prev) => new Set(prev).add(docId));
        setError('');
        setSuccess('');

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        try {
            const response = await fetch(`/operator/documents/${docId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUploadStates((prev) => ({ ...prev, [docId]: 'success' }));
                setSuccess(data.message);
                setTimeout(() => {
                    setUploadStates((prev) => ({ ...prev, [docId]: 'idle' }));
                    setDeletingDocs((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(docId);
                        return newSet;
                    });
                }, 2000);
                setDocuments((prev) =>
                    prev.map((doc) =>
                        doc.id === docId
                            ? {
                                ...doc,
                                file_path: undefined,
                                uploaded_date: undefined,
                                status: 'missing',
                            }
                            : doc
                    )
                );
            } else {
                const errorMsg = data.message || 'Removal failed';
                setUploadStates((prev) => ({ ...prev, [docId]: 'error' }));
                setDeletingDocs((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(docId);
                    return newSet;
                });
                setUploadErrors((prev) => ({ ...prev, [docId]: errorMsg }));
                setError(errorMsg);
            }
        } catch (err: any) {
            console.error('Error removing document:', err);
            const errorMsg = err.message || 'Removal failed';
            setUploadStates((prev) => ({ ...prev, [docId]: 'error' }));
            setUploadErrors((prev) => ({ ...prev, [docId]: errorMsg }));
            setDeletingDocs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(docId);
                return newSet;
            });
            setError(errorMsg);
        }
    };

    // Find the first document being uploaded or deleted for the overlay
    const processingDocId = Object.entries(uploadStates).find(([_, state]) => state !== 'idle')?.[0];
    const processingDoc = processingDocId ? documents.find(d => d.id === parseInt(processingDocId)) : null;
    const currentUploadState = processingDocId ? uploadStates[parseInt(processingDocId)] : 'idle';
    const isDeletingCurrentDoc = processingDocId ? deletingDocs.has(parseInt(processingDocId)) : false;
    const errorMessage = processingDocId ? (uploadErrors[parseInt(processingDocId)] || (isDeletingCurrentDoc ? 'Deletion failed' : 'Upload failed')) : 'Operation failed';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Documents" />

            {/* Centered Overlay Spinner */}
            {currentUploadState !== 'idle' && processingDoc && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 flex items-center justify-center">
                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
                        <DynamicSpinner
                            state={currentUploadState}
                            message={isDeletingCurrentDoc ? `Deleting ${processingDoc.name}...` : `Uploading ${processingDoc.name}...`}
                            successMessage={isDeletingCurrentDoc ? "Document deleted successfully!" : "Document uploaded successfully!"}
                            errorMessage={errorMessage}
                            size="md"
                        />
                    </div>
                </div>
            )}

            <div className="p-6 bg-[#E3EED4] dark:bg-[#0F2A1D] min-h-screen space-y-6">
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* header row with title/subtitle and status badge */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#375534] text-white p-4 rounded-lg">
                    <div>
                        <h1 className="text-2xl font-semibold">Documents</h1>
                        <p className="text-sm mt-1">Upload and manage your required business permits and certifications.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#375534]">
                            <CheckCircle className="w-5 h-5" /> Pending Review
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-[#6B8071] dark:text-[#AEC3B0]">Loading documents...</p>
                    </div>
                ) : (
                    <>
                        {/* completion summary card */}
                        <CompletionSummary documents={documents} />

                        {/* grid of document cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {documents.map((doc) => (
                                <DocumentCard 
                                    key={doc.id} 
                                    doc={doc} 
                                    onUpload={handleUpload} 
                                    onRemove={handleRemove} 
                                    uploadState={uploadStates[doc.id] || 'idle'}
                                    uploadError={uploadErrors[doc.id]}
                                    isDeletingDoc={deletingDocs.has(doc.id)}
                                />
                            ))}
                        </div>

                        {/* submit for review button */}
                        <div className="flex items-center justify-between">
                            <div>
                                {!hasCompletedDocuments() && (
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        ⓘ Complete all required documents to submit for review
                                    </p>
                                )}
                            </div>
                            <button 
                                onClick={handleSubmit}
                                className="bg-[#375534] hover:bg-[#6B8071] text-white px-6 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition" 
                                disabled={!hasCompletedDocuments() || Object.values(uploadStates).some(state => state === 'loading') || isSubmitting}
                                title={!hasCompletedDocuments() ? 'Please upload all required documents first' : ''}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
