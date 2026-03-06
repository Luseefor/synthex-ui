import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View, } from "react-native";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { ComboboxProvider, matchesComboboxQuery, useComboboxContext, useComboboxController, } from "./combobox.shared";
export function Combobox({ children, defaultOpen, defaultQuery, defaultValue, onOpenChange, onQueryChange, onValueChange, open, placeholder, query, style, value, ...props }) {
    const controller = useComboboxController({
        defaultOpen,
        defaultQuery,
        defaultValue,
        onOpenChange,
        onQueryChange,
        onValueChange,
        open,
        placeholder,
        query,
        value,
    });
    return (_jsx(ComboboxProvider, { value: controller, children: _jsx(View, { style: style, ...props, children: children }) }));
}
export const ComboboxTrigger = React.forwardRef(({ children, onPress, style, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    return (_jsxs(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { expanded: context.open }, onPress: (event) => {
            context.setOpen(!context.open);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                minHeight: 40,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceRaised,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                opacity: pressed ? 0.94 : 1,
            },
            style,
        ], ...props, children: [_jsx(View, { style: { flex: 1 }, children: children }), _jsx(View, { style: { transform: [{ rotate: context.open ? "180deg" : "0deg" }] }, children: _jsx(ChevronDownIcon, { size: 16 }) })] }));
});
ComboboxTrigger.displayName = "ComboboxTrigger";
export const ComboboxValue = React.forwardRef(({ children, style }, ref) => {
    const context = useComboboxContext();
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
        ], children: typeof children === "string" || typeof children === "number"
            ? children
            : selectedLabel ?? context.placeholder ?? "Select an option" }));
});
ComboboxValue.displayName = "ComboboxValue";
export const ComboboxContent = React.forwardRef(({ style, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [
            {
                marginTop: 8,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg + 2,
                backgroundColor: theme.colors.surface,
            },
            style,
        ], ...props }));
});
ComboboxContent.displayName = "ComboboxContent";
export const ComboboxInput = React.forwardRef(({ onChangeText, placeholder = "Search options", style, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    return (_jsxs(View, { style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            paddingHorizontal: 14,
            paddingVertical: 12,
        }, children: [_jsx(SearchIcon, { size: 15, color: theme.colors.foregroundMuted }), _jsx(TextInput, { ref: ref, value: context.query, placeholder: placeholder, placeholderTextColor: theme.colors.foregroundMuted, style: [
                    {
                        flex: 1,
                        color: theme.colors.foreground,
                        fontFamily: theme.typography.family.sans,
                        fontSize: theme.typography.size.sm,
                    },
                    style,
                ], onChangeText: (nextValue) => {
                    context.setQuery(nextValue);
                    onChangeText?.(nextValue);
                }, ...props })] }));
});
ComboboxInput.displayName = "ComboboxInput";
export const ComboboxList = React.forwardRef(({ children, style, ...props }, ref) => (_jsx(ScrollView, { ref: ref, style: [{ maxHeight: 256 }, style], contentContainerStyle: { padding: 8 }, ...props, children: children })));
ComboboxList.displayName = "ComboboxList";
export const ComboboxEmpty = React.forwardRef(({ children = "No results found.", style, textStyle, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    if (context.visibleItemCount > 0) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [{ paddingHorizontal: 12, paddingVertical: 32 }, style], ...props, children: _jsx(Text, { style: [
                {
                    textAlign: "center",
                    color: theme.colors.foregroundMuted,
                    fontFamily: theme.typography.family.sans,
                    fontSize: theme.typography.size.sm,
                },
                textStyle,
            ], children: children }) }));
});
ComboboxEmpty.displayName = "ComboboxEmpty";
export const ComboboxItem = React.forwardRef(({ children, keywords, onPress, style, textStyle, textValue, value, ...props }, ref) => {
    const context = useComboboxContext();
    const theme = useTheme();
    const itemId = React.useId();
    const label = textValue ??
        (typeof children === "string" || typeof children === "number" ? String(children) : value);
    const visible = matchesComboboxQuery(context.query, label, keywords);
    const active = context.value === value;
    React.useEffect(() => {
        context.registerItem(value, label);
    }, [context, label, value]);
    React.useEffect(() => {
        context.setItemVisibility(itemId, visible);
        return () => context.unregisterItem(itemId);
    }, [context, itemId, visible]);
    if (!visible) {
        return null;
    }
    return (_jsxs(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { selected: active }, onPress: (event) => {
            context.setValue(value);
            context.setQuery("");
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
ComboboxItem.displayName = "ComboboxItem";
