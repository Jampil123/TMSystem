import React, { FormEvent } from 'react';

interface AuthFormProps {
    title: string;
    subtitle?: string;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading?: boolean;
    children: React.ReactNode;
}

export default function AuthForm({ 
    title, 
    subtitle, 
    onSubmit, 
    isLoading = false,
    children 
}: AuthFormProps) {
    return (
        <>
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-2 tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-green-600 mt-3 text-base sm:text-lg font-medium tracking-wide">{subtitle}</p>
                )}
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
                {children}
            </form>
        </>
    );
}
