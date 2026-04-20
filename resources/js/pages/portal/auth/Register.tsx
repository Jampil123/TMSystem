import React, { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthLayout from '@/components/portal/AuthLayout';

interface TouristRegisterForm {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    registration_type: string;
}

export default function TouristRegister() {
    const { props } = usePage();
    const flash = props.flash as Record<string, any>;
    const [isRegistered, setIsRegistered] = useState(!!flash?.registration_status);
    
    const { data, setData, post, processing, errors } = useForm<TouristRegisterForm>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        registration_type: 'tourist',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/portal/register', {
            onSuccess: () => {
                setIsRegistered(true);
                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    router.visit('/tourist-dashboard');
                }, 3000);
            },
        });
    };

    return (
        <>
            <Head title="Tourist Registration" />
            
            <AuthLayout>

                {/* Form Card */}
                <div className="bg-green-100/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-300/50">
                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
                            Tourist Registration
                        </h2>
                        <p className="text-green-700 mt-2 text-sm sm:text-base">
                            Create your account to explore Suroy Badian
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Input */}
                        <div>
                            <label className="block text-sm font-semibold text-green-900 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white focus:border-green-500 transition"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Username Input */}
                        <div>
                            <label className="block text-sm font-semibold text-green-900 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white focus:border-green-500 transition"
                                    placeholder="johndoe123"
                                    required
                                />
                            </div>
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-green-900 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white focus:border-green-500 transition"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-green-900 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white focus:border-green-500 transition"
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-green-900 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white focus:border-green-500 transition"
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-7 text-lg"
                        >
                            {processing ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    {/* Sign In / Staff Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-green-800">
                            Already have an account?{' '}
                            <a href="/portal/login" className="text-green-700 hover:text-green-900 font-bold">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </AuthLayout>

            {/* Success Modal */}
            {isRegistered && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div 
                        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
                        style={{
                            animation: 'scaleIn 0.3s ease-out',
                        }}
                    >
                        <style>{`
                            @keyframes scaleIn {
                                from {
                                    opacity: 0;
                                    transform: scale(0.9);
                                }
                                to {
                                    opacity: 1;
                                    transform: scale(1);
                                }
                            }
                        `}</style>

                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-green-100 rounded-full p-4">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl font-bold text-center text-green-900 mb-3">
                            Registration Successful!
                        </h2>
                        <p className="text-center text-gray-600 mb-2">
                            Welcome to Suroy Badian
                        </p>
                        <p className="text-center text-sm text-gray-500 mb-6">
                            Your account has been created successfully. You can now explore attractions and book tours.
                        </p>

                        {/* Loading Indicator */}
                        <div className="flex justify-center mb-4">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            Redirecting to dashboard...
                        </p>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
