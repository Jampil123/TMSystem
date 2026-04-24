import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export type OperatorService = {
    id?: number | string;
    service_type?: string | null;
    name: string;
    description?: string | null;
    price?: number | string | null;
    availability?: string | null;
    booking_url?: string | null;
    status?: string | null;
};

export type OperatorDetails = {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    company_name?: string | null;
    contact_number?: string | null;
    office_address?: string | null;
    description?: string | null;
    contact_person?: string | null;
    logo_url?: string | null;
    services?: OperatorService[] | null;
};

type OperatorDetailsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    operator: OperatorDetails | null;
};

function getPriceLabel(price?: number | string | null) {
    if (price === null || price === undefined || price === '') return 'Price on request';
    if (typeof price === 'number') return `PHP ${price.toLocaleString()}`;
    return price;
}

export default function OperatorDetailsModal({ open, onOpenChange, operator }: OperatorDetailsModalProps) {
    const services = operator?.services ?? [];
    const isAccredited = Boolean(operator?.company_name && operator?.contact_number);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200">
                {operator ? (
                    <div className="max-h-[85vh] overflow-y-auto bg-[#F4F7F4]">
                        <div className="border-b border-emerald-100 bg-white p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    {operator.logo_url ? (
                                        <img
                                            src={operator.logo_url}
                                            alt={`${operator.company_name ?? operator.name} logo`}
                                            className="h-14 w-14 rounded-xl object-cover border border-emerald-100"
                                        />
                                    ) : (
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-lg font-bold text-emerald-800">
                                            {(operator.company_name ?? operator.name).charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <DialogTitle className="truncate text-xl sm:text-2xl font-bold text-slate-900">
                                            {operator.company_name ?? operator.name}
                                        </DialogTitle>
                                        <DialogDescription className="mt-1 text-sm text-slate-600">
                                            {operator.description ?? 'Professional tourism operator serving Badian visitors.'}
                                        </DialogDescription>
                                        <div className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {isAccredited ? 'Accredited Tourism Operator' : 'Pending Accreditation'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
                            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                    Company Information
                                </h3>
                                <div className="mt-3 space-y-2 text-sm text-slate-700">
                                    <p>
                                        <span className="font-medium text-slate-900">Company Name:</span>{' '}
                                        {operator.company_name ?? 'Not provided'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-900">Contact Person:</span>{' '}
                                        {operator.contact_person ?? operator.name}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-900">Contact Number:</span>{' '}
                                        {operator.contact_number ?? 'Not provided'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-900">Business Address:</span>{' '}
                                        {operator.office_address ?? 'Not provided'}
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                    Account Details
                                </h3>
                                <div className="mt-3 space-y-2 text-sm text-slate-700">
                                    <p>
                                        <span className="font-medium text-slate-900">Name:</span> {operator.name}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-900">Username:</span>{' '}
                                        @{operator.username ?? 'operator'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-900">Email:</span> {operator.email}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <section className="px-5 pb-5 sm:px-6 sm:pb-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                    Tourism Services and Packages
                                </h3>

                                {services.length === 0 ? (
                                    <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-sm text-slate-600">
                                        No services or packages listed yet for this operator.
                                    </div>
                                ) : (
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {services.map((service, index) => (
                                            <div
                                                key={service.id ?? `${service.name}-${index}`}
                                                className="rounded-xl border border-slate-200 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="text-sm font-semibold text-slate-900">{service.name}</h4>
                                                    {service.service_type ? (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                                            {service.service_type}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 text-xs text-slate-600">
                                                    {service.description ?? 'No description provided.'}
                                                </p>
                                                <div className="mt-3 space-y-1 text-xs text-slate-700">
                                                    <p>
                                                        <span className="font-medium text-slate-900">Price:</span>{' '}
                                                        {getPriceLabel(service.price)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-slate-900">Availability:</span>{' '}
                                                        {service.availability ?? 'Contact operator'}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium text-slate-900">Status:</span>{' '}
                                                        {service.status ?? 'Unknown'}
                                                    </p>
                                                </div>
                                                {service.booking_url ? (
                                                    <a
                                                        href={service.booking_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-3 inline-flex"
                                                    >
                                                        <Button
                                                            type="button"
                                                            className="h-8 rounded-lg bg-emerald-600 px-3 text-xs hover:bg-emerald-700"
                                                        >
                                                            Book / Inquire
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        disabled
                                                        className="mt-3 h-8 rounded-lg bg-slate-200 px-3 text-xs text-slate-600"
                                                    >
                                                        Contact for Booking
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
