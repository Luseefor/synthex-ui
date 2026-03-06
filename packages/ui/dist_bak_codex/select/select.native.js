import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { CheckIcon, ChevronDownIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { createFieldControlStyle } from "../_shared/field-control.native";
import { SelectProvider, useSelectContext, useSelectController, } from "./select.shared";
export function Select({ children, defaultOpen, defaultValue, onOpenChange, onValueChange, open, placeholder, style, value, ...props }) {
    const controller = useSelectController({
        defaultOpen,
        defaultValue,
        onOpenChange,
        onValueChange,
        open,
        placeholder,
        value,
    });
    return (_jsx(SelectProvider, { value: controller, children: _jsx(View, { style: style, ...props, children: children }) }));
}
export const SelectTrigger = React.forwardRef(({ children, onPress, style, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    return (_jsxs(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { expanded: context.open }, onPress: (event) => {
            context.setOpen(!context.open);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                ...createFieldControlStyle(theme, {}),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                opacity: pressed ? 0.94 : 1,
            },
            style,
        ], ...props, children: [_jsx(View, { style: { flex: 1 }, children: children }), _jsx(View, { style: { transform: [{ rotate: context.open ? "180deg" : "0deg" }] }, children: _jsx(ChevronDownIcon, { size: 16 }) })] }));
});
SelectTrigger.displayName = "SelectTrigger";
export const SelectValue = React.forwardRef(({ children, style, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    const selectedLabel = context.getLabel(context.value);
    void context.labelVersion;
    return (_jsx(Text, { ref: ref, numberOfLines: 1, style: [
            {
                color: selectedLabel || children
                    ? theme.colors.foreground
                    : theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
            },
            style,
        ], ...props, children: typeof children === "string" || typeof children === "number"
            ? children
            : selectedLabel ?? context.placeholder ?? "Select an option" }));
});
SelectValue.displayName = "SelectValue";
export const SelectContent = React.forwardRef(({ style, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [
            {
                marginTop: 8,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surface,
                padding: 6,
                gap: 4,
            },
            style,
        ], ...props }));
});
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef(({ children, onPress, style, textStyle, textValue, value, ...props }, ref) => {
    const context = useSelectContext();
    const theme = useTheme();
    const active = context.value === value;
    const label = textValue ??
        (typeof children === "string" || typeof children === "number" ? String(children) : value);
    React.useEffect(() => {
        context.registerItem(value, label);
    }, [context, label, value]);
    return (_jsxs(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { selected: active }, onPress: (event) => {
            context.setValue(value);
            context.setOpen(false);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                minHeight: 40,
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surface,
                opacity: pressed ? 0.94 : 1,
            },
            style,
        ], ...props, children: [typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [
                    {
                        color: active ? theme.colors.primary : theme.colors.foreground,
                        fontFamily: theme.typography.family.sans,
                        fontSize: theme.typography.size.sm,
                    },
                    textStyle,
                ], children: children })) : (children), active ? _jsx(CheckIcon, { size: 14, strokeWidth: 2.4 }) : null] }));
});
SelectItem.displayName = "SelectItem";
