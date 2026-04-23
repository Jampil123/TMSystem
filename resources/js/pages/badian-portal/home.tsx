import { FormEvent } from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import Header from '@/layouts/portal/Header';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4
export default function Home() {
    const { url } = usePage();
    const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const activePanel = params.get('panel') ?? 'video';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/portal/login');
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
                    style={{ backgroundColor: 'rgba(15, 42, 29, 0.65)' }}
                />

                {/* Content */}
                <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-14">
                    <div className="flex flex-col md:flex-row gap-8 items-stretch">

                        {/* Left — Login Card */}
                        <div className="w-full md:w-5/12">
                            <div
                                className="rounded-2xl p-8 shadow-2xl h-full flex flex-col justify-center"
                                style={{
                                    backgroundColor: 'rgba(15, 42, 29, 0.85)',
                                    border: '1px solid #375534',
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                {/* Logo / Title */}
                                <div className="mb-8 text-center">
                                    <div
                                        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                                        style={{ backgroundColor: '#375534', border: '2px solid #6B9071' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#AEC3B0" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold" style={{ color: '#E3EED4' }}>
                                        Welcome Back
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: '#AEC3B0' }}>
                                        Sign in to your portal account
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>
                                            Email or Username
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="you@example.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                            style={{
                                                backgroundColor: '#375534',
                                                border: `1px solid ${errors.email ? '#f87171' : '#6B9071'}`,
                                                color: '#E3EED4',
                                            }}
                                            onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                            onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? '#f87171' : '#6B9071')}
                                        />
                                        {errors.email && (
                                            <p className="text-xs" style={{ color: '#f87171' }}>{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium" style={{ color: '#AEC3B0' }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all pr-11"
                                                style={{
                                                    backgroundColor: '#375534',
                                                    border: `1px solid ${errors.password ? '#f87171' : '#6B9071'}`,
                                                    color: '#E3EED4',
                                                }}
                                                onFocus={(e) => (e.currentTarget.style.borderColor = '#AEC3B0')}
                                                onBlur={(e) => (e.currentTarget.style.borderColor = errors.password ? '#f87171' : '#6B9071')}
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs" style={{ color: '#f87171' }}>{errors.password}</p>
                                        )}
                                        <div className="flex justify-end mt-0.5">
                                            <a href="#" className="text-xs hover:underline" style={{ color: '#6B9071' }}>
                                                Forgot password?
                                            </a>
                                        </div>
                                    </div>

                                    {/* Remember me */}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded"
                                            style={{ accentColor: '#6B9071' }}
                                        />
                                        <span className="text-sm" style={{ color: '#AEC3B0' }}>Remember me</span>
                                    </label>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 mt-1 disabled:opacity-60"
                                        style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                                    >
                                        {processing ? 'Signing in...' : 'Sign In'}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px" style={{ backgroundColor: '#375534' }} />
                                        <span className="text-xs" style={{ color: '#6B9071' }}>or</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: '#375534' }} />
                                    </div>

                                    {/* Register */}
                                    <p className="text-center text-sm" style={{ color: '#AEC3B0' }}>
                                        Don't have an account?{' '}
                                        <Link href="/badian-portal/register" className="font-semibold hover:underline" style={{ color: '#E3EED4' }}>
                                            Register
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/* Right — Video / About Panel */}
                        <div className="w-full md:w-7/12 flex flex-col gap-6">

                            {activePanel === 'about' ? (
                                /* About Panel */
                                <div
                                    className="rounded-2xl shadow-2xl h-full flex flex-col"
                                    style={{
                                        border: '1px solid #375534',
                                        backdropFilter: 'blur(8px)',
                                        backgroundColor: 'rgba(15, 42, 29, 0.85)',
                                    }}
                                >
                                    {/* Header strip */}
                                    <div className="px-7 pt-7 pb-4" style={{ borderBottom: '1px solid #375534' }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: '#375534', border: '1px solid #6B9071' }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#AEC3B0" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold" style={{ color: '#E3EED4' }}>About Badian</h3>
                                                <p className="text-xs" style={{ color: '#6B9071' }}>Cebu, Philippines</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-7 py-6 flex-1 flex flex-col gap-6">
                                        <p className="text-sm leading-relaxed" style={{ color: '#AEC3B0' }}>
                                            As often is the case in areas of great beauty around the world, Badian is now beginning to boom
                                            with development for nice tourist accommodations and resorts. With a number of tourist attractions
                                            in the area and many land owners putting their lands up for sale, there are some great locations
                                            available with great potential for the coming years.
                                        </p>

                                        {/* Highlights */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { icon: '💧', label: 'Kawasan Falls' },
                                                { icon: '🏖️', label: 'Pristine Beaches' },
                                                { icon: '🪂', label: 'Canyoneering' },
                                                { icon: '⛪', label: 'Heritage Sites' },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                                                    style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                                >
                                                    <span>{item.icon}</span>
                                                    {item.label}
                                                </div>
                                            ))}
                                        </div>

                                        {/* More info note */}
                                        <p className="text-xs" style={{ color: '#6B9071' }}>
                                            More details coming soon.
                                        </p>

                                        {/* Back link */}
                                        <Link
                                            href="/badian-portal"
                                            className="mt-auto inline-flex items-center gap-2 text-sm font-medium hover:underline"
                                            style={{ color: '#6B9071' }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* Video Card */
                                <div
                                    className="rounded-2xl overflow-hidden shadow-2xl"
                                    style={{
                                        border: '1px solid #375534',
                                        backdropFilter: 'blur(8px)',
                                        backgroundColor: 'rgba(15, 42, 29, 0.7)',
                                    }}
                                >
                                {/* YouTube Embed */}
                                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src="https://www.youtube.com/embed/HIaFOeeYTk0?autoplay=1&mute=1&controls=0&loop=1&playlist=HIaFOeeYTk0&rel=0&modestbranding=1&disablekb=1"
                                        title="Love Breathtaking Badian"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                    {/* Transparent overlay to block pause/click interaction */}
                                    <div className="absolute inset-0 z-10" />
                                </div>

                                {/* Card Footer */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold" style={{ color: '#E3EED4' }}>
                                        Love Breathtaking Badian
                                    </h3>
                                    <p className="text-sm mt-1" style={{ color: '#AEC3B0' }}>
                                        Discover the stunning landscapes, vibrant culture, and thrilling adventures that make Badian, Cebu a paradise worth exploring.
                                    </p>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                        >
                                            🏞️ Nature
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                        >
                                            🤿 Adventure
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                        >
                                            🎭 Culture
                                        </span>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}