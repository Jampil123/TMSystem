import React, { FormEvent, useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AuthLayout from '@/components/portal/AuthLayout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login() {
    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/portal/login');
    };

    return (
        <>
            <Head title="Sign In - Suroy-Badian Portal" />
            
            <AuthLayout>
                {/* Form Container */}
                <div className="w-full">
                    {/* Form Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">
                            Sign In to Your Account
                        </h1>
                        <p className="text-gray-600 text-base leading-relaxed">
                            Enter your credentials below to access your dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email or Username Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Email or Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition duration-200"
                                    placeholder="your@email.com or username"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <a href="/portal/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-semibold transition">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    onInvalid={() => setShowPasswordTooltip(true)}
                                    onInput={() => setShowPasswordTooltip(false)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition duration-200"
                                    placeholder="••••••"
                                    required
                                />
                                {showPasswordTooltip && (
                                    <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded whitespace-nowrap shadow-lg">
                                        Please fill out this field
                                    </div>
                                )}
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center pt-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer accent-green-600"
                            />
                            <label htmlFor="remember" className="ml-3 text-sm text-gray-700 cursor-pointer font-medium">
                                Remember me
                            </label>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-[#3D7C2E] to-[#2A5A20] hover:from-[#356127] hover:to-[#234A19] active:from-[#2A4620] active:to-[#1A3810] text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-8 text-base tracking-wide shadow-md hover:shadow-lg"
                        >
                            {processing ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center border-t-2 border-gray-200 pt-6">
                        <p className="text-sm text-gray-700">
                            Don't have an account?{' '}
                            <a href="/portal/register" className="text-green-600 hover:text-green-700 font-bold transition">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
