import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayoutModern({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh bg-gradient-to-br from-[#E3EED4] via-[#AEC3B0] to-[#375534]">
            {/* Left Section - Hero/Image Section */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            'url("/images/bg.jpg")',
                    }}
                >
                    {/* Dark Green Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A1D]/80 via-[#375534]/60 to-[#6B8071]/40" />
                </div>

                {/* Content */}
                <div className="relative z-10 px-8 text-white text-center max-w-md">
                    <img src="/images/logo.png" alt="Logo" className="mx-auto mb-4 w-60 h-60" />
                    <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">
                        Suroy-Badian
                    </h1>
                    <p className="text-xl font-semibold mb-6 text-white/90 drop-shadow">
                        TOURISM MANAGEMENT SYSTEM
                    </p>
                    
                    <p className="text-lg font-light mb-4 text-white/95 drop-shadow">
                        Welcome to Excellence
                    </p>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    {/* Glassmorphism Card */}
                    <div className="relative rounded-3xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden p-8 md:p-10">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 space-y-8">
                            {/* Header */}
                            <div className="space-y-2 text-center">
                                <h2 className="text-3xl font-bold text-[#0F2A1D]">
                                    {title}
                                </h2>
                                <p className="text-sm text-[#375534] font-medium">
                                    {description}
                                </p>
                            </div>

                            {/* Form */}
                            {children}

                        </div>
                    </div>

                    {/* Bottom Text */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-[#375534] font-medium">
                            Tourism Management System © 2025 
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
