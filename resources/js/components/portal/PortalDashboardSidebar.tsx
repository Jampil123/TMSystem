import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Bell,
    Building2,
    ChevronDown,
    Compass,
    Grid2X2,
    Layers,
    LogOut,
    Hotel,
    Search,
    Settings,
    User,
} from 'lucide-react';

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
};

type NavSection = {
    title: string;
    items: NavItem[];
};

const SECTIONS: NavSection[] = [
    {
        title: 'Operations',
        items: [
            { label: 'Operator List', href: '/badian-portal/operators', icon: Grid2X2 },
            { label: 'Services', href: '/badian-portal/services', icon: Compass, badge: '12' },
            { label: 'Accomodations', href: '/badian-portal/accomodations', icon: Hotel, badge: '12' },
        ],
    },
    {
        title: 'Monitoring',
        items: [
            { label: 'Crowd Identifier', href: '/badian-portal/crowd-identifier', icon: Building2, badge: '12' },
        ],
    },
    {
        title: 'Notifications',
        items: [
            { label: 'Notifications', href: '/badian-portal/notifications', icon: Bell, badge: '12' },
        ],
    },
];

type PortalDashboardSidebarProps = {
    collapsed?: boolean;
    onToggleCollapsed?: () => void;
};

export default function PortalDashboardSidebar({ collapsed = false, onToggleCollapsed }: PortalDashboardSidebarProps) {
    const { url, props } = usePage<{
        auth?: {
            user?: {
                name?: string;
                email?: string;
            } | null;
        };
        portal?: {
            navCounts?: Record<string, number>;
        };
    }>();
    const [profileOpen, setProfileOpen] = useState(false);
    const user = props.auth?.user;
    const displayName = user?.name ?? 'Portal User';
    const displayEmail = user?.email ?? 'portal@example.com';
    const navCounts = props.portal?.navCounts ?? {};

    const isActive = (href: string) => {
        if (href.includes('#')) {
            const [base] = href.split('#');
            return url === base || url.startsWith(`${base}#`) || url.startsWith(`${base}?`) || url.startsWith(base);
        }
        return url === href;
    };

    const flatItems = useMemo(() => SECTIONS.flatMap((s) => s.items), []);

    return (
        <aside
            className="flex flex-col overflow-hidden"
            style={{
                width: collapsed ? 88 : 300,
                height: '100vh',
                maxHeight: '100vh',
                background: 'linear-gradient(180deg, #0b1220 0%, #070b12 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Top brand */}
            <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                        <span className="font-bold text-white">α</span>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">Suroy-Badian</div>
                            <div className="text-xs text-white/60 truncate">Tourism Dashboard</div>
                        </div>
                    )}
                    <button
                        type="button"
                        className="ml-auto h-9 w-9 rounded-xl grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={onToggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        <span className="text-sm font-semibold">{collapsed ? '»' : '«'}</span>
                    </button>
                </div>

                {/* Search */}
                {!collapsed && (
                    <div className="mt-4 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            placeholder="Quick search"
                            className="w-full pl-9 pr-3 py-2.5 rounded-2xl text-sm outline-none"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'white',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden px-3 py-4">
                {collapsed ? (
                    <div className="flex flex-col gap-2">
                        {flatItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className="h-11 w-11 rounded-2xl grid place-items-center transition-colors"
                                    style={active ? { backgroundColor: 'rgba(255,255,255,0.14)' } : { backgroundColor: 'rgba(255,255,255,0.06)' }}
                                >
                                    <Icon className="w-5 h-5 text-white/80" />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {SECTIONS.map((section) => (
                            <div key={section.title}>
                                <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                                    {section.title}
                                </div>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        const badgeValue = navCounts[item.href];
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                                                style={
                                                    active
                                                        ? { backgroundColor: 'rgba(255,255,255,0.14)', color: 'white' }
                                                        : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.78)' }
                                                }
                                            >
                                                <Icon className="w-4.5 h-4.5 text-white/70" />
                                                <span className="truncate">{item.label}</span>
                                                {(typeof badgeValue === 'number' ? badgeValue >= 0 : Boolean(item.badge)) && (
                                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                                                        {typeof badgeValue === 'number' ? badgeValue : item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer user dropdown */}
            <div className="px-3 py-4 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="w-full rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full grid place-items-center bg-white/15 text-white text-sm font-semibold flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 text-left">
                                <div className="text-sm font-medium text-white truncate">{displayName}</div>
                                <div className="text-xs text-white/60 truncate">{displayEmail}</div>
                            </div>
                        )}
                        {!collapsed && (
                            <ChevronDown
                                className={`ml-auto w-4 h-4 text-white/70 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </div>
                </button>

                {profileOpen && (
                    <div
                        className="absolute left-3 right-3 bottom-[76px] rounded-2xl p-2 space-y-1"
                        style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        <Link
                            href="/badian-portal/dashboard#profile"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/85 hover:bg-white/10 transition-colors"
                        >
                            <User className="w-4 h-4 text-white/70" />
                            Profile
                        </Link>
                        <Link
                            href="/badian-portal/dashboard#settings"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/85 hover:bg-white/10 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-white/70" />
                            Settings
                        </Link>
                        <Link
                            href="/badian-portal/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                            <LogOut className="w-4 h-4 text-red-300" />
                            Log out
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}

