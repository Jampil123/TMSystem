import MainLayout from '@/layouts/portal/MainLayouts';
import { usePage } from '@inertiajs/react';
import { BedDouble, Building2, Info, Mail, MapPin, Star, Users } from 'lucide-react';
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

    const displayPrice = (value: number | string | null | undefined) => {
        const amount = Number(value ?? 0);
        return `PHP ${Number.isFinite(amount) ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`;
    };

    return (
        <div className="w-full bg-[#F4F7F4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="mb-6 md:mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Tourism Accommodations
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Accommodation Booking Details</h1>
                    <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600">
                        Browse curated stays from local operators with complete room and pricing information.
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-8 text-center">
                        <p className="text-sm font-semibold text-slate-700">No accommodations found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
                        <div className="lg:col-span-8">
                            {selectedAccommodation && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
                                    <div className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-100">
                                        <img
                                            src={storageUrl(selectedAccommodation.attraction_image)}
                                            alt={selectedAccommodation.attraction_name ?? selectedAccommodation.service_name ?? 'Accommodation'}
                                            className="h-64 md:h-80 w-full object-cover"
                                        />
                                        <span className="absolute top-4 left-4 rounded-full border border-emerald-200 bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            Accommodation
                                        </span>
                                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-700">
                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                            4.8
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                                                Accommodation Details
                                            </p>
                                            <h2 className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
                                                {selectedAccommodation.service_name ?? `Accommodation #${selectedAccommodation.accommodation_id}`}
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {selectedAccommodation.room_type}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                        {selectedAccommodation.description ?? 'No description provided.'}
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-emerald-700" />
                                                <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">Operator</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {selectedAccommodation.operator_name ?? 'N/A'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600 break-all">
                                                <Mail className="mr-1 inline h-3.5 w-3.5 text-slate-500" />
                                                {selectedAccommodation.operator_email ?? 'N/A'}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-emerald-700" />
                                                <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">Attraction</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {selectedAccommodation.attraction_name ?? 'N/A'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {selectedAccommodation.attraction_location ?? 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <BedDouble className="h-4 w-4 text-emerald-700" />
                                                <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">
                                                    Room and Pricing
                                                </p>
                                            </div>
                                            <div className="space-y-1.5 text-sm text-slate-600">
                                                <p>
                                                    <span className="font-semibold text-slate-800">Room Type:</span> {selectedAccommodation.room_type}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-800">Capacity:</span> {selectedAccommodation.capacity}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-800">Total Rooms:</span> {selectedAccommodation.total_rooms}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-800">Price/Night:</span>{' '}
                                                    {displayPrice(selectedAccommodation.price_per_night)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Info className="h-4 w-4 text-emerald-700" />
                                                <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">Status</p>
                                            </div>
                                            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {selectedAccommodation.status ?? 'N/A'}
                                            </div>
                                            <p className="mt-3 text-sm text-slate-600">
                                                Managed through the tourism portal for coordinated and professional booking handling.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(5,150,105,0.28)] transition-colors hover:bg-emerald-700"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4 space-y-4">
                            {selectedAccommodation && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Quick Summary</p>
                                    <div className="mt-3 overflow-hidden rounded-xl border border-emerald-100">
                                        <img
                                            src={storageUrl(selectedAccommodation.attraction_image)}
                                            alt={selectedAccommodation.attraction_name ?? selectedAccommodation.service_name ?? 'Accommodation'}
                                            className="h-40 w-full object-cover"
                                        />
                                    </div>
                                    <div className="mt-4 flex items-start justify-between gap-2">
                                        <h3 className="text-base font-semibold text-slate-900 leading-tight">
                                            {selectedAccommodation.service_name ?? `Accommodation #${selectedAccommodation.accommodation_id}`}
                                        </h3>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                            {selectedAccommodation.room_type}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                                        {selectedAccommodation.description ?? 'No description provided.'}
                                    </p>
                                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                                        <p className="flex items-center gap-2">
                                            <BedDouble className="h-4 w-4 text-emerald-700" />
                                            <span className="font-medium text-slate-900">Price/Night:</span>{' '}
                                            {displayPrice(selectedAccommodation.price_per_night)}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-emerald-700" />
                                            <span className="font-medium text-slate-900">Capacity:</span> {selectedAccommodation.capacity} guests
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Info className="h-4 w-4 text-emerald-700" />
                                            <span className="font-medium text-slate-900">Status:</span> {selectedAccommodation.status ?? 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                                    Other Accommodations
                                </p>
                                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                                    {filtered.map((row) => {
                                        const isActive = row.accommodation_id === selectedAccommodation?.accommodation_id;
                                        return (
                                            <button
                                                type="button"
                                                key={row.accommodation_id}
                                                onClick={() => setSelectedAccommodationId(row.accommodation_id)}
                                                className="w-full text-left rounded-xl p-3 transition-all hover:shadow-sm"
                                                style={{
                                                    backgroundColor: isActive ? '#ECF8EE' : '#fff',
                                                    border: isActive ? '1px solid #7BC38C' : '1px solid #E2E8E5',
                                                }}
                                            >
                                                <div className="mb-2 overflow-hidden rounded-lg border border-emerald-100">
                                                    <img
                                                        src={storageUrl(row.attraction_image)}
                                                        alt={row.attraction_name ?? row.service_name ?? 'Accommodation'}
                                                        className="h-24 w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                                                        {row.service_name ?? `Accommodation #${row.accommodation_id}`}
                                                    </h4>
                                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                        {row.room_type}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-600">{displayPrice(row.price_per_night)} / night</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

AccomodationsPage.layout = (page: ReactNode) => <MainLayout children={page} />;
