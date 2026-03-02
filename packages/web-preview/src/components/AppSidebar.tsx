import { useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    useSidebar,
    Box,
    Inline,
    Small,
    Badge,
    cn,
} from "synthex-ui";
import {
    PackageIcon,
    PaletteIcon,
    SettingsIcon,
    TerminalIcon,
    LayoutTemplateIcon,
} from "synthex-ui/icons";

import { useTheme } from "synthex-ui/hooks";
import type { AccentPresetName } from "synthex-ui/theme";
import { accentPresets } from "synthex-ui/theme";
import { ThemeCustomizer } from "./ThemeCustomizer";

const navItems = [
    { label: "Overview", to: "/", icon: PackageIcon },
    { label: "Installation", to: "/installation", icon: TerminalIcon },
    { label: "Components", to: "/components", icon: LayoutTemplateIcon },
    { label: "Theme", to: "/theme", icon: PaletteIcon },
    { label: "Engine", to: "/engine", icon: SettingsIcon },
    { label: "Playground", to: "/playground", icon: LayoutTemplateIcon }, // Using LayoutTemplateIcon as fallback for GridIcon
] as const;

interface AppSidebarProps {
    readonly mode: "light" | "dark";
    readonly setMode: (mode: "light" | "dark") => void;
    readonly accentPreset: AccentPresetName;
    readonly setAccentPreset: (preset: AccentPresetName) => void;
    readonly radius: number;
    readonly setRadius: (radius: number) => void;
}

export function AppSidebar({
    mode,
    setMode,
    accentPreset,
    setAccentPreset,
    radius,
    setRadius,
}: AppSidebarProps) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { open, setOpen } = useSidebar();

    return (
        <Sidebar>
            <SidebarHeader className="p-0 border-none">
                <div className={cn(
                    "flex flex-col transition-all duration-300 ease-in-out",
                    open ? "p-4 gap-4" : "p-2"
                )}>
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                        {open ? (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-sm">
                                    <TerminalIcon size={18} />
                                </div>
                                <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-sm font-bold tracking-tight text-[color:var(--sx-color-foreground)]">Synthex UI</span>
                                    <span className="text-[10px] font-semibold text-[color:var(--sx-color-foreground-muted)] uppercase tracking-widest mt-0.5">v1.0 Release</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                aria-label="Expand Sidebar"
                                onClick={() => setOpen(true)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-sm transition-all hover:scale-110 active:scale-95 mx-auto mt-1"
                            >
                                <TerminalIcon size={18} />
                            </button>
                        )}
                        {open && (
                            <SidebarTrigger className="shrink-0 hover:bg-[color:var(--sx-color-surface-muted)] transition-colors" />
                        )}
                    </div>
                </div>
                <div className="h-px w-full bg-[color:var(--sx-color-border)] opacity-50" />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton
                                            active={isActive}
                                            onClick={() => {
                                                navigate(item.to);
                                                // Close sidebar on mobile navigation
                                                if (window.innerWidth < 768) {
                                                    setOpen(false);
                                                }
                                            }}
                                        >
                                            <Icon size={16} />
                                            <span
                                                className={cn(
                                                    "truncate transition-[width,opacity] duration-200",
                                                    open ? "w-auto opacity-100" : "w-0 opacity-0",
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-[color:var(--sx-color-border)]">
                <div className={cn("flex flex-1 items-center gap-2", !open && "justify-center")}>
                    <ThemeCustomizer
                        mode={mode}
                        setMode={setMode}
                        accentPreset={accentPreset}
                        setAccentPreset={setAccentPreset}
                        radius={radius}
                        setRadius={setRadius}
                    />
                    {open && (
                        <span className="text-xs font-medium text-[color:var(--sx-color-foreground-muted)] animate-in fade-in duration-200">
                            Theme Settings
                        </span>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
