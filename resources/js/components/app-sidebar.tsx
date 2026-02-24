import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Compass, Zap, Building2, Home, User, FileText, Bell, Settings, ClipboardList, CheckCircle } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.role?.name === 'Admin';
    const isOperator = auth?.user?.role?.name === 'External Operator';
    // Determine whether the operator has all documents approved
    // Services and Guest Submission are only enabled when all documents are approved and uploaded
    const isApproved = auth?.documentsApproved === true;

    // default items for admin/other roles
    const defaultNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'User Management',
                      href: '/users',
                      icon: Users,
                  },
                  {
                      title: 'Operator Management',
                      href: '/operators',
                      icon: CheckCircle,
                  },
              ]
            : []),
        {
            title: 'Attraction Management',
            href: '/attractions',
            icon: Compass,
        },
        {
            title: 'Activity Management',
            href: '/activities',
            icon: Zap,
        },
        {
            title: 'Accommodation Management',
            href: '/accommodations',
            icon: Building2,
        },
    ];

    // items for external operator accounts
    const operatorNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/operator-dashboard',
            icon: Home,
        },
        {
            title: 'Profile',
            href: '/operator/profile',
            icon: User,
        },
        {
            title: 'Documents',
            href: '/operator/documents',
            icon: FileText,
        },
        {
            title: 'Services',
            href: '/operator/services',
            icon: Bell,
            disabled: !isApproved,
        },
        {
            title: 'Guest Submission',
            href: '/operator/guest-submission',
            icon: ClipboardList,
            disabled: !isApproved,
        },
        {
            title: 'Notifications',
            href: '/operator/notifications',
            icon: Bell,
        },
        {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ];

    const mainNavItems: NavItem[] = isOperator ? operatorNavItems : defaultNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label={isOperator ? 'Operator' : 'Platform'} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
