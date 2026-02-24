import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface DynamicSpinnerProps {
    isLoading?: boolean;
    state?: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    errorMessage?: string;
    successMessage?: string;
    onRetry?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function DynamicSpinner({
    isLoading = false,
    state = 'idle',
    message = 'Processing...',
    errorMessage = 'Something went wrong',
    successMessage = 'Success!',
    onRetry,
    size = 'md',
}: DynamicSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const containerSize = {
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
    };

    const textSize = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    // Render based on state
    if (state === 'loading' || isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center ${containerSize[size]} gap-2`}>
                <Loader className={`${sizeClasses[size]} text-[#375534] dark:text-[#AEC3B0] animate-spin`} />
                <p className={`${textSize[size]} text-[#6B8071] dark:text-[#AEC3B0]`}>{message}</p>
            </div>
        );
    }

    if (state === 'success') {
        return (
            <div className={`flex flex-col items-center justify-center ${containerSize[size]} gap-2`}>
                <CheckCircle className={`${sizeClasses[size]} text-green-600 dark:text-green-400`} />
                <p className={`${textSize[size]} text-green-600 dark:text-green-400`}>{successMessage}</p>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className={`flex flex-col items-center justify-center ${containerSize[size]} gap-2`}>
                <AlertCircle className={`${sizeClasses[size]} text-red-600 dark:text-red-400`} />
                <p className={`${textSize[size]} text-red-600 dark:text-red-400`}>{errorMessage}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // Idle state - return nothing
    return null;
}
