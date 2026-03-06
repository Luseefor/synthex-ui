import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
export const Breadcrumb = React.forwardRef(({ children, style, ...props }, ref) => _jsx(View, { ref: ref, style: style, ...props, children: children }));
Breadcrumb.displayName = "Breadcrumb";
export const BreadcrumbList = React.forwardRef(({ children, style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }, style], ...props, children: children })));
BreadcrumbList.displayName = "BreadcrumbList";
export const BreadcrumbItem = React.forwardRef(({ children, style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ flexDirection: "row", alignItems: "center", gap: 8 }, style], ...props, children: children })));
BreadcrumbItem.displayName = "BreadcrumbItem";
export const BreadcrumbLink = React.forwardRef(({ children, current = false, style, textStyle, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Pressable, { ref: ref, style: style, accessibilityState: { selected: current }, ...props, children: _jsx(Text, { style: [{ color: current ? theme.colors.foreground : theme.colors.foregroundMuted, fontSize: theme.typography.size.sm, fontWeight: current ? theme.typography.weight.semibold : theme.typography.weight.medium }, textStyle], children: children }) }));
});
BreadcrumbLink.displayName = "BreadcrumbLink";
export const BreadcrumbPage = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return _jsx(Text, { ref: ref, style: [{ color: theme.colors.foreground, fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold }, style], ...props });
});
BreadcrumbPage.displayName = "BreadcrumbPage";
export const BreadcrumbSeparator = React.forwardRef(({ children = "›", style, ...props }, ref) => {
    const theme = useTheme();
    return _jsx(Text, { ref: ref, style: [{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm }, style], ...props, children: children });
});
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
export const BreadcrumbEllipsis = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return _jsx(Text, { ref: ref, style: [{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold }, style], ...props, children: "\u2026" });
});
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
