import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Text as NativeText, TextInput, View, } from "react-native";
import { createFieldControlStyle } from "../_shared/field-control.native";
import { useTheme } from "../_shared/theme/context";
import { Label } from "../label/label.native";
export function Spinner({ size = "md", style, ...props }) {
    const theme = useTheme();
    const dimension = size === "sm" ? 16 : size === "lg" ? 28 : 20;
    return (_jsx(View, { accessibilityLabel: "Loading", accessibilityRole: "progressbar", style: [
            {
                borderColor: theme.colors.border,
                borderRadius: 999,
                borderTopColor: theme.colors.primary,
                borderWidth: 2,
                height: dimension,
                width: dimension,
            },
            style,
        ], ...props }));
}
export function Kbd({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                alignSelf: "flex-start",
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.mono,
                fontSize: 12,
                fontWeight: "600",
                overflow: "hidden",
                paddingHorizontal: 8,
                paddingVertical: 4,
            },
            style,
        ], ...props }));
}
export function ButtonGroup({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                flexDirection: "row",
                gap: 8,
                padding: 4,
            },
            style,
        ], ...props }));
}
export function Field({ style, ...props }) {
    return _jsx(View, { style: [{ gap: 10 }, style], ...props });
}
export function FieldSet({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                gap: 12,
                padding: 16,
            },
            style,
        ], ...props }));
}
export function FieldLegend({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: 14,
                fontWeight: "600",
            },
            style,
        ], ...props }));
}
export function FieldContent({ style, ...props }) {
    return _jsx(View, { style: [{ gap: 6 }, style], ...props });
}
export function FieldLabel({ style, ...props }) {
    return _jsx(Label, { style: [{ fontSize: 13, fontWeight: "600" }, style], ...props });
}
export function FieldDescription({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: 13,
                lineHeight: 20,
            },
            style,
        ], ...props }));
}
export function FieldError({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.destructive,
                fontFamily: theme.typography.family.sans,
                fontSize: 13,
                fontWeight: "600",
                lineHeight: 20,
            },
            style,
        ], ...props }));
}
export function InputGroup({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                alignItems: "stretch",
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                flexDirection: "row",
                overflow: "hidden",
            },
            style,
        ], ...props }));
}
export function InputGroupAddon({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                alignItems: "center",
                backgroundColor: theme.colors.surfaceMuted,
                borderRightColor: theme.colors.border,
                borderRightWidth: 1,
                justifyContent: "center",
                paddingHorizontal: 12,
            },
            style,
        ], ...props }));
}
export function Empty({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                alignItems: "center",
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.borderStrong,
                borderRadius: theme.radius.lg,
                borderStyle: "dashed",
                borderWidth: 1,
                justifyContent: "center",
                minHeight: 160,
                paddingHorizontal: 24,
                paddingVertical: 32,
            },
            style,
        ], ...props }));
}
export function EmptyHeader({ style, ...props }) {
    return _jsx(View, { style: [{ alignItems: "center", gap: 8 }, style], ...props });
}
export function EmptyTitle({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: 18,
                fontWeight: "600",
            },
            style,
        ], ...props }));
}
export function EmptyDescription({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: 14,
                textAlign: "center",
            },
            style,
        ], ...props }));
}
export function Item({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                gap: 4,
                paddingHorizontal: 16,
                paddingVertical: 12,
            },
            style,
        ], ...props }));
}
export function ItemTitle({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: 14,
                fontWeight: "500",
            },
            style,
        ], ...props }));
}
export function ItemDescription({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: 14,
            },
            style,
        ], ...props }));
}
export function NativeSelect({ label, style, ...props }) {
    const theme = useTheme();
    return (_jsxs(View, { style: { gap: 10 }, children: [label ? _jsx(Label, { children: label }) : null, _jsx(TextInput, { style: [
                    {
                        ...createFieldControlStyle(theme, {}),
                        paddingVertical: 10,
                    },
                    style,
                ], ...props })] }));
}
