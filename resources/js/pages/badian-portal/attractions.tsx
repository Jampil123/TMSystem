import { usePage } from '@inertiajs/react';
import MainLayout from '@/layouts/portal/MainLayouts';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4

type Attraction = {
    id: number;
    name: string;
    location: string;
    category?: string | null;
    description?: string | null;
    image_url?: string | null;
    rating?: number | null;
    entry_fee?: number | string | null;
};

type AttractionsPageProps = {
    attractions?: Attraction[];
};

export default function Attractions() {
    const { attractions = [] } = usePage<AttractionsPageProps>().props;
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');

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

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return attractions.filter((a) => {
            const safeCategory = (a.category ?? '').toLowerCase();
            if (category !== 'all' && safeCategory !== category.toLowerCase()) return false;
            if (!q) return true;
            return (
                a.name.toLowerCase().includes(q) ||
                a.location.toLowerCase().includes(q) ||
                safeCategory.includes(q)
            );
        });
    }, [query, category, attractions]);

    return (
        <div className="w-full" style={{ backgroundColor: 'rgb(227, 238, 212)' }}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                


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
                                Try clearing your search or selecting "All".
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                            {filtered.map((a) => (
                                <div
                                    key={a.id}
                                    className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                                    style={{ border: '1px solid rgba(174,195,176,0.75)', backgroundColor: '#fff' }}
                                >
                                    <div className="relative w-full h-56 overflow-hidden bg-gray-200">
                                        <img
                                            src={a.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'}
                                            alt={a.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                                Attraction
                                            </span>
                                            {typeof a.rating === 'number' && !Number.isNaN(a.rating) && a.rating >= 4.5 && (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ backgroundColor: '#FBBF24', color: '#0F2A1D' }}>
                                                    ⭐ Top Rated
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className="absolute bottom-3 right-3 h-10 w-10 rounded-full grid place-items-center"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.92)', border: '1px solid rgba(174,195,176,0.8)' }}
                                            aria-label="Save"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold" style={{ color: '#0F2A1D' }}>
                                            {a.name}
                                        </h3>
                                        <p className="text-xs mt-1" style={{ color: '#6B9071' }}>
                                            {a.location}
                                        </p>

                                        <p className="text-sm mt-4 leading-relaxed line-clamp-2" style={{ color: '#6B9071' }}>
                                            {a.description ?? 'No description available yet for this attraction.'}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-sm" style={{ color: '#F59E0B' }}>
                                                {Array.from({ length: 5 }).map((_, i) => {
                                                    const r = typeof a.rating === 'number' && !Number.isNaN(a.rating) ? a.rating : 0;
                                                    const filled = i < Math.floor(r);
                                                    return (
                                                        <span key={i} style={{ opacity: filled ? 1 : 0.25 }}>★</span>
                                                    );
                                                })}
                                                <span className="ml-2 text-xs font-semibold" style={{ color: '#375534' }}>
                                                    {typeof a.rating === 'number' && !Number.isNaN(a.rating) ? `${a.rating.toFixed(2)}/5` : 'New'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 text-sm font-semibold" style={{ color: '#375534' }}>
                                            Entry Fee: {a.entry_fee !== null && a.entry_fee !== undefined && a.entry_fee !== ''
                                                ? `₱${Number(a.entry_fee).toFixed(2)}`
                                                : '—'}
                                        </div>

                                        <button
                                            type="button"
                                            className="mt-5 w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-95"
                                            style={{
                                                background: 'linear-gradient(90deg, #375534 0%, #0F2A1D 100%)',
                                                color: '#E3EED4',
                                            }}
                                        >
                                            Learn More →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}

Attractions.layout = (page: ReactNode) => <MainLayout children={page} />;
