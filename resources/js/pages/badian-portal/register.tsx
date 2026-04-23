import { FormEvent, useState } from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import Header from '@/layouts/portal/Header';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4
export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { props } = usePage();
    const flash = props.flash as Record<string, any>;
    const isRegistered = !!flash?.registration_status;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        registration_type: 'tourist',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/portal/register');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Section with background */}
            <div
                className="flex-1 relative flex items-center justify-center"
                style={{
                    backgroundImage: "url('/images/background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {/* Dark overlay */}
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(15, 42, 29, 0.70)' }}
                />

                {/* Content — landscape two-column layout */}
                <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            border: '1px solid #375534',
                            backgroundColor: 'rgba(15, 42, 29, 0.88)',
                            backdropFilter: 'blur(14px)',
                        }}
                    >
                        {/* Left — Branding Panel */}
                        <div
                            className="w-full md:w-5/12 flex flex-col justify-between p-10"
                            style={{
                                background: 'linear-gradient(160deg, #0F2A1D 0%, #375534 100%)',
                                borderRight: '1px solid #375534',
                            }}
                        >
                            <div>
                                {/* Logo */}
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                                    style={{ backgroundColor: '#375534', border: '2px solid #6B9071' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#AEC3B0" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                    </svg>
                                </div>

                                <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: '#E3EED4' }}>
                                    Join Suroy-Badian Portal
                                </h1>
                                <p className="text-sm leading-relaxed" style={{ color: '#AEC3B0' }}>
                                    Create your account to explore breathtaking destinations, book activities, and plan your perfect Badian adventure.
                                </p>

                                {/* Feature list */}
                                <ul className="mt-8 flex flex-col gap-4">
                                    {[
                                        { icon: '🏞️', text: 'Discover Nature & Attractions' },
                                        { icon: '🤿', text: 'Book Activities & Tours' },
                                        { icon: '🗺️', text: 'Plan Your Itinerary' },
                                        { icon: '🎭', text: 'Experience Local Culture' },
                                    ].map((item) => (
                                        <li key={item.text} className="flex items-center gap-3">
                                            <span
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                                style={{ backgroundColor: '#375534' }}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="text-sm" style={{ color: '#AEC3B0' }}>{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bottom note */}
                            <p className="text-xs mt-10" style={{ color: '#6B9071' }}>
                                Badian, Cebu — Southern Philippines
                            </p>
                        </div>

                        {/* Right — Register Form */}
                        <div className="w-full md:w-7/12 p-10 flex flex-col justify-center">

                            {/* Success state */}
                            {isRegistered ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#375534', border: '2px solid #6B9071' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#AEC3B0" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#E3EED4' }}>Account Created!</h2>
                                    <p className="text-sm" style={{ color: '#AEC3B0' }}>
                                        Your account is pending admin approval. You'll be notified once activated.
                                    </p>
                                    <Link href="/badian-portal" className="inline-block mt-6 px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90" style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}>
                                        Back to Login
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-1" style={{ color: '#E3EED4' }}>
                                        Create Account
                                    </h2>
                                    <p className="text-sm mb-8" style={{ color: '#AEC3B0' }}>
                                        Fill in the details below to get started.
                                    </p>

                                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                        {/* Full Name + Username — side by side */}
                                        <div className="flex gap-4">
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Juan dela Cruz"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                                    style={{ backgroundColor: '#375534', border: `1px solid ${errors.name ? '#f87171' : '#6B9071'}`, color: '#E3EED4' }}
                                                    onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                                    onBlur={(e) => (e.currentTarget.style.borderColor = errors.name ? '#f87171' : '#6B9071')}
                                                />
                                                {errors.name && <p className="text-xs" style={{ color: '#f87171' }}>{errors.name}</p>}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>Username</label>
                                                <input
                                                    type="text"
                                                    placeholder="juandelacruz"
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                                    style={{ backgroundColor: '#375534', border: `1px solid ${errors.username ? '#f87171' : '#6B9071'}`, color: '#E3EED4' }}
                                                    onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                                    onBlur={(e) => (e.currentTarget.style.borderColor = errors.username ? '#f87171' : '#6B9071')}
                                                />
                                                {errors.username && <p className="text-xs" style={{ color: '#f87171' }}>{errors.username}</p>}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                                style={{ backgroundColor: '#375534', border: `1px solid ${errors.email ? '#f87171' : '#6B9071'}`, color: '#E3EED4' }}
                                                onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                                onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? '#f87171' : '#6B9071')}
                                            />
                                            {errors.email && <p className="text-xs" style={{ color: '#f87171' }}>{errors.email}</p>}
                                        </div>

                                        {/* Password + Confirm — side by side */}
                                        <div className="flex gap-4">
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className="w-full px-4 py-3 pr-11 rounded-lg text-sm outline-none transition-all"
                                                        style={{ backgroundColor: '#375534', border: `1px solid ${errors.password ? '#f87171' : '#6B9071'}`, color: '#E3EED4' }}
                                                        onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.password ? '#f87171' : '#6B9071')}
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6B9071' }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                            {showPassword
                                                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                                            }
                                                        </svg>
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-xs" style={{ color: '#f87171' }}>{errors.password}</p>}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>Confirm Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirm ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className="w-full px-4 py-3 pr-11 rounded-lg text-sm outline-none transition-all"
                                                        style={{ backgroundColor: '#375534', border: `1px solid ${errors.password_confirmation ? '#f87171' : '#6B9071'}`, color: '#E3EED4' }}
                                                        onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.password_confirmation ? '#f87171' : '#6B9071')}
                                                    />
                                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6B9071' }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                            {showConfirm
                                                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                                            }
                                                        </svg>
                                                    </button>
                                                </div>
                                                {errors.password_confirmation && <p className="text-xs" style={{ color: '#f87171' }}>{errors.password_confirmation}</p>}
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 mt-1 disabled:opacity-60"
                                            style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                                        >
                                            {processing ? 'Creating Account...' : 'Create Account'}
                                        </button>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-px" style={{ backgroundColor: '#375534' }} />
                                            <span className="text-xs" style={{ color: '#6B9071' }}>or</span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: '#375534' }} />
                                        </div>

                                        <p className="text-center text-sm" style={{ color: '#AEC3B0' }}>
                                            Already have an account?{' '}
                                            <Link href="/badian-portal" className="font-semibold hover:underline" style={{ color: '#E3EED4' }}>
                                                Sign In
                                            </Link>
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
