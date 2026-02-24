import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { CheckCircle, Upload, AlertCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operator Dashboard', href: '/operator-dashboard' },
    { title: 'Profile', href: '/operator/profile' },
];

export default function OperatorProfile({ operator, profile, documents, flash }: any) {
    const [previewImage, setPreviewImage] = useState<string | null>(
        profile?.profile_picture ? `/storage/${profile.profile_picture}` : null
    );
    const [successMessage, setSuccessMessage] = useState<string | null>(flash?.success ?? null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        business_name: profile?.business_name ?? operator?.business_name ?? '',
        operator_type: profile?.operator_type ?? operator?.operator_type ?? '',
        description: profile?.description ?? '',
        years_of_operation: profile?.years_of_operation ?? '',
        contact_name: profile?.contact_name ?? operator?.name ?? '',
        email: operator?.email ?? '',
        phone: profile?.phone ?? operator?.phone ?? '',
        address: profile?.address ?? operator?.address ?? '',
        lgu_area: profile?.lgu_area ?? '',
        profile_picture: null as File | null,
    });

    useEffect(() => {
        if (recentlySuccessful) {
            setSuccessMessage('Profile updated successfully!');
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful]);

    const totalDocs = (documents && documents.length) ? documents.length : 5;
    const uploadedDocs = (documents && documents.filter((d: any) => d.file_path && d.file_path.trim() !== '').length) || 0;
    const percent = Math.round((uploadedDocs / totalDocs) * 100);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_picture', file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/operator/profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operator Profile" />

            <div className="p-6 bg-[#E3EED4] dark:bg-[#0F2A1D] h-full">
                <div className="max-w-8xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* sidebar */}
                        <aside className="w-full md:w-1/4 bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow p-6">
                            <div className="flex flex-col items-center">
                            <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-[#E3EED4] dark:bg-[#375534]/30 overflow-hidden mb-4 flex items-center justify-center">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center">
                                                <span className="text-4xl text-white font-bold">
                                                    {(data.contact_name || operator?.name || 'O').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-[#375534] text-white p-2 rounded-full cursor-pointer hover:bg-[#6B8071]">
                                        <Upload className="w-4 h-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                <h3 className="text-lg font-semibold text-[#375534] dark:text-white">
                                    {data.contact_name || 'Operator Name'}
                                </h3>
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                    {data.operator_type || 'Operator Type'}
                                </p>
                            </div>
                            <nav className="mt-6 space-y-2">
                                <a href="#" className="block px-4 py-2 rounded-lg bg-[#375534]/10 text-[#375534]">Personal Information</a>
                            </nav>
                        </aside>

                        {/* main form area */}
                        <main className="w-full md:w-3/4 space-y-6">
                            {/* success/error messages */}
                            {successMessage && (
                                <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p>{successMessage}</p>
                                </div>
                            )}
                            {Object.keys(errors).length > 0 && (
                                <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Validation errors:</p>
                                        <ul className="text-sm mt-1">
                                            {Object.entries(errors).map(([key, value]: any) => (
                                                <li key={key}>• {key}: {value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* header + status */}
                            <div className="flex items-center justify-between bg-[#375534] text-white p-4 rounded-lg">
                                <div>
                                    <h1 className="text-2xl font-semibold">Operator Profile</h1>
                                    <p className="text-sm text-gray-200">
                                        Update your business information and submit for LGU approval.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#375534] shadow">
                                    <CheckCircle className="w-5 h-5" /> {profile?.accreditation_status ?? 'Pending'}
                                </span>
                            </div>

                            {/* form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* form cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow p-6">
                                        <h2 className="text-lg font-semibold text-[#375534] mb-4">Business Information</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block font-medium">Business Name</label>
                                                <input
                                                    type="text"
                                                    value={data.business_name}
                                                    onChange={(e) => setData('business_name', e.target.value)}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.business_name && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block font-medium">Operator Type</label>
                                                <input
                                                    type="text"
                                                    value={data.operator_type}
                                                    onChange={(e) => setData('operator_type', e.target.value)}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.operator_type && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.operator_type}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block font-medium">Description<span className="text-xs text-gray-500"> (optional)</span></label>
                                                <textarea
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    rows={3}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                    placeholder="Write a brief business description"
                                                />
                                                {errors.description && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block font-medium">Years of Operation</label>
                                                <input
                                                    type="number"
                                                    value={data.years_of_operation}
                                                    onChange={(e) => setData('years_of_operation', parseInt(e.target.value) || 0)}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.years_of_operation && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.years_of_operation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow p-6">
                                        <h2 className="text-lg font-semibold text-[#375534] mb-4">Contact & Operator Details</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block font-medium">Contact Name</label>
                                                <input
                                                    type="text"
                                                    value={data.contact_name}
                                                    onChange={(e) => setData('contact_name', e.target.value)}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.contact_name && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block font-medium">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block font-medium">Phone</label>
                                                <input
                                                    type="text"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block font-medium">Office/Business Address</label>
                                                <textarea
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    rows={2}
                                                    className="mt-1 w-full p-2 border border-[#AEC3B0]/40 rounded focus:border-[#375534] focus:ring-[#375534]/50"
                                                />
                                                {errors.address && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* documents card */}
                                <div className="rounded-2xl bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow p-6">
                                    <h2 className="text-lg font-semibold text-[#375534] dark:text-[#E3EED4] mb-4">Required Documents</h2>
                                    
                                    {/* Progress bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-medium text-[#375534] dark:text-[#E3EED4]">
                                                Completion: {uploadedDocs} / {totalDocs}
                                            </p>
                                            <p className="text-sm font-medium text-[#375534] dark:text-[#E3EED4]">
                                                {percent}%
                                            </p>
                                        </div>
                                        <div className="h-2 bg-[#E3EED4] dark:bg-[#375534]/20 rounded-full">
                                            <div 
                                                className="h-2 bg-[#375534] rounded-full transition-all duration-300" 
                                                style={{ width: `${percent}%` }} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Document list */}
                                    <div className="space-y-2">
                                        {documents && documents.map((doc: any) => {
                                            const hasFile = doc.file_path && doc.file_path.trim() !== '';
                                            const status = (doc.status || (hasFile ? 'pending' : 'missing')) as 'approved' | 'pending' | 'rejected' | 'missing';
                                            const statusColors: Record<string, string> = {
                                                approved: 'bg-[#E3EED4] text-[#375534]',
                                                pending: 'bg-yellow-100 text-yellow-600',
                                                rejected: 'bg-red-100 text-red-600',
                                                missing: 'bg-gray-200 text-gray-600',
                                            };
                                            const statusIcons: Record<string, any> = {
                                                approved: CheckCircle,
                                                pending: AlertCircle,
                                                rejected: XCircle,
                                                missing: Info,
                                            };
                                            const statusLabels: Record<string, string> = {
                                                approved: 'Approved',
                                                pending: 'Pending Review',
                                                rejected: 'Rejected',
                                                missing: 'Missing',
                                            };
                                            
                                            const StatusIcon = statusIcons[status] || Info;
                                            const statusColor = statusColors[status] || statusColors.missing;
                                            const statusLabel = statusLabels[status];

                                            return (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-[#E3EED4]/20 dark:bg-[#375534]/10 rounded-lg">
                                                    <span className="text-sm font-medium text-[#375534] dark:text-[#E3EED4]">
                                                        {doc.name}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {uploadedDocs < totalDocs && (
                                        <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                                            ⚠️ {totalDocs - uploadedDocs} document(s) still need to be uploaded to complete your profile.
                                        </p>
                                    )}
                                    {uploadedDocs === totalDocs && (
                                        <p className="text-xs text-green-700 dark:text-green-300 mt-4 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                            ✓ All documents uploaded! Awaiting LGU approval.
                                        </p>
                                    )}
                                </div>

                                {/* action buttons */}
                                <div className="flex gap-4 justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#375534] hover:bg-[#6B8071] disabled:opacity-50 text-white px-6 py-2 rounded-lg shadow"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={uploadedDocs < totalDocs}
                                        className="bg-[#6B8071] hover:bg-[#375534] disabled:opacity-50 text-white px-6 py-2 rounded-lg shadow"
                                    >
                                        Submit for Review
                                    </button>
                                </div>
                            </form>
                        </main>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
function route(arg0: string): string {
    throw new Error('Function not implemented.');
}

