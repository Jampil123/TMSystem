import Header from '@/layouts/portal/Header';
import { useMemo, useState } from 'react';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4

type Attraction = {
    id: number;
    name: string;
    location: string;
    category: 'Nature' | 'Adventure' | 'Culture' | 'Beach' | 'Food';
    shortDescription: string;
    image: string;
    rating?: number;
    entryFee?: string;
};

const MOCK_ATTRACTIONS: Attraction[] = [
    {
        id: 1,
        name: 'Kawasan Falls',
        location: 'Matutinao, Badian',
        category: 'Nature',
        shortDescription: 'Turquoise cascades and cool river pools — perfect for a refreshing escape.',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
        rating: 4.8,
        entryFee: '₱80+',
    },
    {
        id: 2,
        name: 'Canyoneering (Badian → Kawasan)',
        location: 'Badian, Cebu',
        category: 'Adventure',
        shortDescription: 'Cliffs, jumps, slides, and trekking through stunning canyons.',
        image: 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1400&q=80',
        rating: 4.7,
        entryFee: '₱1,500+',
    },
    {
        id: 3,
        name: 'Zaragosa Island View',
        location: 'Badian Coastline',
        category: 'Beach',
        shortDescription: 'Golden-hour coastal views, gentle waves, and laid-back seaside vibes.',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
        rating: 4.5,
        entryFee: 'Free',
    },
    {
        id: 4,
        name: 'Local Heritage Church',
        location: 'Poblacion, Badian',
        category: 'Culture',
        shortDescription: 'A quiet stop to appreciate local history, faith, and town life.',
        image: 'https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0d?auto=format&fit=crop&w=1400&q=80',
        rating: 4.3,
        entryFee: 'Donation',
    },
    {
        id: 5,
        name: 'Seafood by the Shore',
        location: 'Badian Seaside',
        category: 'Food',
        shortDescription: 'Fresh grilled seafood, local flavors, and a great view while you eat.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
        rating: 4.6,
        entryFee: 'Varies',
    },
    {
        id: 6,
        name: 'Coral Garden Snorkel Spot',
        location: 'Badian Coastal Waters',
        category: 'Nature',
        shortDescription: 'Clear water, colorful reefs, and an easy swim for beginners.',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
        rating: 4.4,
        entryFee: '₱100+',
    },
];

const CATEGORIES: Array<{ id: 'all' | Attraction['category']; label: string; icon: string }> = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'Nature', label: 'Nature', icon: '🏞️' },
    { id: 'Adventure', label: 'Adventure', icon: '🧗' },
    { id: 'Beach', label: 'Beach', icon: '🏖️' },
    { id: 'Culture', label: 'Culture', icon: '🏛️' },
    { id: 'Food', label: 'Food', icon: '🍽️' },
];

export default function Attractions() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<'all' | Attraction['category']>('all');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return MOCK_ATTRACTIONS.filter((a) => {
            if (category !== 'all' && a.category !== category) return false;
            if (!q) return true;
            return (
                a.name.toLowerCase().includes(q) ||
                a.location.toLowerCase().includes(q) ||
                a.category.toLowerCase().includes(q)
            );
        });
    }, [query, category]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Banner */}
            <div
                className="relative flex items-center justify-center"
                style={{
                    backgroundImage: "url('/images/background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '280px',
                }}
            >
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 42, 29, 0.72)' }} />
                <div className="relative z-10 text-center px-6 py-14">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6B9071' }}>
                        Discover
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#E3EED4' }}>
                        Attractions
                    </h1>
                    <p className="mt-3 text-sm" style={{ color: '#AEC3B0' }}>
                        Explore featured spots around Badian (mock data for now)
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1" style={{ backgroundColor: '#E3EED4' }}>
                <div className="max-w-6xl mx-auto px-6 py-12">
                    {/* Toolbar */}
                    <div className="rounded-2xl p-5 md:p-6 mb-8" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                            <div className="flex-1">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B9071' }}>
                                    Search
                                </label>
                                <div className="mt-2">
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search by name, location, or category..."
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            backgroundColor: '#E3EED4',
                                            border: '1px solid #AEC3B0',
                                            color: '#0F2A1D',
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="md:w-[420px]">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B9071' }}>
                                    Category
                                </label>
                                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                                    {CATEGORIES.map((c) => {
                                        const active = c.id === category;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setCategory(c.id)}
                                                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                                                style={
                                                    active
                                                        ? { backgroundColor: '#375534', color: '#E3EED4', border: '1px solid #6B9071' }
                                                        : { backgroundColor: '#E3EED4', color: '#375534', border: '1px solid #AEC3B0' }
                                                }
                                            >
                                                <span className="mr-2">{c.icon}</span>
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex items-end justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: '#0F2A1D' }}>
                                Featured Attractions
                            </h2>
                            <p className="text-sm mt-1" style={{ color: '#6B9071' }}>
                                Showing <span className="font-semibold">{filtered.length}</span> result{filtered.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px dashed #AEC3B0' }}>
                            <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                                No attractions match your filters.
                            </p>
                            <p className="text-xs mt-2" style={{ color: '#6B9071' }}>
                                Try clearing your search or selecting “All”.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                            {filtered.map((a) => (
                                <div
                                    key={a.id}
                                    className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white"
                                    style={{ border: '1px solid #AEC3B0' }}
                                >
                                    <div className="relative w-full h-56 overflow-hidden bg-gray-200">
                                        <img
                                            src={a.image}
                                            alt={a.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                            {a.category}
                                        </div>
                                        {typeof a.rating === 'number' && (
                                            <div
                                                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                                                style={{
                                                    backgroundColor: 'rgba(227, 238, 212, 0.92)',
                                                    color: '#0F2A1D',
                                                    border: '1px solid #AEC3B0',
                                                }}
                                            >
                                                <span>⭐</span>
                                                {a.rating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold" style={{ color: '#0F2A1D' }}>
                                            {a.name}
                                        </h3>
                                        <p className="text-xs mt-1" style={{ color: '#6B9071' }}>
                                            📍 {a.location}
                                        </p>

                                        <p className="text-sm mt-4 leading-relaxed" style={{ color: '#375534' }}>
                                            {a.shortDescription}
                                        </p>

                                        <div className="mt-5 flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(174, 195, 176, 0.55)' }}>
                                            <div className="text-sm font-semibold" style={{ color: '#375534' }}>
                                                {a.entryFee ? `Entry: ${a.entryFee}` : 'Entry: —'}
                                            </div>
                                            <button
                                                type="button"
                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                                                style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                                            >
                                                View details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
