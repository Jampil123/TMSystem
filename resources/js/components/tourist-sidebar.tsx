import { Link, usePage } from '@inertiajs/react';
import { Search, Compass, CreditCard, User, Settings, LogOut, ChevronDown, Map, AlertTriangle, Home, BarChart3, Zap, Building2, Users, BookOpen } from 'lucide-react';
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
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get user initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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
                
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarMenu className="space-y-2">
                    {/* Home Menu */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist-dashboard"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <Home className="w-5 h-5 text-[#6B8071] group-hover:text-[#375534] transition-colors" />
                            <span>Home</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Activities */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/activities"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <Zap className="w-5 h-5 text-[#6B8071] group-hover:text-[#375534] transition-colors" />
                            <span>Activities</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Attractions */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/attractions"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <Map className="w-5 h-5 text-[#6B8071] group-hover:text-[#375534] transition-colors" />
                            <span>Attractions</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Accommodations */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/accommodations"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <Building2 className="w-5 h-5 text-[#6B8071] group-hover:text-[#375534] transition-colors" />
                            <span>Accommodations</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Operators */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/operators"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <Users className="w-5 h-5 text-[#6B8071] group-hover:text-[#375534] transition-colors" />
                            <span>Operators</span>
                        </Link>
                    </SidebarMenuItem>

                    {/* Crowd Identifier */}
                    <SidebarMenuItem>
                        <Link
                            href="/tourist/crowd-identifier"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 text-[#0F2A1D] dark:text-[#E3EED4] font-medium transition-colors group"
                        >
                            <AlertTriangle className="w-5 h-5 text-[#6B8071] group-hover:text-[#375534] transition-colors" />
                            <span>Crowd Identifier</span>
                        </Link>
                    </SidebarMenuItem>

              
                </SidebarMenu>
            </SidebarContent>

            {/* User Footer */}
            <SidebarFooter className="border-t border-[#AEC3B0]/20 dark:border-[#375534]/20 p-4">
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors group"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#375534] dark:bg-[#375534] flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                            {getInitials(auth?.user?.name || 'U')}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-[#0F2A1D] dark:text-white truncate">
                                {auth?.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-[#6B8071] dark:text-[#AEC3B0] truncate">
                                Tourist
                            </p>
                        </div>

                        {/* Dropdown Indicator */}
                        <ChevronDown
                            className={`w-4 h-4 text-[#6B8071] group-hover:text-[#375534] transition-transform duration-300 flex-shrink-0 ${
                                showUserMenu ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1a3a2e] border border-[#AEC3B0]/40 dark:border-[#375534]/40 rounded-lg shadow-lg overflow-hidden z-50">
                            <Link
                                href="/tourist/profile-management"
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#0F2A1D] dark:text-white hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors"
                                onClick={() => setShowUserMenu(false)}
                            >
                                <Settings className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                <span>Settings</span>
                            </Link>
                            <button
                                onClick={() => {
                                    setShowUserMenu(false);
                                    // Logout functionality - you can use Inertia's logout method
                                    window.location.href = '/logout';
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#0F2A1D] dark:text-white hover:bg-[#E3EED4] dark:hover:bg-[#375534]/30 transition-colors border-t border-[#AEC3B0]/20 dark:border-[#375534]/20"
                            >
                                <LogOut className="w-4 h-4 text-[#375534] dark:text-[#AEC3B0]" />
                                <span>Log out</span>
                            </button>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
