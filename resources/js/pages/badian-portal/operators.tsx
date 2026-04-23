import MainLayout from '@/layouts/portal/MainLayouts';
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
};

type OperatorsPageProps = {
    operators?: Operator[];
};

export default function Operators() {
    const { operators = [] } = usePage<OperatorsPageProps>().props;
    const [query, setQuery] = useState('');

    const filteredOperators = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return operators;

        return operators.filter((operator) => {
            return (
                operator.name.toLowerCase().includes(q) ||
                (operator.email ?? '').toLowerCase().includes(q) ||
                (operator.username ?? '').toLowerCase().includes(q) ||
                (operator.company_name ?? '').toLowerCase().includes(q)
            );
        });
    }, [operators, query]);

    return (
        <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6B9071' }}>
                        Operations
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#0F2A1D' }}>
                        Operator List
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: '#375534' }}>
                        Browse accredited external operators in Badian.
                    </p>
                </div>

                <div className="rounded-2xl p-5 md:p-6 mb-8" style={{ backgroundColor: '#fff', border: '1px solid #AEC3B0' }}>
                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B9071' }}>
                        Search operators
                    </label>
                    <div className="mt-2">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, email, username, or company..."
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: '#E3EED4',
                                border: '1px solid #AEC3B0',
                                color: '#0F2A1D',
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: '#0F2A1D' }}>
                        Showing {filteredOperators.length} operator{filteredOperators.length === 1 ? '' : 's'}
                    </h2>
                </div>

                {filteredOperators.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px dashed #AEC3B0' }}>
                        <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                            No operators found.
                        </p>
                        <p className="text-xs mt-2" style={{ color: '#6B9071' }}>
                            Try a different search keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredOperators.map((operator) => (
                            <div
                                key={operator.id}
                                className="rounded-2xl p-6 shadow-md"
                                style={{ backgroundColor: '#D8E7D8', border: '1px solid #7D9F83' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                                        style={{ backgroundColor: '#375534', color: '#E3EED4' }}
                                    >
                                        {(operator.name?.charAt(0) ?? 'O').toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold truncate" style={{ color: '#0F2A1D' }}>
                                            {operator.name}
                                        </h3>
                                        <p className="text-xs truncate" style={{ color: '#2E4A35' }}>
                                            @{operator.username ?? 'operator'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2 text-sm" style={{ color: '#2E4A35' }}>
                                    <p className="truncate">
                                        <span className="font-semibold">Email:</span> {operator.email}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-semibold">Company:</span> {operator.company_name ?? 'N/A'}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-semibold">Contact:</span> {operator.contact_number ?? 'N/A'}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-semibold">Address:</span> {operator.office_address ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Operators.layout = (page: ReactNode) => <MainLayout children={page} />;
