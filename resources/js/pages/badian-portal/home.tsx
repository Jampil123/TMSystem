import { FormEvent, useMemo, useState } from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import Header from '@/layouts/portal/Header';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4

type Attraction = {
    id: number;
    name: string;
    location: string;
    category: string;
    description?: string | null;
    image_url?: string | null;
    rating?: number;
    entry_fee?: number | string | null;
};

type Activity = {
    id: number;
    name: string;
    location?: string | null;
    description?: string | null;
    image?: string | null;
    image_url?: string | null;
    price?: number | string | null;
};

type HomePageProps = {
    attractions?: Attraction[];
    activities?: Activity[];
    auth?: {
        user?: {
            name?: string;
            email?: string;
        } | null;
    };
};

export default function Home() {
    const { url } = usePage();
    const { attractions = [], activities = [], auth } = usePage<HomePageProps>().props;
    const isLoggedIn = Boolean(auth?.user);
    const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const activePanel = params.get('panel') ?? 'video';
    const isSessionOut = params.get('session') === 'out';
    const fallbackActivities: Activity[] = [
        {
            id: 9001,
            name: 'Canyoneering',
            location: 'Badian - Kawasan Falls Canyoneering',
            description:
                "Join the fun at Kawasan Falls with an action packed canyoneering adventure. Feel the rush with water jumps and swings, rapid slides and rock traversing. It's a great day out for the Badian tourist (20 min ride from Badian).",
            image:
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
        },
        {
            id: 9002,
            name: 'Trekking',
            location: 'Sunset at Osmena Peak overlooking Badian',
            description:
                "Join in our trek to Osmena Peak, the highest point on Cebu Island, while enjoying breathtaking views over Badian and the Tanton Strait. It's a fantastic view for any Badian tourist (1 hour ride from Badian).",
            image:
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
        },
        {
            id: 9003,
            name: 'Snorkeling',
            location: 'Corals at Pescador Island off the coast of Badian',
            description:
                'Enjoy a day out on a boat exploring marine life and snorkeling at Pescador Island. You can also cruise to Lambug Beach and enjoy the sunset over the Tanton Strait (30 min boat ride from Badian).',
            image:
                'https://images.unsplash.com/photo-1682686581498-5e85c7228119?auto=format&fit=crop&w=1400&q=80',
        },
    ];
    const displayActivities = activities.length > 0 ? activities : fallbackActivities;

    const [attractionQuery, setAttractionQuery] = useState('');
    const [attractionCategory, setAttractionCategory] = useState<string>('all');

    const categories = useMemo(() => {
        const unique = Array.from(
            new Set(
                attractions
                    .map((a) => (a.category ?? '').trim())
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));

        return ['all', ...unique];
    }, [attractions]);

    const filteredAttractions = useMemo(() => {
        const q = attractionQuery.trim().toLowerCase();
        return attractions.filter((a) => {
            if (attractionCategory !== 'all' && (a.category ?? '') !== attractionCategory) return false;
            if (!q) return true;
            return (
                a.name.toLowerCase().includes(q) ||
                a.location.toLowerCase().includes(q) ||
                (a.category ?? '').toLowerCase().includes(q)
            );
        });
    }, [attractionQuery, attractionCategory, attractions]);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/badian-portal/login');
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
                    backgroundAttachment: 'fixed',
                    backgroundBlendMode: 'overlay',
                    minHeight: 'calc(100vh - 64px)',
                    opacity: 0.9
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
                                    {isSessionOut && !isLoggedIn && (
                                        <div
                                            className="rounded-lg px-4 py-3 text-sm"
                                            style={{
                                                backgroundColor: 'rgba(107, 144, 113, 0.2)',
                                                border: '1px solid #6B9071',
                                                color: '#E3EED4',
                                            }}
                                        >
                                            Session out. You have been logged out.
                                        </div>
                                    )}

                                    {isLoggedIn && (
                                        <div
                                            className="rounded-lg px-4 py-3 text-sm"
                                            style={{
                                                backgroundColor: 'rgba(107, 144, 113, 0.2)',
                                                border: '1px solid #6B9071',
                                                color: '#E3EED4',
                                            }}
                                        >
                                            You are already logged in as {auth?.user?.email ?? auth?.user?.name ?? 'portal user'}.
                                        </div>
                                    )}

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
                                            disabled={isLoggedIn}
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
                                                disabled={isLoggedIn}
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
                                            disabled={isLoggedIn}
                                            className="rounded"
                                            style={{ accentColor: '#6B9071' }}
                                        />
                                        <span className="text-sm" style={{ color: '#AEC3B0' }}>Remember me</span>
                                    </label>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={processing || isLoggedIn}
                                        className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 mt-1 disabled:opacity-60"
                                        style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                                    >
                                        {isLoggedIn ? 'Session Active' : processing ? 'Signing in...' : 'Sign In'}
                                    </button>

                                    {isLoggedIn && (
                                        <Link
                                            href="/badian-portal/portal-home"
                                            className="w-full py-3 rounded-lg font-semibold text-sm text-center transition-opacity hover:opacity-90"
                                            style={{ backgroundColor: '#375534', color: '#E3EED4', border: '1px solid #6B9071' }}
                                        >
                                            Go to Portal Home
                                        </Link>
                                    )}

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
                                                { label: 'Kawasan Falls' },
                                                { label: 'Pristine Beaches' },
                                                { label: 'Canyoneering' },
                                                { label: 'Heritage Sites' },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                                                    style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                                >
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
                            ) : activePanel === 'attractions' ? (
                                /* Attractions Panel (replaces video holder) */
                                <div
                                    className="rounded-2xl shadow-2xl h-[520px] md:h-[620px] flex flex-col overflow-hidden"
                                    style={{
                                        border: '1px solid #375534',
                                        backdropFilter: 'blur(8px)',
                                        backgroundColor: 'rgba(15, 42, 29, 0.85)',
                                    }}
                                >
                                    {/* Header strip */}
                                    <div className="px-7 pt-7 pb-4" style={{ borderBottom: '1px solid #375534' }}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: '#375534', border: '1px solid #6B9071' }}
                                                >
                                                    <span style={{ color: '#AEC3B0' }}></span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold" style={{ color: '#E3EED4' }}>Attractions</h3>
                                                    <p className="text-xs" style={{ color: '#6B9071' }}>Badian, Cebu</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#375534', color: '#AEC3B0' }}>
                                                {filteredAttractions.length} item{filteredAttractions.length === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Grid */}
                                    <div className="px-7 py-6 flex-1 overflow-auto">
                                        {filteredAttractions.length === 0 ? (
                                            <div className="rounded-xl p-5" style={{ backgroundColor: '#375534', border: '1px dashed #6B9071' }}>
                                                <p className="text-sm font-semibold" style={{ color: '#E3EED4' }}>
                                                    No attractions match your search.
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: '#AEC3B0' }}>
                                                    Try clearing your filters.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredAttractions.map((a) => (
                                                    <div
                                                        key={a.id}
                                                        className="rounded-2xl overflow-hidden"
                                                        style={{ backgroundColor: '#0F2A1D', border: '1px solid #375534' }}
                                                    >
                                                        <div className="relative w-full h-36 overflow-hidden bg-gray-200">
                                                            <img
                                                                src={a.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'}
                                                                alt={a.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                                                {a.category}
                                                            </div>
                                                            {typeof a.rating === 'number' && (
                                                                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ backgroundColor: 'rgba(227, 238, 212, 0.92)', color: '#0F2A1D' }}>
                                                                    <span>⭐</span>
                                                                    {a.rating.toFixed(1)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <h4 className="text-sm font-bold" style={{ color: '#E3EED4' }}>
                                                                        {a.name}
                                                                    </h4>
                                                                    <p className="text-xs mt-0.5" style={{ color: '#6B9071' }}>
                                                                         {a.location}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: '#AEC3B0' }}>
                                                                    {a.entry_fee !== null && a.entry_fee !== undefined && a.entry_fee !== ''
                                                                        ? `₱${Number(a.entry_fee).toFixed(2)}`
                                                                        : '—'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs mt-3 leading-relaxed" style={{ color: '#AEC3B0' }}>
                                                                {a.description ?? 'No description available yet.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Back link */}
                                    <div className="px-7 py-4" style={{ borderTop: '1px solid #375534' }}>
                                        <Link
                                            href="/badian-portal"
                                            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                                            style={{ color: '#6B9071' }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            ) : activePanel === 'activities' ? (
                                /* Activities Panel (for guest/non-logged-in view) */
                                <div
                                    className="rounded-2xl shadow-2xl h-[520px] md:h-[620px] flex flex-col overflow-hidden"
                                    style={{
                                        border: '1px solid #375534',
                                        backdropFilter: 'blur(8px)',
                                        backgroundColor: 'rgba(15, 42, 29, 0.85)',
                                    }}
                                >
                                    <div className="px-7 pt-7 pb-4" style={{ borderBottom: '1px solid #375534' }}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: '#375534', border: '1px solid #6B9071' }}
                                                >
                                                    <span style={{ color: '#AEC3B0' }}></span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold" style={{ color: '#E3EED4' }}>Activities</h3>
                                                    <p className="text-xs" style={{ color: '#6B9071' }}>Badian, Cebu</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#375534', color: '#AEC3B0' }}>
                                                {displayActivities.length} item{displayActivities.length === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-7 py-6 flex-1 overflow-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {displayActivities.map((activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className="rounded-2xl overflow-hidden"
                                                        style={{ backgroundColor: '#0F2A1D', border: '1px solid #375534' }}
                                                    >
                                                        <div className="relative w-full h-36 overflow-hidden bg-gray-200">
                                                            <img
                                                                src={activity.image || activity.image_url || 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1400&q=80'}
                                                                alt={activity.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <h4 className="text-sm font-bold" style={{ color: '#E3EED4' }}>
                                                                        {activity.name}
                                                                    </h4>
                                                                    <p className="text-xs mt-0.5" style={{ color: '#6B9071' }}>
                                                                        {activity.location ?? 'Badian, Cebu'}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: '#AEC3B0' }}>
                                                                    {activity.price !== null && activity.price !== undefined && activity.price !== ''
                                                                        ? `₱${Number(activity.price).toFixed(2)}`
                                                                        : '—'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs mt-3 leading-relaxed" style={{ color: '#AEC3B0' }}>
                                                                {activity.description ?? 'No description available yet.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                    </div>

                                    <div className="px-7 py-4" style={{ borderTop: '1px solid #375534' }}>
                                        <Link
                                            href="/badian-portal"
                                            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
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
                                            Nature
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                        >
                                             Adventure
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#375534', color: '#AEC3B0' }}
                                        >
                                            Culture
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