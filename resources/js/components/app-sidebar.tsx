import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Compass, Zap, Building2, Home, User, FileText, Bell, Settings, ClipboardList, CheckCircle, Package, Plus, List, CheckCheck, Calendar, QrCode, LogIn, Eye, Users2, TrendingUp, BarChart3 } from 'lucide-react';
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
    const isStaff = auth?.user?.role?.name === 'Tourism Staff';
    // Determine whether the operator has all documents approved
    // Services and Guest Submission are only enabled when all documents are approved and uploaded
    const isApproved = auth?.documentsApproved === true;

    // default items for admin only
    const defaultNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
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
        {
            title: 'Service Management',
            icon: Package,
            items: [
                {
                    title: 'All Services',
                    href: '/services',
                    icon: List,
                },
                {
                    title: 'Pending Services',
                    href: '/services/pending',
                    icon: Bell,
                },
                {
                    title: 'Approved Services',
                    href: '/services/approved',
                    icon: CheckCheck,
                },
            ],
        },
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
        {
            title: 'Guide Management',
            icon: Users,
            items: [
                {
                    title: 'All Guides',
                    href: '/guides',
                    icon: List,
                },
                {
                    title: 'Availability Tracking',
                    href: '/guides/availability',
                    icon: Calendar,
                },
            ],
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
            icon: Package,
            disabled: !isApproved,
            items: [
                {
                    title: 'All Services',
                    href: '/operator/services',
                    icon: List,
                    disabled: !isApproved,
                },
                {
                    title: 'Create Service',
                    href: '/operator/services/create',
                    icon: Plus,
                    disabled: !isApproved,
                },
                {
                    title: 'Service Requests',
                    href: '/operator/services/requests',
                    icon: Bell,
                    disabled: !isApproved,
                },
            ],
        },
        {
            title: 'Guest Submission',
            href: '/operator/guest-submission',
            icon: ClipboardList,
            disabled: !isApproved,
        },
        {
            title: 'Alerts',
            href: '/operator/alerts',
            icon: Bell,
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

    // items for entrance staff accounts
    const staffNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/staff-dashboard',
            icon: Home,
        },
        {
            title: 'QR Code Scanner',
            href: '/staff/qr-scanner',
            icon: QrCode,
        },
        {
            title: 'Arrival Monitoring',
            href: '/staff/arrivals',
            icon: LogIn,
        },
        {
            title: 'Guide Verification',
            href: '/staff/guide-verification',
            icon: Eye,
        },
        {
            title: 'Real-Time Visitor Counter',
            href: '/staff/visitor-counter',
            icon: Users2,
        },
        {
            title: 'Entry Logs',
            href: '/staff/entry-logs',
            icon: ClipboardList,
        },
        {
            title: 'Capacity Monitoring',
            href: '/staff/capacity',
            icon: TrendingUp,
        },
        {
            title: 'Notifications',
            href: '/staff/notifications',
            icon: Bell,
        },
        {
            title: 'Reports',
            href: '/staff/reports',
            icon: BarChart3,
        },
    ];

    const mainNavItems: NavItem[] = isStaff ? staffNavItems : (isOperator ? operatorNavItems : defaultNavItems);

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
                <NavMain items={mainNavItems} label={isStaff ? 'Entrance Staff' : (isOperator ? 'Operator' : 'Platform')} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
