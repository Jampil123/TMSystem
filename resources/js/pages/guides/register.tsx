import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    specialtyOptions: string[];
}

interface Certification {
    certification_name: string;
    issued_by: string;
    issued_date: string;
    expiry_date: string;
    certificate_file: File | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Guide Registration', href: '#' },
];

export default function GuideRegister({ specialtyOptions }: Props) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
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

    const handleSubmit = async (e: React.FormEvent) => {
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
        
        // Add basic fields
        formDataToSend.append('full_name', formData.full_name);
        formDataToSend.append('contact_number', formData.contact_number);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('id_type', formData.id_type);
        formDataToSend.append('id_number', formData.id_number);
        formDataToSend.append('years_of_experience', formData.years_of_experience.toString());

        // Add specialty areas
        formData.specialty_areas.forEach((specialty, index) => {
            formDataToSend.append(`specialty_areas[${index}]`, specialty);
        });

        // Add ID image
        if (formData.id_image) {
            formDataToSend.append('id_image', formData.id_image);
        }

        // Add certifications
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
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#E3EED4] dark:bg-[#0F2A1D]">
            <Head title="Guide Registration" />

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <a href="/" className="flex items-center gap-2 text-[#375534] dark:text-[#E3EED4] hover:opacity-75 mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </a>
                    <h1 className="text-4xl font-bold text-[#375534] dark:text-[#E3EED4]">
                        Guide Registration
                    </h1>
                    <p className="text-[#6B8071] dark:text-[#AEC3B0] mt-2">
                        Register as a guide and start offering guided tours and activities
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Error Message */}
                    {generalError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-800 dark:text-red-300 text-sm">{generalError}</p>
                        </div>
                    )}

                    {/* Personal Details Section */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                            Personal Details
                        </h2>

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
                                {errors.full_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                                )}
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
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
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
                                {errors.contact_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    ID Type *
                                </label>
                                <select
                                    name="id_type"
                                    value={formData.id_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#375534] bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                >
                                    <option>National ID</option>
                                    <option>Passport</option>
                                    <option>Driver's License</option>
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
                                {errors.id_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.id_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    ID Image
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg cursor-pointer hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors">
                                    <Upload className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                                    <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                        {formData.id_image?.name || 'Click to upload'}
                                    </span>
                                    <input
                                        type="file"
                                        name="id_image"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details Section */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                            Professional Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    Years of Experience *
                                </label>
                                <input
                                    type="number"
                                    name="years_of_experience"
                                    value={formData.years_of_experience}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="70"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.years_of_experience
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:ring-[#375534]'
                                    } bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]`}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                                Specialty Areas * (Select at least one)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {specialtyOptions.map((specialty) => (
                                    <label
                                        key={specialty}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 cursor-pointer hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.specialty_areas.includes(specialty)}
                                            onChange={() => handleSpecialtyToggle(specialty)}
                                            className="w-4 h-4 accent-[#375534]"
                                        />
                                        <span className="text-sm text-[#0F2A1D] dark:text-[#E3EED4]">
                                            {specialty}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.specialty_areas && (
                                <p className="text-red-500 text-sm mt-2">{errors.specialty_areas}</p>
                            )}
                        </div>
                    </div>

                    {/* Certifications Section */}
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">
                                Certifications & Trainings
                            </h2>
                            <button
                                type="button"
                                onClick={addCertification}
                                className="flex items-center gap-2 px-4 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Certification
                            </button>
                        </div>

                        <div className="space-y-6">
                            {certifications.length > 0 ? (
                                certifications.map((cert, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-[#0F2A1D] dark:text-[#E3EED4]">
                                                Certification {index + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => removeCertification(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                    Certification Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cert.certification_name}
                                                    onChange={(e) =>
                                                        handleCertificationChange(index, 'certification_name', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#375534] bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                    Issued By
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cert.issued_by}
                                                    onChange={(e) =>
                                                        handleCertificationChange(index, 'issued_by', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#375534] bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                    Issued Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={cert.issued_date}
                                                    onChange={(e) =>
                                                        handleCertificationChange(index, 'issued_date', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#375534] bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                    Expiry Date (Optional)
                                                </label>
                                                <input
                                                    type="date"
                                                    value={cert.expiry_date}
                                                    onChange={(e) =>
                                                        handleCertificationChange(index, 'expiry_date', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#375534] bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                                    Certificate File
                                                </label>
                                                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg cursor-pointer hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors">
                                                    <Upload className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                                                    <span className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                                                        {cert.certificate_file?.name || 'Click to upload'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleCertificationFileChange(index, e)}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] p-4 border border-dashed border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-center">
                                    No certifications added yet. Click "Add Certification" to add your qualifications.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <a
                            href="/"
                            className="flex-1 px-6 py-3 border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg text-[#0F2A1D] dark:text-[#E3EED4] hover:bg-[#F8FAFB] dark:hover:bg-[#1a3a2e] transition-colors text-center font-medium"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
