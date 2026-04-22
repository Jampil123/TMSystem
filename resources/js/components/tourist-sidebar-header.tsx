import { Phone, MessageCircle, Sparkles } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { NotificationBell } from '@/components/NotificationBell';
import type { SharedData } from '@/types';

export function TouristSidebarHeader() {
    const { auth } = usePage<SharedData>().props;
    const currentUrl = usePage().url;

    const getPageTitle = () => {
        if (currentUrl.includes('/accommodations')) {
            return 'Your Comfort First';
        } else if (currentUrl.includes('/attractions')) {
            return 'Discover Destination';
        } else if (currentUrl.includes('/activities')) {
            return 'Adventure Awaits';
        } else if (currentUrl.includes('/operators')) {
            return 'Meet Our Partners';
        } else if (currentUrl.includes('/crowd-identifier')) {
            return 'Crowd Levels';
        }
        return 'Welcome';
    };

    return (
        <header className="flex h-18 shrink-0 items-center justify-between gap-4 border-b border-[#AEC3B0]/40 dark:border-[#375534]/40 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-white dark:bg-[#0F2A1D]">
            {/* Left Section - Page Title */}
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#375534] dark:text-[#AEC3B0]" />
                <span className="text-lg font-semibold text-[#375534] dark:text-[#AEC3B0] uppercase tracking-wide">
                    {getPageTitle()}
                </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                

                {/* Divider */}
                <div className="h-5 w-px bg-[#AEC3B0]/40 dark:bg-[#375534]/40"></div>

                {/* Notification Bell */}
                <NotificationBell />
            </div>
        </header>
    );
}
