import { Link, router, usePage } from '@inertiajs/react';
import Header from '@/layouts/portal/Header';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4

interface PageProps {
    auth: { user: { name: string; email: string; username?: string } };
    [key: string]: any;
}

const mockAttractions = [
    { id: 1, name: 'Kawasan Falls', category: 'Nature', rating: 4.9, visits: '12.4k', emoji: '💧', desc: 'A stunning multi-tiered waterfall perfect for canyoneering.' },
    { id: 2, name: 'Matutinao Beach', category: 'Beach', rating: 4.7, visits: '8.2k', emoji: '🏖️', desc: 'Pristine white sand beach with crystal clear turquoise waters.' },
    { id: 3, name: 'St. Francis Church', category: 'Heritage', rating: 4.5, visits: '5.1k', emoji: '⛪', desc: 'A centuries-old Spanish colonial church in the heart of Badian.' },
];

const mockActivities = [
    { id: 1, name: 'Canyoneering Adventure', icon: '🪂', date: 'May 2, 2026', slots: 8, price: '₱1,500' },
    { id: 2, name: 'Island Hopping Tour', icon: '🚤', date: 'May 5, 2026', slots: 12, price: '₱800' },
    { id: 3, name: 'Coral Garden Snorkeling', icon: '🤿', date: 'May 8, 2026', slots: 6, price: '₱600' },
    { id: 4, name: 'Mountain Trekking', icon: '🥾', date: 'May 10, 2026', slots: 10, price: '₱500' },
];

const mockNotifications = [
    { id: 1, text: 'Your canyoneering booking is confirmed!', time: '2 hours ago', read: false },
    { id: 2, text: 'New attraction added: Osmena Peak Trail', time: '1 day ago', read: false },
    { id: 3, text: 'Island Hopping slots are filling up fast!', time: '2 days ago', read: true },
];

const stats = [
    { label: 'Attractions Saved', value: '7', icon: '⭐' },
    { label: 'Activities Booked', value: '3', icon: '🎯' },
    { label: 'Places Visited', value: '5', icon: '📍' },
    { label: 'Reviews Given', value: '4', icon: '✍️' },
];

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/portal/logout');
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E3EED4' }}>
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">

                {/* Welcome Banner */}
                <div
                    className="rounded-2xl p-6 mb-8 flex items-center justify-between"
                    style={{
                        background: 'linear-gradient(135deg, #0F2A1D 0%, #375534 100%)',
                        border: '1px solid #375534',
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                            style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() ?? 'T'}
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-0.5" style={{ color: '#AEC3B0' }}>Welcome back,</p>
                            <h1 className="text-2xl font-bold" style={{ color: '#E3EED4' }}>
                                {user?.name ?? 'Tourist'}
                            </h1>
                            <p className="text-xs mt-0.5" style={{ color: '#6B9071' }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/badian-portal/attractions"
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: '#375534', color: '#AEC3B0', border: '1px solid #6B9071' }}
                        >
                            🗺️ Explore
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                            style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl p-5 flex items-center gap-4"
                            style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                        >
                            <div
                                className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                                style={{ backgroundColor: '#E3EED4' }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: '#0F2A1D' }}>{stat.value}</p>
                                <p className="text-xs" style={{ color: '#6B9071' }}>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Attractions (2/3 width) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Featured Attractions */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                        >
                            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E3EED4' }}>
                                <h2 className="font-bold text-base" style={{ color: '#0F2A1D' }}>Featured Attractions</h2>
                                <Link href="/badian-portal/attractions" className="text-xs font-medium hover:underline" style={{ color: '#6B9071' }}>
                                    View all →
                                </Link>
                            </div>
                            <div className="divide-y" style={{ borderColor: '#E3EED4' }}>
                                {mockAttractions.map((attraction) => (
                                    <div key={attraction.id} className="px-6 py-4 flex items-start gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                            style={{ backgroundColor: '#E3EED4' }}
                                        >
                                            {attraction.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm" style={{ color: '#0F2A1D' }}>{attraction.name}</h3>
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                    style={{ backgroundColor: '#E3EED4', color: '#375534' }}
                                                >
                                                    {attraction.category}
                                                </span>
                                            </div>
                                            <p className="text-xs truncate" style={{ color: '#6B9071' }}>{attraction.desc}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold" style={{ color: '#375534' }}>⭐ {attraction.rating}</p>
                                            <p className="text-xs" style={{ color: '#AEC3B0' }}>{attraction.visits} visits</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Activities */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                        >
                            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E3EED4' }}>
                                <h2 className="font-bold text-base" style={{ color: '#0F2A1D' }}>Upcoming Activities</h2>
                                <Link href="/badian-portal/activities" className="text-xs font-medium hover:underline" style={{ color: '#6B9071' }}>
                                    View all →
                                </Link>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mockActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: '#E3EED4', border: '1px solid #AEC3B0' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{activity.icon}</span>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>{activity.name}</p>
                                                <p className="text-xs" style={{ color: '#6B9071' }}>{activity.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#AEC3B0', color: '#0F2A1D' }}>
                                                {activity.slots} slots left
                                            </span>
                                            <span className="text-sm font-bold" style={{ color: '#375534' }}>{activity.price}</span>
                                        </div>
                                        <button
                                            className="w-full py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                                            style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="flex flex-col gap-6">

                        {/* Notifications */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                        >
                            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E3EED4' }}>
                                <h2 className="font-bold text-base" style={{ color: '#0F2A1D' }}>Notifications</h2>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                                >
                                    {mockNotifications.filter((n) => !n.read).length} new
                                </span>
                            </div>
                            <ul className="divide-y" style={{ borderColor: '#E3EED4' }}>
                                {mockNotifications.map((notif) => (
                                    <li key={notif.id} className="px-5 py-4 flex gap-3 items-start">
                                        <div
                                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                            style={{ backgroundColor: notif.read ? '#AEC3B0' : '#6B9071' }}
                                        />
                                        <div>
                                            <p className="text-xs leading-relaxed" style={{ color: notif.read ? '#6B9071' : '#0F2A1D', fontWeight: notif.read ? 400 : 600 }}>
                                                {notif.text}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: '#AEC3B0' }}>{notif.time}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                        >
                            <div className="px-5 py-4" style={{ borderBottom: '1px solid #E3EED4' }}>
                                <h2 className="font-bold text-base" style={{ color: '#0F2A1D' }}>Quick Links</h2>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                {[
                                    { label: 'Browse Attractions', href: '/badian-portal/attractions', icon: '⭐' },
                                    { label: 'Explore Activities', href: '/badian-portal/activities', icon: '🏞️' },
                                    { label: 'About Badian', href: '/badian-portal/about', icon: '📖' },
                                    { label: 'Contact Us', href: '/badian-portal/contact', icon: '📬' },
                                ].map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                                        style={{ backgroundColor: '#E3EED4', color: '#375534' }}
                                    >
                                        <span>{link.icon}</span>
                                        {link.label}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Plan Your Visit CTA */}
                        <div
                            className="rounded-2xl p-5 text-center"
                            style={{ background: 'linear-gradient(135deg, #0F2A1D, #375534)', border: '1px solid #6B9071' }}
                        >
                            <p className="text-2xl mb-2">🌊</p>
                            <h3 className="font-bold text-sm mb-1" style={{ color: '#E3EED4' }}>Ready to Explore?</h3>
                            <p className="text-xs mb-4" style={{ color: '#AEC3B0' }}>Discover Badian's breathtaking destinations and plan your next adventure.</p>
                            <Link
                                href="/badian-portal/attractions"
                                className="inline-block w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                            >
                                Start Exploring
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
