import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BarChart3, Building2, Calendar, DollarSign, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Attraction {
    id: number;
    name: string;
    location?: string | null;
    category?: string | null;
}

interface Props {
    attractions: Attraction[];
}

interface ReportResponse {
    summary: {
        today_arrivals: number;
        today_visitors: number;
        today_revenue: number;
        week_visitors: number;
        week_revenue: number;
        month_visitors: number;
        month_revenue: number;
    };
    by_attraction: Array<{
        attraction_id: number;
        attraction_name: string;
        total_visitors: number;
        total_revenue: number;
        total_arrivals: number;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/lgu-dot-dashboard' },
    { title: 'Reports & Analytics', href: '/reports' },
];

const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount || 0);

const fmtNumber = (num: number) => new Intl.NumberFormat().format(num || 0);

export default function AdminReports({ attractions }: Props) {
    const [selectedAttraction, setSelectedAttraction] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [reportData, setReportData] = useState<ReportResponse | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const query =
                selectedAttraction !== 'all'
                    ? `?attraction_id=${encodeURIComponent(selectedAttraction)}`
                    : '';
            const res = await fetch(`/admin/api/reports${query}`);
            const json = await res.json();
            if (json?.success) {
                setReportData(json.data);
                setLastUpdated(new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }));
            }
        } catch (error) {
            console.error('Failed to fetch admin reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedAttraction]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Reports & Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-6 text-white shadow-lg flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <BarChart3 className="w-7 h-7" />
                            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                        </div>
                        <p className="text-[#E3EED4] text-sm">
                            General analytics with specific breakdown per attraction
                        </p>
                        {lastUpdated && <p className="text-[#AEC3B0] text-xs mt-1">Last updated: {lastUpdated}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedAttraction}
                            onChange={(e) => setSelectedAttraction(e.target.value)}
                            className="px-3 py-2 rounded-lg text-sm bg-white/20 border border-white/30 text-white"
                        >
                            <option value="all" className="text-black">All Attractions</option>
                            {attractions.map((attraction) => (
                                <option key={attraction.id} value={String(attraction.id)} className="text-black">
                                    {attraction.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Today Arrivals</p>
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmtNumber(reportData?.summary.today_arrivals ?? 0)}</p>
                    </div>

                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Today Visitors</p>
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmtNumber(reportData?.summary.today_visitors ?? 0)}</p>
                    </div>

                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">This Week Revenue</p>
                            <Calendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmtCurrency(reportData?.summary.week_revenue ?? 0)}</p>
                    </div>

                    <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">This Month Revenue</p>
                            <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmtCurrency(reportData?.summary.month_revenue ?? 0)}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0]" />
                        <h2 className="text-base font-semibold text-[#0F2A1D] dark:text-white">Per Attraction Breakdown</h2>
                    </div>

                    {loading ? (
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Loading analytics...</p>
                    ) : (reportData?.by_attraction?.length ?? 0) === 0 ? (
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">No report data yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-[#AEC3B0]/40">
                                        <th className="py-3 pr-4">Attraction</th>
                                        <th className="py-3 pr-4">Arrivals</th>
                                        <th className="py-3 pr-4">Visitors</th>
                                        <th className="py-3">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.by_attraction.map((row) => (
                                        <tr key={row.attraction_id} className="border-b border-[#AEC3B0]/20">
                                            <td className="py-3 pr-4 font-medium">{row.attraction_name}</td>
                                            <td className="py-3 pr-4">{fmtNumber(row.total_arrivals)}</td>
                                            <td className="py-3 pr-4">{fmtNumber(row.total_visitors)}</td>
                                            <td className="py-3 font-semibold text-green-700 dark:text-green-400">
                                                {fmtCurrency(row.total_revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
