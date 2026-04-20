import React, { FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AuthLayout from '@/components/portal/AuthLayout';
import AuthForm from '@/components/portal/AuthForm';

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm<ForgotPasswordForm>({
        email: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/portal/password/email');
    };

    return (
        <>
            <Head title="Forgot Password" />
            
            <AuthLayout>
                <AuthForm 
                    title="Reset Password"
                    subtitle="Enter your email to receive a reset link"
                    onSubmit={handleSubmit}
                    isLoading={processing}
                >
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            placeholder="you@example.com"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {processing ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    {/* Footer Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p>
                            <a href="/portal/login" className="text-sm text-green-600 hover:text-green-800 font-medium">
                                Back to Login
                            </a>
                        </p>
                    </div>
                </AuthForm>
            </AuthLayout>
        </>
    );
}
