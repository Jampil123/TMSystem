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
                background: 'linear-gradient(180deg, #173826 0%, #1f4430 40%, #2b3f31 100%)',
                border: '1px solid rgba(214, 232, 216, 0.22)',
            }}
        >
            {/* Top brand */}
            <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(214, 232, 216, 0.22)' }}>
                <div className="flex items-center gap-3">
                    <div
                        className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(221, 236, 220, 0.18)', border: '1px solid rgba(221, 236, 220, 0.28)' }}
                    >
                        <span className="font-bold text-[#F4FAF1]">α</span>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#F4FAF1] truncate">Suroy-Badian</div>
                            <div className="text-xs text-[#C7DAC9] truncate">Tourism Dashboard</div>
                        </div>
                    )}
                    <button
                        type="button"
                        className="ml-auto h-9 w-9 rounded-xl grid place-items-center transition-colors"
                        style={{ color: '#D3E6D2' }}
                        onClick={onToggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand' : 'Collapse'}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(221, 236, 220, 0.16)';
                            e.currentTarget.style.color = '#F4FAF1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#D3E6D2';
                        }}
                    >
                        <span className="text-sm font-semibold">{collapsed ? '»' : '«'}</span>
                    </button>
                </div>

                {/* Search */}
                {!collapsed && (
                    <div className="mt-4 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C7DAC9]" />
                        <input
                            placeholder="Quick search"
                            className="w-full pl-9 pr-3 py-2.5 rounded-2xl text-sm outline-none"
                            style={{
                                backgroundColor: 'rgba(244, 250, 241, 0.1)',
                                border: '1px solid rgba(214, 232, 216, 0.3)',
                                color: '#F4FAF1',
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
                                    style={
                                        active
                                            ? {
                                                  backgroundColor: 'rgba(184, 221, 186, 0.35)',
                                                  boxShadow: '0 0 0 1px rgba(214, 232, 216, 0.5), 0 10px 20px rgba(5, 29, 16, 0.22)',
                                              }
                                            : { backgroundColor: 'rgba(244, 250, 241, 0.08)' }
                                    }
                                >
                                    <Icon className="w-5 h-5 text-[#E7F2E3]" />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {SECTIONS.map((section) => (
                            <div key={section.title}>
                                <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#B8CCB8]">
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
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 hover:bg-[#D8EAD8]/15"
                                                style={
                                                    active
                                                        ? {
                                                              backgroundColor: 'rgba(184, 221, 186, 0.3)',
                                                              color: '#F4FAF1',
                                                              boxShadow: '0 0 0 1px rgba(214, 232, 216, 0.5), 0 8px 18px rgba(7, 34, 20, 0.24)',
                                                          }
                                                        : { backgroundColor: 'transparent', color: '#D5E5D4' }
                                                }
                                            >
                                                <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#F1FAEE]' : 'text-[#C4D8C4]'}`} />
                                                <span className="truncate">{item.label}</span>
                                                {(typeof badgeValue === 'number' ? badgeValue >= 0 : Boolean(item.badge)) && (
                                                    <span
                                                        className="ml-auto text-xs px-2 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: active ? 'rgba(20, 59, 35, 0.55)' : 'rgba(244, 250, 241, 0.12)',
                                                            color: active ? '#EBF7E7' : '#D5E5D4',
                                                            border: active ? '1px solid rgba(191, 224, 192, 0.45)' : '1px solid rgba(214, 232, 216, 0.22)',
                                                        }}
                                                    >
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
            <div className="px-3 py-4 relative" style={{ borderTop: '1px solid rgba(214, 232, 216, 0.22)' }}>
                <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="w-full rounded-2xl px-3 py-2.5 transition-colors"
                    style={{ backgroundColor: 'rgba(244, 250, 241, 0.1)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full grid place-items-center bg-[#D5E7D5]/25 text-[#F4FAF1] text-sm font-semibold flex-shrink-0 border border-[#D5E7D5]/35">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 text-left">
                                <div className="text-sm font-medium text-[#F4FAF1] truncate">{displayName}</div>
                                <div className="text-xs text-[#C7DAC9] truncate">{displayEmail}</div>
                            </div>
                        )}
                        {!collapsed && (
                            <ChevronDown
                                className={`ml-auto w-4 h-4 text-[#C7DAC9] transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </div>
                </button>

                {profileOpen && (
                    <div
                        className="absolute left-3 right-3 bottom-[76px] rounded-2xl p-2 space-y-1"
                        style={{
                            backgroundColor: '#213b2c',
                            border: '1px solid rgba(214, 232, 216, 0.25)',
                        }}
                    >
                        <Link
                            href="/badian-portal/dashboard#profile"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#E2F1DE] hover:bg-[#D8EAD8]/15 transition-colors"
                        >
                            <User className="w-4 h-4 text-[#C7DAC9]" />
                            Profile
                        </Link>
                        <Link
                            href="/badian-portal/dashboard#settings"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#E2F1DE] hover:bg-[#D8EAD8]/15 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-[#C7DAC9]" />
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

