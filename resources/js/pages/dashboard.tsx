import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 bg-[#E3EED4] dark:bg-[#0F2A1D]">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-[#6B8071] dark:border-[#375534] bg-white dark:bg-[#1a3a2a]">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-[#6B8071]/20 dark:stroke-[#AEC3B0]/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-[#6B8071] dark:border-[#375534] bg-white dark:bg-[#1a3a2a]">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-[#6B8071]/20 dark:stroke-[#AEC3B0]/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-[#6B8071] dark:border-[#375534] bg-white dark:bg-[#1a3a2a]">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-[#6B8071]/20 dark:stroke-[#AEC3B0]/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border-2 border-[#6B8071] dark:border-[#375534] md:min-h-min bg-white dark:bg-[#1a3a2a]">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-[#6B8071]/20 dark:stroke-[#AEC3B0]/20" />
                </div>
            </div>
        </AppLayout>
    );
}
