import { Phone, MessageCircle } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { NotificationBell } from '@/components/NotificationBell';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import type { SharedData } from '@/types';

export function TouristSidebarHeader() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-[#AEC3B0]/40 dark:border-[#375534]/40 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-white dark:bg-[#0F2A1D]">
            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Contact Info */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                        <Phone className="w-4 h-4" />
                        <span>+2 025 234 9123</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B8071] dark:text-[#AEC3B0]">
                        <MessageCircle className="w-4 h-4" />
                        <span>info@ourwebsite.com</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-[#AEC3B0]/40 dark:bg-[#375534]/40"></div>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Divider */}
                <div className="h-6 w-px bg-[#AEC3B0]/40 dark:bg-[#375534]/40"></div>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#375534] to-[#6B8071] flex items-center justify-center text-white font-semibold text-sm">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#0F2A1D] dark:text-white">{auth.user.name}</p>
                                <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0]">Tourist</p>
                            </div>
                            <svg className="w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0] group-hover:text-[#0F2A1D] dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 rounded-lg bg-white dark:bg-[#0F2A1D] border border-[#AEC3B0]/40 dark:border-[#375534]/40"
                        align="end"
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
