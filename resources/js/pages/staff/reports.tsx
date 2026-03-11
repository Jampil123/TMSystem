import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BarChart3, Clock } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Dashboard', href: '/staff-dashboard' },
    { title: 'Reports', href: '/staff/reports' },
];

export default function Reports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="rounded-2xl bg-gradient-to-r from-[#6B8071] to-[#375534] p-8 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">Reports</h1>
                    </div>
                    <p className="text-[#E3EED4]">Generate and view operational reports</p>
                </div>

                <div className="rounded-2xl border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#0F2A1D] shadow-md p-8">
                    <div className="flex items-center justify-center gap-4 py-12">
                        <Clock className="w-12 h-12 text-[#6B8071] opacity-50" />
                        <div>
                            <p className="text-lg font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">Coming Soon</p>
                            <p className="text-sm text-[#6B8071] dark:text-[#AEC3B0]">Reports features are under development</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
