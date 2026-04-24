import MainLayout from '@/layouts/portal/MainLayouts';
import { usePage } from '@inertiajs/react';
import { Info, Mail, MapPin, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type ServiceRow = {
    service_id: number;
    service_name: string;
    service_type: string;
    description?: string | null;
    facebook_url?: string | null;
    status?: string | null;
    operator_name?: string | null;
    operator_email?: string | null;
    attraction_name?: string | null;
    attraction_location?: string | null;
    attraction_image?: string | null;
};

type ServicesPageProps = {
    services?: ServiceRow[];
};

export default function ServicesPage() {
    const storageUrl = (path?: string | null) => {
        if (!path) return '/images/background.jpg';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/storage/')) return path;
        return `/storage/${path.replace(/^\/+/, '')}`;
    };

    const { services = [] } = usePage<ServicesPageProps>().props;
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(services[0]?.service_id ?? null);

    const filtered = useMemo(() => services, [services]);

    useEffect(() => {
        if (filtered.length === 0) {
            setSelectedServiceId(null);
            return;
        }

        const selectedStillExists = filtered.some((item) => item.service_id === selectedServiceId);
        if (!selectedStillExists) {
            setSelectedServiceId(filtered[0].service_id);
        }
    }, [filtered, selectedServiceId]);

    const selectedService = useMemo(
        () => filtered.find((item) => item.service_id === selectedServiceId) ?? filtered[0] ?? null,
        [filtered, selectedServiceId],
    );

    return (
        <div className="w-full bg-[#F4F7F4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="mb-6 md:mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Tourism Services
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Service Booking Details</h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
                        Explore curated services from accredited operators and review complete booking information.
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-8 text-center">
                        <p className="text-sm font-semibold text-slate-700">No services found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
                        <div className="lg:col-span-8">
                            {selectedService && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
                                    <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100">
                                        <img
                                            src={storageUrl(selectedService.attraction_image)}
                                            alt={selectedService.attraction_name ?? selectedService.service_name}
                                            className="h-64 md:h-80 w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                                                Service Details
                                            </p>
                                            <h2 className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
                                                {selectedService.service_name}
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {selectedService.service_type}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                        {selectedService.description ?? 'No description provided.'}
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <User className="h-4 w-4 text-emerald-700" />
                                                <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">
                                                    Operator
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {selectedService.operator_name ?? 'N/A'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600 break-all">
                                                <Mail className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
                                                {selectedService.operator_email ?? 'N/A'}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-emerald-700" />
                                                <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">
                                                    Attraction
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {selectedService.attraction_name ?? 'N/A'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {selectedService.attraction_location ?? 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-emerald-700" />
                                            <p className="text-xs uppercase font-semibold tracking-wide text-emerald-700">
                                                Other Info
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            <span className="font-semibold text-slate-800">Status:</span> {selectedService.status ?? 'N/A'}
                                        </p>
                                        <p className="mt-1 text-sm break-all text-slate-600">
                                            <span className="font-semibold text-slate-800">Facebook:</span>{' '}
                                            {selectedService.facebook_url ?? 'N/A'}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Related Services</h3>
                                </div>

                                <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
                                {filtered.map((service) => {
                                    const isActive = service.service_id === selectedService?.service_id;
                                    return (
                                        <button
                                            type="button"
                                            key={service.service_id}
                                            onClick={() => setSelectedServiceId(service.service_id)}
                                            className="w-full text-left rounded-2xl p-3.5 transition-all shadow-sm hover:shadow-md"
                                            style={{
                                                backgroundColor: isActive ? '#ECF8EE' : '#fff',
                                                border: isActive ? '1px solid #7BC38C' : '1px solid #E2E8E5',
                                            }}
                                        >
                                            <div className="mb-3 overflow-hidden rounded-xl border border-emerald-100">
                                                <img
                                                    src={storageUrl(service.attraction_image)}
                                                    alt={service.attraction_name ?? service.service_name}
                                                    className="h-28 w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-sm sm:text-base font-semibold leading-tight text-slate-900">
                                                    {service.service_name}
                                                </h3>
                                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                                    {service.service_type}
                                                </span>
                                            </div>

                                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                {service.description ?? 'No description provided.'}
                                            </p>

                                            <div className="mt-3 text-xs text-slate-600">
                                                <p>
                                                    <span className="font-semibold text-slate-800">Operator:</span>{' '}
                                                    {service.operator_name ?? 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-slate-800">Status:</span> {service.status ?? 'N/A'}
                                                </p>
                                            </div>
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

ServicesPage.layout = (page: ReactNode) => <MainLayout children={page} />;
