import React, { FormEvent } from 'react';
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/portal/login');
    };

    return (
        <>
            <Head title="Login" />
            
            <AuthLayout>

                {/* Form Card */}
                <div className="bg-green-100/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-green-300/50">
                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
                            Suroy Badian Portal
                        </h2>
                        <p className="text-green-700 mt-2 text-sm sm:text-base">
                             Explore. Experience. Manage.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-green-900 mb-2">
                                Email or Username
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
                                    placeholder="your@email.com or username"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-green-900">
                                    Password
                                </label>
                                <a href="/portal/forgot-password" className="text-xs sm:text-sm text-green-700 hover:text-green-800 font-medium">
                                    Forgot password?
                                </a>
                            </div>
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

                        {/* Remember Me */}
                        <div className="flex items-center pt-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-green-400 text-green-700 focus:ring-green-600 cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-green-800 cursor-pointer font-medium">
                                Remember me
                            </label>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-7 text-lg"
                        >
                            {processing ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-green-800">
                            Don't have an account?{' '}
                            <a href="/portal/register" className="text-green-700 hover:text-green-900 font-bold">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
