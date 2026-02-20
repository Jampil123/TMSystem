import { Link, usePage } from '@inertiajs/react';
import { Search, Compass, CreditCard, User, Settings, LogOut, ChevronDown, Map, AlertTriangle, BookOpen, BarChart3, Zap, Building2, Users } from 'lucide-react';
import { useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import AppLogo from './app-logo';

export function TouristSidebar() {
    const { auth } = usePage().props as any;
    const [expandedMenu, setExpandedMenu] = useState<string | null>('explore');

    const toggleMenu = (menuName: string) => {
        setExpandedMenu(expandedMenu === menuName ? null : menuName);
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-white dark:bg-[#0F2A1D] border-r border-[#AEC3B0]/40 dark:border-[#375534]/40">
            <SidebarHeader className="border-b border-[#AEC3B0]/20 dark:border-[#375534]/20 pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/tourist-dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Search Bar */}
                <div className="mt-4 px-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B8071] dark:text-[#AEC3B0]" />
                        <input
                            type="text"
                            placeholder="Search here..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#AEC3B0]/40 dark:border-[#375534]/40 bg-white dark:bg-[#1a3a2e] text-[#0F2A1D] dark:text-white placeholder-[#6B8071] dark:placeholder-[#AEC3B0] focus:outline-none focus:ring-2 focus:ring-[#C84B59]/50"
                        />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarMenu className="space-y-2">
                    {/* Explore Menu */}
                    <SidebarMenuItem>
                        <button
                            onClick={() => toggleMenu('explore')}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Compass className="w-5 h-5 text-[#6B8071] group-hover:text-[#C84B59] transition-colors" />
                                <span>Explore</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-[#6B8071] transition-transform duration-300 ${
                                    expandedMenu === 'explore' ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {/* Explore Sub-items */}
                        {expandedMenu === 'explore' && (
                            <div className="ml-8 space-y-2 mt-2">
                                <Link href="/tourist/activities" className="w-full text-left px-4 py-2 rounded-lg text-sm text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 hover:text-[#0F2A1D] dark:hover:text-white transition-colors flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Activities
                                </Link>
                                <Link href="/tourist/attractions" className="w-full text-left px-4 py-2 rounded-lg text-sm text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 hover:text-[#0F2A1D] dark:hover:text-white transition-colors flex items-center gap-2">
                                    <Map className="w-4 h-4" />
                                    Attractions
                                </Link>
                                <Link href="/tourist/accommodations" className="w-full text-left px-4 py-2 rounded-lg text-sm text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 hover:text-[#0F2A1D] dark:hover:text-white transition-colors flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Accommodations
                                </Link>
                                <Link href="/tourist/operators" className="w-full text-left px-4 py-2 rounded-lg text-sm text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 hover:text-[#0F2A1D] dark:hover:text-white transition-colors flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Operators
                                </Link>
                            </div>
                        )}
                    </SidebarMenuItem>

                    {/* Safety Menu */}
                    <SidebarMenuItem>
                        <button
                            onClick={() => toggleMenu('safety')}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-[#6B8071] group-hover:text-[#C84B59] transition-colors" />
                                <span>Safety</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-[#6B8071] transition-transform duration-300 ${
                                    expandedMenu === 'safety' ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {/* Safety Sub-items */}
                        {expandedMenu === 'safety' && (
                            <div className="ml-8 space-y-2 mt-2">
                                <Link href="/tourist/crowd-identifier" className="w-full text-left px-4 py-2 rounded-lg text-sm text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 hover:text-[#0F2A1D] dark:hover:text-white transition-colors flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Crowd Identifier
                                </Link>
                                <Link href="/tourist/incident-reporting" className="w-full text-left px-4 py-2 rounded-lg text-sm text-[#6B8071] dark:text-[#AEC3B0] hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 hover:text-[#0F2A1D] dark:hover:text-white transition-colors flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Incident Reporting
                                </Link>
                            </div>
                        )}
                    </SidebarMenuItem>

                    {/* Bookings Menu */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/booking-history"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <BookOpen className="w-5 h-5 text-[#6B8071] group-hover:text-[#C84B59] transition-colors" />
                            <span>Bookings</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Profile Menu */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/profile-management"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <User className="w-5 h-5 text-[#6B8071] group-hover:text-[#C84B59] transition-colors" />
                            <span>Profile</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Analytics Menu */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/reports-analytics"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <BarChart3 className="w-5 h-5 text-[#6B8071] group-hover:text-[#C84B59] transition-colors" />
                            <span>Analytics</span>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
