import MainLayout from '@/layouts/portal/MainLayouts';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type Attraction = {
    id: number;
    name: string;
    location: string;
    category?: string | null;
    description?: string | null;
    image_url?: string | null;
    rating?: number | null;
    entry_fee?: number | string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    current_tourists?: number | null;
};

type PortalHomeProps = {
    attractions?: Attraction[];
    asOfDate?: string;
};

export default function PortalHome() {
    const { attractions = [], asOfDate } = usePage<PortalHomeProps>().props;
    const [selectedId, setSelectedId] = useState<number>(() => attractions[0]?.id ?? 0);
    const [tab, setTab] = useState<'overview' | 'details' | 'reviews'>('overview');
    const [crowdOpen, setCrowdOpen] = useState(false);

    const selected = useMemo(() => {
        return attractions.find((a) => a.id === selectedId) ?? attractions[0] ?? null;
    }, [attractions, selectedId]);

    const rightList = useMemo(() => {
        if (!selected) return attractions;
        return [
            selected,
            ...attractions.filter((a) => a.id !== selected.id),
        ];
    }, [attractions, selected]);

    if (!selected) {
        return (
            <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px dashed #AEC3B0' }}>
                        <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                            No attractions available.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome card */}
                <div
                    className="rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    style={{
                        background: 'linear-gradient(135deg, #0F2A1D 0%, #375534 100%)',
                        border: '1px solid #375534',
                    }}
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#AEC3B0' }}>
                            Welcome
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ color: '#E3EED4' }}>
                            Explore Badian Highlights
                        </h1>
                        <p className="text-sm mt-2" style={{ color: '#AEC3B0' }}>
                            Select a place on the right to view details.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(227,238,212,0.15)', color: '#E3EED4', border: '1px solid rgba(227,238,212,0.25)' }}>
                            {attractions.length} places
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main detail card */}
                    <div className="lg:col-span-8">
                        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                            {/* Image */}
                            <div className="relative w-full h-[280px] bg-gray-200">
                                <img
                                    src={selected.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'}
                                    alt={selected.name}
                                    className="w-full h-full object-cover"
                                />
                                {typeof selected.rating === 'number' && !Number.isNaN(selected.rating) && (
                                    <div
                                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#0F2A1D', border: '1px solid #AEC3B0' }}
                                    >
                                        ⭐ {selected.rating.toFixed(1)}
                                    </div>
                                )}
                            </div>

                            {/* Header */}
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-2xl font-bold truncate" style={{ color: '#0F2A1D' }}>
                                            {selected.name}
                                        </h2>
                                        <p className="text-sm mt-1" style={{ color: '#6B9071' }}>
                                            {selected.location}
                                        </p>
                                    </div>
                                    {selected.category && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#E3EED4', color: '#375534', border: '1px solid #AEC3B0' }}>
                                            {selected.category}
                                        </span>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="mt-5 flex items-center gap-6 border-b" style={{ borderColor: '#E3EED4' }}>
                                    {[
                                        { id: 'overview', label: 'Overview' },
                                        { id: 'details', label: 'Details' },
                                        { id: 'reviews', label: 'Reviews' },
                                    ].map((t) => {
                                        const active = tab === (t.id as any);
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setTab(t.id as any)}
                                                className="pb-3 text-sm font-semibold"
                                                style={{
                                                    color: active ? '#0F2A1D' : '#6B9071',
                                                    borderBottom: active ? '2px solid #375534' : '2px solid transparent',
                                                }}
                                            >
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab content */}
                                <div className="pt-5">
                                    {tab === 'overview' && (
                                        <p className="text-sm leading-relaxed" style={{ color: '#375534' }}>
                                            {selected.description ?? 'No description available yet for this attraction.'}
                                        </p>
                                    )}
                                    {tab === 'details' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="rounded-xl p-4" style={{ backgroundColor: '#EDF5E6', border: '1px solid #AEC3B0' }}>
                                                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B9071' }}>
                                                    Entry Fee
                                                </p>
                                                <p className="text-sm font-bold mt-1" style={{ color: '#0F2A1D' }}>
                                                    {selected.entry_fee !== null && selected.entry_fee !== undefined && selected.entry_fee !== ''
                                                        ? `₱${Number(selected.entry_fee).toFixed(2)}`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="rounded-xl p-4" style={{ backgroundColor: '#EDF5E6', border: '1px solid #AEC3B0' }}>
                                                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B9071' }}>
                                                    Rating
                                                </p>
                                                <p className="text-sm font-bold mt-1" style={{ color: '#0F2A1D' }}>
                                                    {typeof selected.rating === 'number' && !Number.isNaN(selected.rating) ? selected.rating.toFixed(1) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {tab === 'reviews' && (
                                        <div className="rounded-xl p-4" style={{ backgroundColor: '#EDF5E6', border: '1px solid #AEC3B0' }}>
                                            <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>
                                                Reviews coming soon.
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: '#6B9071' }}>
                                                This section is ready for future integration.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Map holder */}
                        <div className="mt-6 rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E3EED4' }}>
                                <h3 className="text-base font-bold" style={{ color: '#0F2A1D' }}>
                                    Map
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCrowdOpen(true)}
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ backgroundColor: '#375534', color: '#E3EED4' }}
                                    >
                                        Crowd: {Number(selected.current_tourists ?? 0)} guests
                                    </button>
                                    <p className="text-xs" style={{ color: '#6B9071' }}>
                                        {selected.latitude && selected.longitude ? 'Location available' : 'No coordinates yet'}
                                    </p>
                                </div>
                            </div>

                            {selected.latitude && selected.longitude ? (
                                <div className="w-full h-[320px] bg-gray-100">
                                    <iframe
                                        title={`Map of ${selected.name}`}
                                        className="w-full h-full"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                                            String(selected.latitude)
                                        )},${encodeURIComponent(String(selected.longitude))}&z=15&output=embed`}
                                    />
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="rounded-xl p-5" style={{ backgroundColor: '#EDF5E6', border: '1px dashed #AEC3B0' }}>
                                        <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                                            Map not available for this attraction.
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: '#6B9071' }}>
                                            Please add latitude/longitude in the `attractions` table to enable the map.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right list */}
                    <div className="lg:col-span-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-bold" style={{ color: '#0F2A1D' }}>
                                Places you may like
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {rightList.slice(0, 6).map((a) => {
                                const active = a.id === selected.id;
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(a.id);
                                            setTab('overview');
                                        }}
                                        className="w-full text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        style={{
                                            backgroundColor: active ? '#D8E7D8' : '#fff',
                                            border: active ? '1px solid #7D9F83' : '1px solid #AEC3B0',
                                        }}
                                    >
                                        <div className="relative w-full h-28 bg-gray-200">
                                            <img
                                                src={a.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'}
                                                alt={a.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {typeof a.rating === 'number' && !Number.isNaN(a.rating) && (
                                                <div
                                                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#0F2A1D', border: '1px solid #AEC3B0' }}
                                                >
                                                    ⭐ {a.rating.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-sm font-bold line-clamp-1" style={{ color: '#0F2A1D' }}>
                                                {a.name}
                                            </p>
                                            <p className="text-xs mt-1 line-clamp-1" style={{ color: '#6B9071' }}>
                                                {a.location}
                                            </p>
                                            <p className="text-xs mt-2 font-semibold" style={{ color: '#2E4A35' }}>
                                                {a.entry_fee !== null && a.entry_fee !== undefined && a.entry_fee !== ''
                                                    ? `₱${Number(a.entry_fee).toFixed(2)}`
                                                    : 'Entry: N/A'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Crowd modal */}
            {crowdOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <button
                        type="button"
                        className="absolute inset-0"
                        onClick={() => setCrowdOpen(false)}
                        style={{ backgroundColor: 'rgba(15, 42, 29, 0.55)' }}
                        aria-label="Close modal"
                    />
                    <div
                        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl"
                        style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold truncate" style={{ color: '#0F2A1D' }}>
                                    Crowd details
                                </h3>
                                <p className="text-xs mt-1" style={{ color: '#6B9071' }}>
                                    {selected.name} {asOfDate ? `• ${asOfDate}` : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCrowdOpen(false)}
                                className="h-9 w-9 rounded-xl grid place-items-center"
                                style={{ backgroundColor: '#E3EED4', color: '#0F2A1D', border: '1px solid #AEC3B0' }}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: '#EDF5E6', border: '1px solid #AEC3B0' }}>
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B9071' }}>
                                Current crowd today
                            </p>
                            <p className="text-3xl font-bold mt-1" style={{ color: '#0F2A1D' }}>
                                {Number(selected.current_tourists ?? 0)}
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#375534' }}>
                                tourists/guests currently recorded (arrived today, not departed)
                            </p>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setCrowdOpen(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold"
                                style={{ backgroundColor: '#375534', color: '#E3EED4' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

PortalHome.layout = (page: ReactNode) => <MainLayout children={page} />;
