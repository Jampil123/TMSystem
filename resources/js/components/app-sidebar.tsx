import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Compass, Home, User, FileText, Bell, Settings, ClipboardList, CheckCircle, Package, Plus, List, CheckCheck, Calendar, QrCode, LogIn, Eye, Users2, TrendingUp, BarChart3, Gauge, AlertTriangle } from 'lucide-react';
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
        // System Overview
        {
            section: 'System Overview',
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        // Management
        {
            section: 'Management',
            title: 'Operators',
            href: '/operators',
            icon: CheckCircle,
        },
        {
            section: 'Management',
            title: 'Guides',
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
        {
            section: 'Management',
            title: 'Services',
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
            section: 'Management',
            title: 'Attractions',
            href: '/attractions',
            icon: Compass,
        },
        // Communication
        {
            section: 'Communication',
            title: 'Notifications',
            href: '/settings/notifications',
            icon: Bell,
        },
        // System
        {
            section: 'System',
            title: 'Users',
            href: '/users',
            icon: Users,
        },
        {
            section: 'System',
            title: 'Settings',
            icon: Settings,
            items: [
                {
                    title: 'Capacity Rules',
                    href: '/settings/capacity-rules',
                    icon: Gauge,
                },
                {
                    title: 'Safety Alerts',
                    href: '/settings/safety-alerts',
                    icon: AlertTriangle,
                },
                {
                    title: 'Emergency Alerts',
                    href: '/settings/emergency-alerts',
                    icon: AlertTriangle,
                },
            ],
        },
        {
            section: 'System',
            title: 'Audit Logs',
            href: '/audit-logs',
            icon: ClipboardList,
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
            title: 'Scan QR',
            href: '/staff/qr-scanner',
            icon: QrCode,
        },
        {
            title: 'Arrival Logs',
            href: '/staff/arrivals',
            icon: LogIn,
        },
        {
            title: 'Visitor Monitoring',
            href: '/staff/visitor-counter',
            icon: Users2,
        },
        {
            title: 'Notifications',
            href: '/staff/notifications',
            icon: Bell,
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
