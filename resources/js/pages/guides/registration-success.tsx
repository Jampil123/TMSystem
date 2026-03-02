import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Mail, Clock } from 'lucide-react';

interface Props {
    guide: {
        id: number;
        full_name: string;
        email: string;
        status: string;
    };
}

export default function RegistrationSuccess({ guide }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#1a3a2e] flex items-center justify-center p-6">
            <Head title="Registration Successful" />

            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4] mb-3">
                    Registration Submitted!
                </h1>

                <p className="text-[#6B8071] dark:text-[#AEC3B0] mb-6">
                    Thank you for registering, <span className="font-semibold">{guide.full_name}</span>. Your application has been received.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                                Application Status: <span className="text-yellow-600 dark:text-yellow-400">Pending Review</span>
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Your registration is being reviewed by our admin team. You'll receive an email notification once it has been approved or if we need additional information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F8FAFB] dark:bg-[#1a3a2e] rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] mb-2">Email</p>
                    <p className="font-semibold text-[#0F2A1D] dark:text-[#E3EED4] flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {guide.email}
                    </p>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                        A confirmation email has been sent to your email address. Please check your inbox and spam folder.
                    </p>

                    <div className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40 pt-6">
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors font-medium"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
