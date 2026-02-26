import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { Lock, ChevronRight } from 'lucide-react';
import type { NavItem } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[]; label?: string }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    // Check if this item has nested items
                    const hasNestedItems = item.items && item.items.length > 0;
                    const isActive = item.href ? isCurrentUrl(item.href) : false;
                    const childrenActive = item.items?.some(child => child.href && isCurrentUrl(child.href)) || false;

                    if (hasNestedItems) {
                        return (
                            <Collapsible key={item.title} asChild>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: item.disabled
                                                    ? `${item.title} (locked)`
                                                    : item.title,
                                            }}
                                            className={item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subItem.href ? isCurrentUrl(subItem.href) : false}
                                                        tooltip={{
                                                            children: subItem.disabled
                                                                ? `${subItem.title} (locked)`
                                                                : subItem.title,
                                                        }}
                                                    >
                                                        {subItem.disabled ? (
                                                            <span className="flex items-center gap-2 opacity-50 cursor-not-allowed pointer-events-none">
                                                                {subItem.icon && <subItem.icon className="w-4 h-4" />}
                                                                <span className="text-sm">{subItem.title}</span>
                                                                <Lock className="w-3 h-3 ml-auto" />
                                                            </span>
                                                        ) : (
                                                            <Link href={subItem.href || '#'} prefetch>
                                                                {subItem.icon && <subItem.icon className="w-4 h-4" />}
                                                                <span className="text-sm">{subItem.title}</span>
                                                            </Link>
                                                        )}
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{
                                    children: item.disabled
                                        ? `${item.title} (locked)`
                                        : item.title,
                                }}
                            >
                                {item.disabled ? (
                                    // render a non-interactive span when disabled
                                    <span className="flex items-center gap-2 opacity-50 cursor-not-allowed pointer-events-none">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <Lock className="w-4 h-4" />
                                    </span>
                                ) : (
                                    <Link href={item.href || '#'} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
