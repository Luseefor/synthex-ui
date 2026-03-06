import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
const SidebarContext = React.createContext(null);
function useSidebarContext() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("Sidebar components must be wrapped in SidebarProvider.");
    }
    return context;
}
export function SidebarProvider({ children, defaultOpen = true }) {
    const [open, setOpen] = React.useState(defaultOpen);
    const value = React.useMemo(() => ({
        open,
        setOpen,
        toggle: () => setOpen((current) => !current),
    }), [open]);
    return _jsx(SidebarContext.Provider, { value: value, children: children });
}
export function useSidebar() {
    return useSidebarContext();
}
export function Sidebar({ children }) {
    const { open } = useSidebarContext();
    const theme = useTheme();
    return (_jsx(View, { style: {
            width: open ? 288 : 88,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg + 2,
            backgroundColor: theme.colors.surface,
        }, children: children }));
}
export function SidebarHeader({ children }) {
    const theme = useTheme();
    return _jsx(View, { style: { borderBottomWidth: 1, borderBottomColor: theme.colors.border, padding: 16 }, children: children });
}
export function SidebarFooter({ children }) {
    const theme = useTheme();
    return _jsx(View, { style: { borderTopWidth: 1, borderTopColor: theme.colors.border, padding: 16 }, children: children });
}
export function SidebarContent({ children }) {
    return _jsx(ScrollView, { contentContainerStyle: { gap: 16, padding: 12 }, children: children });
}
export function SidebarGroup({ children }) {
    return _jsx(View, { style: { gap: 8 }, children: children });
}
export function SidebarGroupLabel({ children }) {
    const theme = useTheme();
    return (_jsx(Text, { style: {
            color: theme.colors.foregroundMuted,
            fontSize: theme.typography.size.xs,
            fontWeight: "600",
            letterSpacing: 1,
            paddingHorizontal: 12,
            textTransform: "uppercase",
        }, children: children }));
}
export function SidebarGroupContent({ children }) {
    return _jsx(View, { style: { gap: 4 }, children: children });
}
export function SidebarMenu({ children }) {
    return _jsx(View, { style: { gap: 4 }, children: children });
}
export function SidebarMenuItem({ children }) {
    return _jsx(View, { children: children });
}
export function SidebarMenuButton({ active, children, onPress }) {
    const { open } = useSidebarContext();
    const theme = useTheme();
    return (_jsx(Pressable, { accessibilityRole: "button", onPress: onPress, style: {
            alignItems: "center",
            backgroundColor: active ? theme.colors.primaryMuted : "transparent",
            borderRadius: theme.radius.md,
            flexDirection: "row",
            gap: 12,
            justifyContent: open ? "flex-start" : "center",
            paddingHorizontal: open ? 12 : 0,
            paddingVertical: 10,
        }, children: typeof children === "string" ? (_jsx(Text, { style: {
                color: active ? theme.colors.foreground : theme.colors.foregroundMuted,
                fontSize: theme.typography.size.sm,
                fontWeight: "500",
            }, children: children })) : (children) }));
}
export function SidebarInset({ children }) {
    const theme = useTheme();
    return (_jsx(View, { style: {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.lg + 2,
            flex: 1,
        }, children: children }));
}
export function SidebarRail() {
    const theme = useTheme();
    return _jsx(View, { style: { alignSelf: "center", backgroundColor: theme.colors.border, borderRadius: 999, height: 40, width: 4 } });
}
export function SidebarTrigger({ children = "Toggle sidebar" }) {
    const { toggle } = useSidebarContext();
    const theme = useTheme();
    return (_jsx(Pressable, { accessibilityRole: "button", onPress: toggle, style: {
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
        }, children: _jsx(Text, { style: { color: theme.colors.foreground, fontSize: theme.typography.size.sm, fontWeight: "500" }, children: children }) }));
}
