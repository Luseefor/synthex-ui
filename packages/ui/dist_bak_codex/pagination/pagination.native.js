import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
export const Pagination = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, accessible: true, style: [{ width: "100%" }, style], ...props })));
Pagination.displayName = "Pagination";
export const PaginationContent = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, style], ...props })));
PaginationContent.displayName = "PaginationContent";
export const PaginationItem = React.forwardRef(({ style, ...props }, ref) => _jsx(View, { ref: ref, style: style, ...props }));
PaginationItem.displayName = "PaginationItem";
export const PaginationLink = React.forwardRef(({ children, isActive, style, textStyle, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { selected: isActive }, style: ({ pressed }) => [
            {
                minWidth: 40,
                height: 40,
                paddingHorizontal: 12,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: isActive ? theme.colors.primary : theme.colors.border,
                backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                opacity: pressed ? 0.94 : 1,
            },
            style,
        ], ...props, children: typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [
                {
                    color: isActive ? theme.colors.foregroundOnBrand : theme.colors.foreground,
                    fontFamily: theme.typography.family.sans,
                    fontSize: theme.typography.size.sm,
                    fontWeight: theme.typography.weight.medium,
                },
                textStyle,
            ], children: children })) : (children) }));
});
PaginationLink.displayName = "PaginationLink";
export const PaginationPrevious = React.forwardRef(({ children = "Previous", ...props }, ref) => (_jsxs(PaginationLink, { ref: ref, ...props, children: [_jsx(ChevronLeftIcon, { size: 16 }), _jsx(PaginationLabel, { children: children })] })));
PaginationPrevious.displayName = "PaginationPrevious";
export const PaginationNext = React.forwardRef(({ children = "Next", ...props }, ref) => (_jsxs(PaginationLink, { ref: ref, ...props, children: [_jsx(PaginationLabel, { children: children }), _jsx(ChevronRightIcon, { size: 16 })] })));
PaginationNext.displayName = "PaginationNext";
export function PaginationEllipsis({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(Text, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: [
            {
                minWidth: 40,
                textAlign: "center",
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
            },
            style,
        ], ...props, children: "..." }));
}
function PaginationLabel({ children }) {
    const theme = useTheme();
    return (_jsx(Text, { style: {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weight.medium,
        }, children: children }));
}
