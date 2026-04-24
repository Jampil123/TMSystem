import MainLayout from '@/layouts/portal/MainLayouts';
import OperatorDetailsModal, { type OperatorService } from '@/components/badian-portal/operator-details-modal';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type Operator = {
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

type OperatorsPageProps = {
    operators?: Operator[];
};

export default function Operators() {
    const { operators = [] } = usePage<OperatorsPageProps>().props;
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'accredited' | 'pending'>('all');
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

    const filteredOperators = useMemo(() => {
        const q = query.trim().toLowerCase();
        return operators.filter((operator) => {
            const matchesQuery =
                !q ||
                operator.name.toLowerCase().includes(q) ||
                (operator.email ?? '').toLowerCase().includes(q) ||
                (operator.username ?? '').toLowerCase().includes(q) ||
                (operator.company_name ?? '').toLowerCase().includes(q);

            const isAccredited = Boolean(operator.company_name && operator.contact_number);
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'accredited' && isAccredited) ||
                (statusFilter === 'pending' && !isAccredited);

            return matchesQuery && matchesStatus;
        });
    }, [operators, query, statusFilter]);

    return (
        <div className="w-full bg-[#F4F7F4]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
                <div className="mb-6 md:mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Tourism Operations
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                        Accredited Tourism Operators
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                        Discover verified operators and partner providers supporting tourism experiences in Badian.
                    </p>
                </div>

                <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <label className="sr-only">Search operators</label>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, company, username, or email"
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 md:flex-1"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'accredited' | 'pending')}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 md:w-48"
                        >
                            <option value="all">All statuses</option>
                            <option value="accredited">Accredited</option>
                            <option value="pending">Pending verification</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4 flex items-end justify-between gap-4">
                    <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                        Showing {filteredOperators.length} operator{filteredOperators.length === 1 ? '' : 's'}
                    </h2>
                </div>

                {filteredOperators.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-8 text-center">
                        <p className="text-sm font-semibold text-slate-700">No operators found.</p>
                        <p className="mt-2 text-xs text-slate-500">
                            Try a different keyword or adjust the status filter.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                        {filteredOperators.map((operator) => {
                            const isAccredited = Boolean(operator.company_name && operator.contact_number);
                            return (
                                <div
                                    key={operator.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-base font-bold text-emerald-800">
                                                {(operator.name?.charAt(0) ?? 'O').toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-slate-900">
                                                    {operator.name}
                                                </h3>
                                                <p className="truncate text-xs text-slate-500">
                                                    {operator.company_name ?? 'Independent Operator'}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    @{operator.username ?? 'operator'}
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                isAccredited ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {isAccredited ? 'Accredited' : 'Pending'}
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                        <p className="truncate">
                                            <span className="font-medium text-slate-700">Email:</span> {operator.email}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-medium text-slate-700">Contact:</span>{' '}
                                            {operator.contact_number ?? 'Not available'}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-medium text-slate-700">Address:</span>{' '}
                                            {operator.office_address ?? 'Not available'}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedOperator(operator)}
                                        className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                                    >
                                        View Details
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <OperatorDetailsModal
                open={Boolean(selectedOperator)}
                onOpenChange={(open) => {
                    if (!open) setSelectedOperator(null);
                }}
                operator={selectedOperator}
            />
        </div>
    );
}

Operators.layout = (page: ReactNode) => <MainLayout children={page} />;
