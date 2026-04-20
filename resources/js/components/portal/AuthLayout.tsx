import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    backgroundImage?: string;
}

export default function AuthLayout({ 
    children, 
    backgroundImage = 'url(../../images/background.jpg)'
}: AuthLayoutProps) {
    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: backgroundImage,
            }}
        >
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
                {children}
            </div>
        </div>
    );
}
