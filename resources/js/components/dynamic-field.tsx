import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface DynamicFieldProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    type?: 'text' | 'email' | 'number' | 'password' | 'textarea';
    placeholder?: string;
    isValidating?: boolean;
    isValid?: boolean | null;
    errorMessage?: string;
    successMessage?: string;
    disabled?: boolean;
    rows?: number;
    required?: boolean;
}

export default function DynamicField({
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    isValidating = false,
    isValid = null,
    errorMessage = 'Invalid input',
    successMessage = 'Looks good!',
    disabled = false,
    rows = 3,
    required = false,
}: DynamicFieldProps) {
    const baseInputClasses = 'w-full px-4 py-2 border rounded-lg transition-colors dark:bg-[#0F2A1D] dark:text-[#E3EED4]';
    
    let borderClasses = 'border-[#AEC3B0]/40 dark:border-[#375534]/40 focus:border-[#375534] dark:focus:border-[#AEC3B0]';
    
    if (isValidating) {
        borderClasses = 'border-blue-400 dark:border-blue-500';
    } else if (isValid === true) {
        borderClasses = 'border-green-400 dark:border-green-500';
    } else if (isValid === false) {
        borderClasses = 'border-red-400 dark:border-red-500';
    }

    const inputClasses = `${baseInputClasses} ${borderClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none'}`;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#375534] dark:text-[#E3EED4]">
                    {label}
                    {required && <span className="text-red-600 dark:text-red-400">*</span>}
                </label>
                {isValidating && (
                    <Loader className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                )}
                {isValid === true && (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                )}
                {isValid === false && (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
            </div>

            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || isValidating}
                    rows={rows}
                    className={inputClasses}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || isValidating}
                    className={inputClasses}
                />
            )}

            {isValid === true && successMessage && (
                <p className="text-xs text-green-600 dark:text-green-400">{successMessage}</p>
            )}
            {isValid === false && errorMessage && (
                <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
        </div>
    );
}
