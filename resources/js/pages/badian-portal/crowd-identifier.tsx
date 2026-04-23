import MainLayout from '@/layouts/portal/MainLayouts';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

type CrowdRow = {
    id: number;
    name: string;
    location: string;
    category: string | null;
    current_tourists: number;
    max_visitors: number;
    utilization_percent: number;
    crowd_level: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Critical' | string;
};

type CrowdIdentifierProps = {
    crowdData?: CrowdRow[];
    asOfDate?: string;
};

export default function CrowdIdentifier() {
    const { crowdData = [], asOfDate } = usePage<CrowdIdentifierProps>().props;
    const rows = useMemo(() => crowdData, [crowdData]);

    const badgeStyle = (level: string) => {
        switch (level) {
            case 'Critical':
                return { bg: '#7F1D1D', color: '#FEE2E2' };
            case 'High':
                return { bg: '#9A3412', color: '#FFEDD5' };
            case 'Moderate':
                return { bg: '#854D0E', color: '#FEF9C3' };
            case 'Low':
                return { bg: '#166534', color: '#DCFCE7' };
            default:
                return { bg: '#14532D', color: '#DCFCE7' };
        }
    };

    const statusLabel = (level: string) => {
        switch (level) {
            case 'Critical':
                return 'Not Recommended';
            case 'High':
                return 'Busy';
            case 'Moderate':
                return 'Manageable';
            default:
                return 'Good Time';
        }
    };

    return (
        <div className="w-full" style={{ backgroundColor: '#E3EED4' }}>
            <div className="max-w-7xl mx-auto px-6 py-10">

                {rows.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px dashed #AEC3B0' }}>
                        <p className="text-sm font-semibold" style={{ color: '#375534' }}>
                            No crowd records found.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {rows.map((row) => {
                            const level = badgeStyle(row.crowd_level);
                            return (
                                <div
                                    key={row.id}
                                    className="rounded-2xl p-6 shadow-sm"
                                    style={{ backgroundColor: '#fff', border: '1px solid #E3EED4' }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm" style={{ color: '#6B9071' }}></span>
                                                <h3 className="text-base font-bold truncate" style={{ color: '#0F2A1D' }}>
                                                    {row.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-semibold"
                                            style={{ backgroundColor: level.bg, color: level.color }}
                                        >
                                            {row.crowd_level}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs mb-2" style={{ color: '#6B9071' }}>
                                            Crowd Percentage
                                        </p>
                                        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E3EED4' }}>
                                            <div
                                                className="h-full"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, row.utilization_percent))}%`,
                                                    backgroundColor: level.bg,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <p className="text-xs" style={{ color: '#6B9071' }}>
                                                👥 {row.current_tourists} guests
                                            </p>
                                            <p className="text-xs font-semibold" style={{ color: '#375534' }}>
                                                {row.utilization_percent}%
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <p className="text-xs" style={{ color: '#6B9071' }}>
                                                Capacity: {row.max_visitors > 0 ? row.max_visitors : 'N/A'}
                                            </p>
                                            <p className="text-xs font-semibold" style={{ color: '#0F2A1D' }}>
                                                {statusLabel(row.crowd_level)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Crowd Level Guide */}
                <div className="mt-8 rounded-2xl p-6" style={{ backgroundColor: '#fff', border: '1px solid #E3EED4' }}>
                    <h3 className="text-sm font-bold mb-4" style={{ color: '#0F2A1D' }}>
                        Crowd Level Guide
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        {[
                            { label: 'Low (0–35%)', color: '#16A34A' },
                            { label: 'Moderate (35–65%)', color: '#EAB308' },
                            { label: 'High (65–85%)', color: '#F97316' },
                            { label: 'Very High (85%+)', color: '#EF4444' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span style={{ color: '#375534' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

CrowdIdentifier.layout = (page: ReactNode) => <MainLayout children={page} />;
