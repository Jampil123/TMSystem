import MainLayout from '@/layouts/portal/MainLayouts';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type AccommodationRow = {
    accommodation_id: number;
    service_id: number;
    service_name?: string | null;
    description?: string | null;
    status?: string | null;
    operator_name?: string | null;
    operator_email?: string | null;
    attraction_name?: string | null;
    attraction_location?: string | null;
    attraction_image?: string | null;
    room_type: string;
    capacity: number;
    price_per_night: number | string;
    total_rooms: number;
};

type AccomodationsPageProps = {
    accommodations?: AccommodationRow[];
};

export default function AccomodationsPage() {
    const storageUrl = (path?: string | null) => {
        if (!path) return '/images/background.jpg';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/storage/')) return path;
        return `/storage/${path.replace(/^\/+/, '')}`;
    };

    const { accommodations = [] } = usePage<AccomodationsPageProps>().props;
    const [selectedAccommodationId, setSelectedAccommodationId] = useState<number | null>(
        accommodations[0]?.accommodation_id ?? null,
    );

    const filtered = useMemo(() => accommodations, [accommodations]);

    useEffect(() => {
        if (filtered.length === 0) {
            setSelectedAccommodationId(null);
            return;
        }

        const selectedStillExists = filtered.some((item) => item.accommodation_id === selectedAccommodationId);
        if (!selectedStillExists) {
            setSelectedAccommodationId(filtered[0].accommodation_id);
        }
    }, [filtered, selectedAccommodationId]);

    const selectedAccommodation = useMemo(
        () => filtered.find((item) => item.accommodation_id === selectedAccommodationId) ?? filtered[0] ?? null,
        [filtered, selectedAccommodationId],
    );

    return (
        <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                {filtered.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px dashed #AEC3B0' }}>
                        <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                            No accommodations found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7">
                            {selectedAccommodation && (
                                <div className="rounded-2xl p-6 md:p-7 shadow-md" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                                    <div className="mb-5 overflow-hidden rounded-xl border" style={{ borderColor: '#AEC3B0' }}>
                                        <img
                                            src={storageUrl(selectedAccommodation.attraction_image)}
                                            alt={selectedAccommodation.attraction_name ?? selectedAccommodation.service_name ?? 'Accommodation'}
                                            className="h-56 md:h-64 w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B9071' }}>
                                                Accommodation Details
                                            </p>
                                            <h2 className="text-2xl font-bold mt-1" style={{ color: '#0F2A1D' }}>
                                                {selectedAccommodation.service_name ?? `Accommodation #${selectedAccommodation.accommodation_id}`}
                                            </h2>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                            {selectedAccommodation.room_type}
                                        </span>
                                    </div>

                                    <p className="mt-5 text-sm leading-relaxed" style={{ color: '#375534' }}>
                                        {selectedAccommodation.description ?? 'No description provided.'}
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl p-4" style={{ backgroundColor: '#EAF3DF', border: '1px solid #C5D8BC' }}>
                                            <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: '#6B9071' }}>
                                                Operator
                                            </p>
                                            <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>
                                                {selectedAccommodation.operator_name ?? 'N/A'}
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: '#375534' }}>
                                                {selectedAccommodation.operator_email ?? 'N/A'}
                                            </p>
                                        </div>

                                        <div className="rounded-xl p-4" style={{ backgroundColor: '#EAF3DF', border: '1px solid #C5D8BC' }}>
                                            <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: '#6B9071' }}>
                                                Attraction
                                            </p>
                                            <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>
                                                {selectedAccommodation.attraction_name ?? 'N/A'}
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: '#375534' }}>
                                                {selectedAccommodation.attraction_location ?? 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: '#EAF3DF', border: '1px solid #C5D8BC' }}>
                                        <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: '#6B9071' }}>
                                            Room Info
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: '#375534' }}>
                                            <p><span className="font-semibold">Capacity:</span> {selectedAccommodation.capacity}</p>
                                            <p><span className="font-semibold">Total Rooms:</span> {selectedAccommodation.total_rooms}</p>
                                            <p><span className="font-semibold">Price/Night:</span> ₱{Number(selectedAccommodation.price_per_night ?? 0).toFixed(2)}</p>
                                            <p><span className="font-semibold">Status:</span> {selectedAccommodation.status ?? 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5">
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                {filtered.map((row) => {
                                    const isActive = row.accommodation_id === selectedAccommodation?.accommodation_id;
                                    return (
                                        <button
                                            type="button"
                                            key={row.accommodation_id}
                                            onClick={() => setSelectedAccommodationId(row.accommodation_id)}
                                            className="w-full text-left rounded-2xl p-4 shadow-sm transition-all"
                                            style={{
                                                backgroundColor: isActive ? '#D8E7D8' : '#fff',
                                                border: isActive ? '1px solid #7D9F83' : '1px solid #AEC3B0',
                                            }}
                                        >
                                            <div className="mb-3 overflow-hidden rounded-xl border" style={{ borderColor: '#AEC3B0' }}>
                                                <img
                                                    src={storageUrl(row.attraction_image)}
                                                    alt={row.attraction_name ?? row.service_name ?? 'Accommodation'}
                                                    className="h-28 w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-base font-bold leading-tight" style={{ color: '#0F2A1D' }}>
                                                    {row.service_name ?? `Accommodation #${row.accommodation_id}`}
                                                </h3>
                                                <span className="px-2 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                                    {row.room_type}
                                                </span>
                                            </div>

                                            <p className="text-sm mt-2 line-clamp-2" style={{ color: '#2E4A35' }}>
                                                {row.description ?? 'No description provided.'}
                                            </p>

                                            <div className="mt-3 text-xs" style={{ color: '#375534' }}>
                                                <p><span className="font-semibold">Price:</span> ₱{Number(row.price_per_night ?? 0).toFixed(2)}</p>
                                                <p><span className="font-semibold">Status:</span> {row.status ?? 'N/A'}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

AccomodationsPage.layout = (page: ReactNode) => <MainLayout children={page} />;
