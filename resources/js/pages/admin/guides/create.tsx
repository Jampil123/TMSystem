import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Plus, Trash2, X as XIcon, CheckCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Certification {
    certification_name: string;
    issued_by: string;
    issued_date: string;
    expiry_date: string;
    certificate_file: File | null;
}

interface Props {
    specialtyOptions?: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guide Management', href: '/guides' },
    { title: 'Register Guide', href: '/guides/create' },
];

export default function GuideCreate({ specialtyOptions = [] }: Props) {
    const [formData, setFormData] = useState({
        full_name: '',
        contact_number: '',
        email: '',
        id_type: 'National ID',
        id_number: '',
        id_image: null as File | null,
        years_of_experience: 0,
        specialty_areas: [] as string[],
    });
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successGuideName, setSuccessGuideName] = useState('');

    // Auto-redirect after showing success modal
    React.useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                router.get('/guides');
            }, 2000); // Redirect after 2 seconds
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);

    const defaultSpecialties = specialtyOptions.length > 0 ? specialtyOptions : [
        'Canyoneering (Kawasan Falls)',
        'Waterfall Tours',
        'Kawasan Falls Guiding',
        'River Trekking',
        'Snorkeling Guide',
        'Sardine Run Tour',
        'Island Hopping',
        'Marine Conservation Guide',
        'Hiking',
        'Trekking Guide',
        'Eco-Tour Guide',
        'Nature Interpretation',
        'Cultural Tour Guide',
        'Local Community Guide',
        'Heritage Tour',
        'Transportation Service',
        'Tour Coordinator',
        'Equipment Handling',
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0],
            }));
        }
    };

    const handleSpecialtyToggle = (specialty: string) => {
        setFormData(prev => ({
            ...prev,
            specialty_areas: prev.specialty_areas.includes(specialty)
                ? prev.specialty_areas.filter(s => s !== specialty)
                : [...prev.specialty_areas, specialty],
        }));
    };

    const addCertification = () => {
        setCertifications(prev => [
            ...prev,
            {
                certification_name: '',
                issued_by: '',
                issued_date: '',
                expiry_date: '',
                certificate_file: null,
            },
        ]);
    };

    const removeCertification = (index: number) => {
        setCertifications(prev => prev.filter((_, i) => i !== index));
    };

    const handleCertificationChange = (
        index: number,
        field: keyof Certification,
        value: string | File | null
    ) => {
        setCertifications(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
    };

    const handleCertificationFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleCertificationChange(index, 'certificate_file', e.target.files[0]);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);
        setIsSubmitting(true);

        // Client-side validation
        const clientErrors: Record<string, string> = {};
        
        if (!formData.full_name.trim()) clientErrors.full_name = 'Full name is required';
        if (!formData.contact_number.trim()) clientErrors.contact_number = 'Contact number is required';
        if (!formData.email.trim()) clientErrors.email = 'Email is required';
        if (!formData.id_number.trim()) clientErrors.id_number = 'ID number is required';
        if (formData.specialty_areas.length === 0) clientErrors.specialty_areas = 'Please select at least one specialty';
        if (formData.years_of_experience < 0 || formData.years_of_experience > 70) {
            clientErrors.years_of_experience = 'Years of experience must be between 0 and 70';
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            setIsSubmitting(false);
            return;
        }

        const formDataToSend = new FormData();
        
        formDataToSend.append('full_name', formData.full_name);
        formDataToSend.append('contact_number', formData.contact_number);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('id_type', formData.id_type);
        formDataToSend.append('id_number', formData.id_number);
        formDataToSend.append('years_of_experience', formData.years_of_experience.toString());

        formData.specialty_areas.forEach((specialty, index) => {
            formDataToSend.append(`specialty_areas[${index}]`, specialty);
        });

        if (formData.id_image) {
            formDataToSend.append('id_image', formData.id_image);
        }

        certifications.forEach((cert, index) => {
            if (cert.certification_name) {
                formDataToSend.append(`certifications[${index}][certification_name]`, cert.certification_name);
                formDataToSend.append(`certifications[${index}][issued_by]`, cert.issued_by);
                formDataToSend.append(`certifications[${index}][issued_date]`, cert.issued_date);
                formDataToSend.append(`certifications[${index}][expiry_date]`, cert.expiry_date);
                if (cert.certificate_file) {
                    formDataToSend.append(`certifications[${index}][certificate_file]`, cert.certificate_file);
                }
            }
        });

        router.post('/guides/register', formDataToSend, {
            onError: (errors) => {
                // Handle field validation errors
                if (typeof errors === 'object' && errors !== null) {
                    setErrors(errors as Record<string, string>);
                } else {
                    setGeneralError('An error occurred while submitting the form. Please try again.');
                }
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setSuccessGuideName(formData.full_name);
                setShowSuccessModal(true);
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Guide" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/guides"
                        className="p-2 hover:bg-[#AEC3B0]/20 dark:hover:bg-[#375534]/20 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#375534] dark:text-[#E3EED4]" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                            Register New Guide
                        </h1>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                            Add a new guide to your management system
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-8">
                    <form onSubmit={handleRegisterSubmit} className="space-y-8">
                        {/* General Error Message */}
                        {generalError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-800 dark:text-red-300 text-sm">{generalError}</p>
                            </div>
                        )}

                        {/* Personal Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.full_name
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:ring-[#375534]'
                                        } bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]`}
                                    />
                                    {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.email
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:ring-[#375534]'
                                        } bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]`}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.contact_number
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:ring-[#375534]'
                                        } bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]`}
                                    />
                                    {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        ID Type *
                                    </label>
                                    <select
                                        name="id_type"
                                        value={formData.id_type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                    >
                                        <option>National ID</option>
                                        <option>Passport</option>
                                        <option>Driver License</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        ID Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="id_number"
                                        value={formData.id_number}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.id_number
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:ring-[#375534]'
                                        } bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]`}
                                    />
                                    {errors.id_number && <p className="text-red-500 text-sm mt-1">{errors.id_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        ID Image
                                    </label>
                                    <input
                                        type="file"
                                        name="id_image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                    />
                                    {formData.id_image && (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ {formData.id_image.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Professional Details
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Years of Experience *
                                    </label>
                                    <input
                                        type="number"
                                        name="years_of_experience"
                                        min="0"
                                        max="70"
                                        value={formData.years_of_experience}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.years_of_experience
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:ring-[#375534]'
                                        } bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]`}
                                    />
                                    {errors.years_of_experience && <p className="text-red-500 text-sm mt-1">{errors.years_of_experience}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                                        Specialty Areas *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {defaultSpecialties.map((specialty) => (
                                            <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.specialty_areas.includes(specialty)}
                                                    onChange={() => handleSpecialtyToggle(specialty)}
                                                    className="rounded accent-[#375534] dark:accent-[#AEC3B0]"
                                                />
                                                <span className="text-sm text-[#0F2A1D] dark:text-[#E3EED4]">{specialty}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.specialty_areas && <p className="text-red-500 text-sm mt-2">{errors.specialty_areas}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Certifications */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Certifications
                                </h3>
                                <button
                                    type="button"
                                    onClick={addCertification}
                                    className="flex items-center gap-2 px-3 py-1 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] text-sm transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Certification
                                </button>
                            </div>

                            <div className="space-y-4">
                                {certifications.map((cert, idx) => (
                                    <div key={idx} className="p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                Certification {idx + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeCertification(idx)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Certification Name"
                                                value={cert.certification_name}
                                                onChange={(e) => handleCertificationChange(idx, 'certification_name', e.target.value)}
                                                className="px-3 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Issued By"
                                                value={cert.issued_by}
                                                onChange={(e) => handleCertificationChange(idx, 'issued_by', e.target.value)}
                                                className="px-3 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                            />
                                            <input
                                                type="date"
                                                value={cert.issued_date}
                                                onChange={(e) => handleCertificationChange(idx, 'issued_date', e.target.value)}
                                                className="px-3 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                            />
                                            <input
                                                type="date"
                                                value={cert.expiry_date}
                                                onChange={(e) => handleCertificationChange(idx, 'expiry_date', e.target.value)}
                                                className="px-3 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534]"
                                            />
                                            <div className="md:col-span-2">
                                                <input
                                                    type="file"
                                                    accept="*"
                                                    onChange={(e) => handleCertificationFileChange(idx, e)}
                                                    className="px-3 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4] focus:outline-none focus:ring-2 focus:ring-[#375534] w-full"
                                                />
                                                {cert.certificate_file && (
                                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ {cert.certificate_file.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-[#AEC3B0]/40 dark:border-[#375534]/40">
                            <Link
                                href="/guides"
                                className="flex-1 px-6 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors font-medium text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isSubmitting ? 'Registering...' : 'Register Guide'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Success Modal - Floating Toast */}
                {showSuccessModal && (
                    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-3xl p-8 max-w-sm mx-auto w-full text-center shadow-2xl border border-gray-100 dark:border-[#375534]/20 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                            {/* Animated Checkmark */}
                            <div className="flex justify-center mb-5">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-pulse">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                Success!
                            </h3>
                            
                            <p className="text-[#6B8071] dark:text-[#AEC3B0] text-sm mb-4">
                                Guide has been successfully created.
                            </p>

                            <div className="flex items-center justify-center gap-2 text-[#375534] dark:text-[#AEC3B0] text-sm">
                                <div className="w-4 h-4 border-2 border-transparent border-t-[#375534] dark:border-t-[#AEC3B0] rounded-full animate-spin"></div>
                                <span>Redirecting...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
