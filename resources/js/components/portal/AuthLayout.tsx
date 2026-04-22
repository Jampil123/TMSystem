import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const DepartmentLogo = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-lg">
        {/* Outer white circle */}
        <circle cx="60" cy="60" r="58" fill="white" stroke="#2d5016" strokeWidth="2" />
        
        {/* Inner border circle */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="#DAA520" strokeWidth="3" />
        
        {/* Sun/Circle in center */}
        <circle cx="60" cy="60" r="30" fill="url(#sunGradient)" />
        
        {/* Sun rays */}
        <g stroke="#DAA520" strokeWidth="2" strokeLinecap="round">
            {/* Top */}
            <line x1="60" y1="8" x2="60" y2="18" />
            {/* Bottom */}
            <line x1="60" y1="102" x2="60" y2="112" />
            {/* Left */}
            <line x1="8" y1="60" x2="18" y2="60" />
            {/* Right */}
            <line x1="102" y1="60" x2="112" y2="60" />
            {/* Top-right */}
            <line x1="83" y1="21" x2="90" y2="28" />
            {/* Bottom-left */}
            <line x1="30" y1="92" x2="37" y2="99" />
            {/* Top-left */}
            <line x1="37" y1="28" x2="30" y2="21" />
            {/* Bottom-right */}
            <line x1="90" y1="92" x2="83" y2="99" />
        </g>
        
        {/* Gradient definition */}
        <defs>
            <radialGradient id="sunGradient" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
            </radialGradient>
        </defs>
    </svg>
);

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full overflow-hidden bg-white">
            {/* Main Container */}
            <div className="flex min-h-screen">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6BBF59] via-[#5AA84A] to-[#4A9B3D] flex-col items-center justify-between px-8 py-16 relative overflow-hidden">
                    {/* Background overlay pattern */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-black/5"></div>
                        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                        {/* Logo Circle */}
                        <div className="mb-8 animate-fade-in">
                            <DepartmentLogo />
                        </div>

                        {/* Text */}
                        <h1 className="text-5xl font-bold text-white mb-1 tracking-tight">Suroy-Badian</h1>
                        <p className="text-3xl font-light text-white/95">Portal</p>
                    </div>

                    {/* Footer text on left */}
                    <div className="relative z-10 text-center">
                        <p className="text-white/80 text-sm font-medium">
                            Discover the Beauty of Badian
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-green-50">
                    {/* Background Images - Positioned for nature look */}
                    <div className="absolute inset-0">
                        {/* Top right waterfall image */}
                        <div 
                            className="absolute top-0 right-0 w-96 h-96 bg-cover opacity-8"
                            style={{
                                backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop)',
                                backgroundPosition: 'center'
                            }}
                        ></div>

                        {/* Bottom left jungle image */}
                        <div 
                            className="absolute bottom-0 left-0 w-80 h-80 bg-cover opacity-6"
                            style={{
                                backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop)',
                                backgroundPosition: 'center'
                            }}
                        ></div>

                        {/* Large background text watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center opacity-3">
                                <div className="text-9xl font-black text-green-700" style={{letterSpacing: '0.1em'}}>BADIAN</div>
                                <div className="text-8xl font-light text-green-600 -mt-6">BREATH</div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="relative z-20 w-full px-6 sm:px-8 max-w-md">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-8 left-0 right-0 text-center z-20">
                        <p className="text-sm text-gray-500 font-medium">
                            Tourism Management System © 2025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
