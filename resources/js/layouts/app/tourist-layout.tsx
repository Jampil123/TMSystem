import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { TouristSidebar } from '@/components/tourist-sidebar';
import { TouristSidebarHeader } from '@/components/tourist-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function TouristLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <TouristSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <TouristSidebarHeader />
                {children}
            </AppContent>
        </AppShell>
    );
}
