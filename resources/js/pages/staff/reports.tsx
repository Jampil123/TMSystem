import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    BarChart3, TrendingUp, Users, DollarSign, Calendar, Clock,
    MapPin, RefreshCw, Download, ArrowUp, Building2, Globe, Home,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'Reports & Analytics', href: '/staff/reports' },
];

interface CapacityRule {
    max_visitors: number;
    warning_threshold_percent: number;
    critical_threshold_percent: number;
    max_guests_per_guide: number;
    max_daily_visitors: number;
}

interface Attraction {
    id: number;
    name: string;
    location: string | null;
    category: string | null;
}

interface Props {
    attraction: Attraction;
    capacityRule: CapacityRule;
}

interface DailyRow {
    date: string;
    label: string;
    arrivals: number;
    visitors: number;
    revenue: number;
}

interface HourlyRow {
    hour: number;
    label: string;
    visitors: number;
}

interface Summary {
    today_revenue: number;
    today_visitors: number;
    today_arrivals: number;
    week_revenue: number;
    week_visitors: number;
    month_revenue: number;
    month_visitors: number;
}

interface ReportData {
    attraction: { id: number; name: string; entry_fee: number };
    summary: Summary;
    daily_trend: DailyRow[];
    hourly_traffic: HourlyRow[];
    visitor_types: { local: number; foreign: number; total: number };
    busiest_days: { date: string; visitors: number }[];
}

const fmt = (n: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);

const fmtN = (n: number) => new Intl.NumberFormat().format(n);

export default function Reports({ attraction, capacityRule }: Props) {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/staff/api/reports');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                setLastUpdated(new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }));
            }
        } catch (e) {
            console.error('Error fetching reports:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Derived values
    const revenue = period === 'today'
        ? data?.summary.today_revenue ?? 0
        : period === 'week'
        ? data?.summary.week_revenue ?? 0
        : data?.summary.month_revenue ?? 0;

    const visitors = period === 'today'
        ? data?.summary.today_visitors ?? 0
        : period === 'week'
        ? data?.summary.week_visitors ?? 0
        : data?.summary.month_visitors ?? 0;

    // Chart helpers
    const maxDailyVisitors = Math.max(...(data?.daily_trend.map(d => d.visitors) ?? [1]), 1);
    const maxHourlyVisitors = Math.max(...(data?.hourly_traffic.map(h => h.visitors) ?? [1]), 1);
    const localPct = data ? Math.round((data.visitor_types.local / Math.max(data.visitor_types.total, 1)) * 100) : 0;
    const foreignPct = 100 - localPct;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">

                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-6 text-white shadow-lg flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <BarChart3 className="w-7 h-7" />
                            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                        </div>
                        <p className="text-[#E3EED4] text-sm">Revenue and visitor analytics for {attraction.name}</p>
                        {lastUpdated && (
                            <p className="text-[#AEC3B0] text-xs mt-1">Last updated: {lastUpdated}</p>
                        )}
                    </div>
                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Attraction Info */}
                <div className="flex items-center gap-3 bg-white dark:bg-[#0F2A1D] rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 px-5 py-3 shadow-sm">
                    <Building2 className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0]" />
                    <div className="flex-1">
                        <p className="font-semibold text-[#0F2A1D] dark:text-white">{attraction.name}</p>
                        {attraction.location && (
                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {attraction.location}
                            </p>
                        )}
                    </div>
                    {data && (
                        <Badge className="bg-[#E3EED4] text-[#375534] dark:bg-[#375534]/40 dark:text-[#AEC3B0] font-semibold">
                            Entry Fee: {fmt(data.attraction.entry_fee)}
                        </Badge>
                    )}
                </div>

                {/* Period Toggle */}
                <div className="flex gap-2 bg-white dark:bg-[#0F2A1D] rounded-xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 p-1 w-fit shadow-sm">
                    {(['today', 'week', 'month'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                                period === p
                                    ? 'bg-[#375534] text-white shadow'
                                    : 'text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#1a3a2a]'
                            }`}
                        >
                            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                        </button>
                    ))}
                </div>

                {loading && !data ? (
                    <div className="flex items-center justify-center py-20 text-[#6B8071] dark:text-[#AEC3B0]">
                        <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading analytics...
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Revenue */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] font-medium">Revenue</p>
                                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmt(revenue)}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1 capitalize">
                                    {period === 'today' ? 'Today' : period === 'week' ? 'This week' : 'This month'}
                                </p>
                            </div>

                            {/* Visitors */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] font-medium">Visitors</p>
                                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmtN(visitors)}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">Total guests</p>
                            </div>

                            {/* Today Arrivals */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] font-medium">Arrivals Today</p>
                                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmtN(data?.summary.today_arrivals ?? 0)}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">Scanned QR codes</p>
                            </div>

                            {/* Entry Fee */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] font-medium">Entry Fee</p>
                                    <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-[#0F2A1D] dark:text-white">{fmt(data?.attraction.entry_fee ?? 0)}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] mt-1">Per visitor</p>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Daily Trend — last 14 days */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0]" />
                                    <h2 className="text-base font-semibold text-[#0F2A1D] dark:text-white">Daily Visitor Trend — Last 14 Days</h2>
                                </div>
                                {(data?.daily_trend.length ?? 0) === 0 ? (
                                    <div className="flex items-center justify-center h-40 text-[#6B8071] dark:text-[#AEC3B0] text-sm">No data yet</div>
                                ) : (
                                    <div className="space-y-2">
                                        {data!.daily_trend.map((row) => {
                                            const barPct = Math.round((row.visitors / maxDailyVisitors) * 100);
                                            return (
                                                <div key={row.date} className="flex items-center gap-3 text-xs">
                                                    <span className="w-12 text-right text-[#6B8071] dark:text-[#AEC3B0] shrink-0">{row.label}</span>
                                                    <div className="flex-1 h-5 bg-[#E3EED4] dark:bg-[#1a3a2a] rounded overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#375534] to-[#6B8071] rounded transition-all duration-300"
                                                            style={{ width: `${Math.max(barPct, row.visitors > 0 ? 2 : 0)}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-10 text-right font-semibold text-[#0F2A1D] dark:text-white shrink-0">{fmtN(row.visitors)}</span>
                                                    <span className="w-20 text-right text-green-700 dark:text-green-400 shrink-0">{fmt(row.revenue)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Visitor Type Breakdown */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0]" />
                                    <h2 className="text-base font-semibold text-[#0F2A1D] dark:text-white">Visitor Types</h2>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    {/* Donut-style visual */}
                                    <div className="relative w-32 h-32">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E3EED4" strokeWidth="3" />
                                            {/* Local */}
                                            <circle
                                                cx="18" cy="18" r="15.9" fill="none"
                                                stroke="#375534" strokeWidth="3"
                                                strokeDasharray={`${localPct} ${100 - localPct}`}
                                                strokeDashoffset="0"
                                            />
                                            {/* Foreign */}
                                            <circle
                                                cx="18" cy="18" r="15.9" fill="none"
                                                stroke="#6B8071" strokeWidth="3"
                                                strokeDasharray={`${foreignPct} ${100 - foreignPct}`}
                                                strokeDashoffset={`${-localPct}`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-[#0F2A1D] dark:text-white">{fmtN(data?.visitor_types.total ?? 0)}</p>
                                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Total</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 text-sm">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#E3EED4]/60 dark:bg-[#1a3a2a]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#375534]" />
                                                <Home className="w-3.5 h-3.5 text-[#375534]" />
                                                <span className="text-[#0F2A1D] dark:text-white font-medium">Local</span>
                                            </div>
                                            <span className="font-bold text-[#0F2A1D] dark:text-white">{fmtN(data?.visitor_types.local ?? 0)} <span className="text-xs font-normal text-[#6B8071]">({localPct}%)</span></span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#E3EED4]/60 dark:bg-[#1a3a2a]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#6B8071]" />
                                                <Globe className="w-3.5 h-3.5 text-[#6B8071]" />
                                                <span className="text-[#0F2A1D] dark:text-white font-medium">Foreign</span>
                                            </div>
                                            <span className="font-bold text-[#0F2A1D] dark:text-white">{fmtN(data?.visitor_types.foreign ?? 0)} <span className="text-xs font-normal text-[#6B8071]">({foreignPct}%)</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hourly Traffic Today */}
                        <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0]" />
                                <h2 className="text-base font-semibold text-[#0F2A1D] dark:text-white">Hourly Traffic — Today</h2>
                            </div>
                            <div className="flex items-end gap-2 h-28">
                                {data?.hourly_traffic.map((h) => {
                                    const heightPct = Math.round((h.visitors / maxHourlyVisitors) * 100);
                                    return (
                                        <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-xs font-semibold text-[#0F2A1D] dark:text-white">{h.visitors > 0 ? h.visitors : ''}</span>
                                            <div className="w-full flex items-end" style={{ height: '72px' }}>
                                                <div
                                                    className={`w-full rounded-t transition-all duration-300 ${
                                                        h.visitors === 0 ? 'bg-[#E3EED4] dark:bg-[#1a3a2a]' : 'bg-gradient-to-t from-[#375534] to-[#6B8071]'
                                                    }`}
                                                    style={{ height: `${Math.max(heightPct, h.visitors > 0 ? 8 : 4)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{h.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Revenue Summary + Busiest Days */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Revenue Summary Table */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <h2 className="text-base font-semibold text-[#0F2A1D] dark:text-white">Revenue Summary</h2>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Today', visitors: data?.summary.today_visitors ?? 0, revenue: data?.summary.today_revenue ?? 0, color: 'bg-green-500' },
                                        { label: 'This Week', visitors: data?.summary.week_visitors ?? 0, revenue: data?.summary.week_revenue ?? 0, color: 'bg-blue-500' },
                                        { label: 'This Month', visitors: data?.summary.month_visitors ?? 0, revenue: data?.summary.month_revenue ?? 0, color: 'bg-purple-500' },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center justify-between p-3 rounded-lg bg-[#E3EED4]/40 dark:bg-[#1a3a2a]">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                                                <span className="text-sm font-medium text-[#0F2A1D] dark:text-white">{row.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-700 dark:text-green-400">{fmt(row.revenue)}</p>
                                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">{fmtN(row.visitors)} visitors</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Busiest Days */}
                            <div className="bg-white dark:bg-[#0F2A1D] rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <ArrowUp className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-base font-semibold text-[#0F2A1D] dark:text-white">Top 5 Busiest Days</h2>
                                </div>
                                {(data?.busiest_days.length ?? 0) === 0 ? (
                                    <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0] text-center py-6">No historical data yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data!.busiest_days.map((day, idx) => (
                                            <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-[#E3EED4]/40 dark:bg-[#1a3a2a]">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-[#6B8071]'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm text-[#0F2A1D] dark:text-white font-medium">
                                                        {new Date(day.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-[#0F2A1D] dark:text-white">{fmtN(day.visitors)}</p>
                                                    <p className="text-xs text-green-700 dark:text-green-400">{fmt((data?.attraction.entry_fee ?? 0) * day.visitors)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
