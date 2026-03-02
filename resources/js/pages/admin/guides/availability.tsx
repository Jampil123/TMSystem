import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guide Management', href: '/guides' },
    { title: 'Availability Tracking', href: '/guides/availability' },
];

interface Props {
    availabilities: Array<{
        id: number;
        guide: { id: number; name: string };
        start_date: string;
        end_date: string;
        full_day: boolean;
        status: string;
        notes: string | null;
    }>;
    guides: Array<{ id: number; full_name: string }>;
    filters: { guide_id: string; status: string; date: string };
    pagination: any;
}

export default function GuideAvailability({ availabilities, guides, filters, pagination }: Props) {
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({
        guide_id: filters.guide_id || '',
        start_date: '',
        end_date: '',
        full_day: false,
        status: 'Available',
        notes: '',
    });
    const [filterData, setFilterData] = React.useState({
        guide_id: filters.guide_id || '',
        status: filters.status || 'all',
        date: filters.date || '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/guides/availability', filterData, { preserveState: true });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as any;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as any;
        setFilterData(prev => ({ ...prev, [name]: value }));
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/guides/availability', form, {
            onSuccess: () => {
                setShowForm(false);
                setForm({ guide_id: '', start_date: '', end_date: '', full_day: false, status: 'Available', notes: '' });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guide Availability" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/guides"
                        className="p-2 hover:bg-[#AEC3B0]/20 dark:hover:bg-[#375534]/20 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#375534] dark:text-[#E3EED4]" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#375534] dark:text-[#E3EED4]">
                            Availability Tracking
                        </h1>
                        <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">
                            Manage guide schedules and availability.
                        </p>
                    </div>
                </div>

                {/* Filters & actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap gap-3">
                        <select
                            name="guide_id"
                            value={filterData.guide_id}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                        >
                            <option value="">All Guides</option>
                            {guides.map(g => (
                                <option key={g.id} value={g.id}>{g.full_name}</option>
                            ))}
                        </select>
                        <select
                            name="status"
                            value={filterData.status}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                        >
                            <option value="all">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                        <input
                            type="date"
                            name="date"
                            value={filterData.date}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {showForm ? 'Cancel' : 'Add Availability'}
                    </button>
                </div>

                {/* New availability form */}
                {showForm && (
                    <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm p-6">
                        <form onSubmit={submitForm} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">Guide *</label>
                                    <select
                                        name="guide_id"
                                        value={form.guide_id}
                                        onChange={handleInput}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                    >
                                        <option value="">Select guide</option>
                                        {guides.map(g => (
                                            <option key={g.id} value={g.id}>{g.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">Status *</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleInput}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                    >
                                        <option>Available</option>
                                        <option>Unavailable</option>
                                        <option>On Leave</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">Start Date *</label>
                                    <input
                                        type="datetime-local"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleInput}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">End Date *</label>
                                    <input
                                        type="datetime-local"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleInput}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="full_day"
                                    checked={form.full_day}
                                    onChange={handleInput}
                                    className="accent-[#375534]"
                                />
                                <span className="text-sm text-[#0F2A1D] dark:text-[#E3EED4]">Full day</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#0F2A1D] dark:text-[#E3EED4]">Notes</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleInput}
                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-[#E3EED4]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#375534] text-white rounded-lg hover:bg-[#2d4227] transition-colors"
                            >
                                Save
                            </button>
                        </form>
                    </div>
                )}

                {/* Table of availabilities */}
                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-sm overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F8FAFB] dark:bg-[#1a3a2e]">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Guide</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Start</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">End</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Notes</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availabilities.length ? (
                                availabilities.map(avail => (
                                    <tr key={avail.id} className="border-t border-[#AEC3B0]/40 dark:border-[#375534]/40">
                                        <td className="px-6 py-3 text-[#0F2A1D] dark:text-[#E3EED4]">{avail.guide.name}</td>
                                        <td className="px-6 py-3 text-[#0F2A1D] dark:text-[#E3EED4]">{avail.start_date}</td>
                                        <td className="px-6 py-3 text-[#0F2A1D] dark:text-[#E3EED4]">{avail.end_date}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${avail.status === 'Available' ? 'bg-green-100 text-green-700' : avail.status === 'Unavailable' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {avail.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-[#0F2A1D] dark:text-[#E3EED4]">{avail.notes || '-'}</td>
                                        <td className="px-6 py-3 flex gap-2">
                                            {/* future edit/delete buttons */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[#0F2A1D] dark:text-[#E3EED4]">
                                        No availability records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination could go here if needed */}
            </div>
        </AppLayout>
    );
}
