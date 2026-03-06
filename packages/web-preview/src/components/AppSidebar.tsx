import { useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    cn,
} from "synthex-ui";
import type { ThemeAccentName } from "synthex-ui/components";
import { NAV_ITEMS } from "../app/nav";
import { SidebarBrand } from "./sidebar/SidebarBrand";
import { SidebarThemeControl } from "./sidebar/SidebarThemeControl";

interface AppSidebarProps {
    readonly mode: "light" | "dark";
    readonly setMode: (mode: "light" | "dark") => void;
    readonly accentPreset: ThemeAccentName;
    readonly setAccentPreset: (preset: ThemeAccentName) => void;
}

export function AppSidebar({
    mode,
    setMode,
    accentPreset,
    setAccentPreset,
}: AppSidebarProps) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { open, setOpen } = useSidebar();

    return (
        <Sidebar className="data-[state=open]:w-[16rem] data-[state=closed]:w-[4.5rem]">
            <SidebarHeader className="border-none p-0">
                <SidebarBrand />
                <div className="h-px w-full bg-[color:var(--sx-color-border)]/70" />
            </SidebarHeader>

            <SidebarContent className={cn(open ? "px-3 py-4" : "px-2 py-4")}>
                <SidebarGroup className="gap-3">
                    {open && (
                        <SidebarGroupLabel className="px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
                            Navigation
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <SidebarMenu className={cn("gap-1.5", !open && "items-center")}>
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.to} className={cn(!open && "w-full flex justify-center")}>
                                        <SidebarMenuButton
                                            active={isActive}
                                            className={cn(
                                                "min-h-11 rounded-[18px] border border-transparent px-3 text-[15px] font-medium transition-all duration-200",
                                                isActive
                                                    ? "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-accent)] text-[color:var(--sx-color-foreground)] shadow-sm"
                                                    : "text-[color:var(--sx-color-foreground-muted)] hover:border-[color:var(--sx-color-border)] hover:bg-[color:var(--sx-color-surface-muted)]/45 hover:text-[color:var(--sx-color-foreground)]",
                                                !open && "mx-auto h-11 w-11 min-h-11 justify-center rounded-[16px] px-0"
                                            )}
                                            onClick={() => {
                                                navigate(item.to);
                                                if (window.innerWidth < 768) {
                                                    setOpen(false);
                                                }
                                            }}
                                        >
                                            <Icon size={17} />
                                            <span
                                                className={cn(
                                                    "truncate transition-[width,opacity] duration-200",
                                                    open ? "w-auto opacity-100" : "w-0 opacity-0"
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

            <SidebarFooter className="border-t border-[color:var(--sx-color-border)]/70 p-0">
                <SidebarThemeControl
                    mode={mode}
                    setMode={setMode}
                    accentPreset={accentPreset}
                    setAccentPreset={setAccentPreset}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
