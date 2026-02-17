import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PortalHeader from '@/components/portal-header';
import { AlertCircle, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data, setData, post, errors, reset } = useForm<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        post('/portal/contact', {
            onSuccess: () => {
                setSubmitted(true);
                reset();
                setLoading(false);
                setTimeout(() => setSubmitted(false), 5000);
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    return (
        <>
            <Head title="Contact Us" />
            <PortalHeader />

            <main className="min-h-screen bg-gradient-to-br from-[#E3EED4] via-[#AEC3B0] to-[#6B8071] dark:from-[#0F2A1D] dark:via-[#1F3A2F] dark:to-[#375534]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-[#6B8071] dark:text-[#AEC3B0]">
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                        {/* Contact Information Cards */}
                        <div className="bg-white dark:bg-[#1F3A2F] rounded-lg p-8 shadow-lg border-2 border-[#AEC3B0] dark:border-[#375534] hover:shadow-xl hover:border-[#6B8071] dark:hover:border-[#AEC3B0] transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Phone
                                </h3>
                            </div>
                            <p className="text-[#0F2A1D] dark:text-[#E3EED4] font-semibold">
                                +63 (2) 1234-5678
                            </p>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-2">
                                Monday to Friday, 9AM - 6PM
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#1F3A2F] rounded-lg p-8 shadow-lg border-2 border-[#AEC3B0] dark:border-[#375534] hover:shadow-xl hover:border-[#6B8071] dark:hover:border-[#AEC3B0] transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Email
                                </h3>
                            </div>
                            <p className="text-[#0F2A1D] dark:text-[#E3EED4] font-semibold">
                                support@badian.com
                            </p>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-2">
                                We'll respond within 24 hours
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#1F3A2F] rounded-lg p-8 shadow-lg border-2 border-[#AEC3B0] dark:border-[#375534] hover:shadow-xl hover:border-[#6B8071] dark:hover:border-[#AEC3B0] transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                    Location
                                </h3>
                            </div>
                            <p className="text-[#0F2A1D] dark:text-[#E3EED4] font-semibold">
                                Badian, Cebu
                            </p>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-2">
                                Philippines
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-[#1F3A2F] rounded-lg shadow-2xl border-2 border-[#AEC3B0] dark:border-[#375534] p-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-6">
                            Send us a Message
                        </h2>

                        {submitted && (
                            <div className="mb-6 p-4 bg-[#E3EED4] dark:bg-[#375534]/30 border-2 border-[#6B8071] dark:border-[#6B8071] rounded-lg flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                                        Message sent successfully!
                                    </h3>
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mt-1">
                                        Thank you for contacting us. We'll get back to you shortly.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-2 rounded-lg border-2 ${
                                            errors.name
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                : 'border-[#AEC3B0] dark:border-[#375534]'
                                        } bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-[#375534] dark:focus:ring-[#AEC3B0] dark:focus:border-[#AEC3B0] transition`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="john@example.com"
                                        className={`w-full px-4 py-2 rounded-lg border-2 ${
                                            errors.email
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                : 'border-[#AEC3B0] dark:border-[#375534]'
                                        } bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-[#375534] dark:focus:ring-[#AEC3B0] dark:focus:border-[#AEC3B0] transition`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+63 123-456-7890"
                                    className={`w-full px-4 py-2 rounded-lg border-2 ${
                                        errors.phone
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-[#AEC3B0] dark:border-[#375534]'
                                    } bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-[#375534] dark:focus:ring-[#AEC3B0] dark:focus:border-[#AEC3B0] transition`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Subject Field */}
                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="How can we help?"
                                    className={`w-full px-4 py-2 rounded-lg border-2 ${
                                        errors.subject
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-[#AEC3B0] dark:border-[#375534]'
                                    } bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-[#375534] dark:focus:ring-[#AEC3B0] dark:focus:border-[#AEC3B0] transition`}
                                />
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.subject}
                                    </p>
                                )}
                            </div>

                            {/* Message Field */}
                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4] mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tell us more about your inquiry..."
                                    rows={6}
                                    className={`w-full px-4 py-2 rounded-lg border-2 ${
                                        errors.message
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-[#AEC3B0] dark:border-[#375534]'
                                    } bg-white dark:bg-[#0F2A1D] text-[#0F2A1D] dark:text-[#E3EED4] placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#375534] focus:border-[#375534] dark:focus:ring-[#AEC3B0] dark:focus:border-[#AEC3B0] transition resize-none`}
                                />
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-[#0F2A1D] to-[#375534] hover:from-[#375534] hover:to-[#6B8071] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
