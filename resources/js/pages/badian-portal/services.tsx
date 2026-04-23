import MainLayout from '@/layouts/portal/MainLayouts';
import { usePage } from '@inertiajs/react';
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
        <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                

                {filtered.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px dashed #AEC3B0' }}>
                        <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                            No services found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7">
                            {selectedService && (
                                <div className="rounded-2xl p-6 md:p-7 shadow-md" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                                    <div className="mb-5 overflow-hidden rounded-xl border" style={{ borderColor: '#AEC3B0' }}>
                                        <img
                                            src={storageUrl(selectedService.attraction_image)}
                                            alt={selectedService.attraction_name ?? selectedService.service_name}
                                            className="h-56 md:h-64 w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B9071' }}>
                                                Service Details
                                            </p>
                                            <h2 className="text-2xl font-bold mt-1" style={{ color: '#0F2A1D' }}>
                                                {selectedService.service_name}
                                            </h2>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                            {selectedService.service_type}
                                        </span>
                                    </div>

                                    <p className="mt-5 text-sm leading-relaxed" style={{ color: '#375534' }}>
                                        {selectedService.description ?? 'No description provided.'}
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl p-4" style={{ backgroundColor: '#EAF3DF', border: '1px solid #C5D8BC' }}>
                                            <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: '#6B9071' }}>
                                                Operator
                                            </p>
                                            <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>
                                                {selectedService.operator_name ?? 'N/A'}
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: '#375534' }}>
                                                {selectedService.operator_email ?? 'N/A'}
                                            </p>
                                        </div>

                                        <div className="rounded-xl p-4" style={{ backgroundColor: '#EAF3DF', border: '1px solid #C5D8BC' }}>
                                            <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: '#6B9071' }}>
                                                Attraction
                                            </p>
                                            <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>
                                                {selectedService.attraction_name ?? 'N/A'}
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: '#375534' }}>
                                                {selectedService.attraction_location ?? 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: '#EAF3DF', border: '1px solid #C5D8BC' }}>
                                        <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: '#6B9071' }}>
                                            Other Info
                                        </p>
                                        <p className="text-sm" style={{ color: '#375534' }}>
                                            <span className="font-semibold">Status:</span> {selectedService.status ?? 'N/A'}
                                        </p>
                                        <p className="text-sm mt-1 break-all" style={{ color: '#375534' }}>
                                            <span className="font-semibold">Facebook:</span> {selectedService.facebook_url ?? 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5">
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                {filtered.map((service) => {
                                    const isActive = service.service_id === selectedService?.service_id;
                                    return (
                                        <button
                                            type="button"
                                            key={service.service_id}
                                            onClick={() => setSelectedServiceId(service.service_id)}
                                            className="w-full text-left rounded-2xl p-4 shadow-sm transition-all"
                                            style={{
                                                backgroundColor: isActive ? '#D8E7D8' : '#fff',
                                                border: isActive ? '1px solid #7D9F83' : '1px solid #AEC3B0',
                                            }}
                                        >
                                            <div className="mb-3 overflow-hidden rounded-xl border" style={{ borderColor: '#AEC3B0' }}>
                                                <img
                                                    src={storageUrl(service.attraction_image)}
                                                    alt={service.attraction_name ?? service.service_name}
                                                    className="h-28 w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-base font-bold leading-tight" style={{ color: '#0F2A1D' }}>
                                                    {service.service_name}
                                                </h3>
                                                <span className="px-2 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: '#375534', color: '#E3EED4' }}>
                                                    {service.service_type}
                                                </span>
                                            </div>

                                            <p className="text-sm mt-2 line-clamp-2" style={{ color: '#2E4A35' }}>
                                                {service.description ?? 'No description provided.'}
                                            </p>

                                            <div className="mt-3 text-xs" style={{ color: '#375534' }}>
                                                <p><span className="font-semibold">Operator:</span> {service.operator_name ?? 'N/A'}</p>
                                                <p><span className="font-semibold">Status:</span> {service.status ?? 'N/A'}</p>
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

ServicesPage.layout = (page: ReactNode) => <MainLayout children={page} />;
