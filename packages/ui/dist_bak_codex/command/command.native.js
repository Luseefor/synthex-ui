import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, ScrollView, Text, TextInput, View, } from "react-native";
import { SearchIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { CommandProvider, matchesCommandQuery, useCommandContext, useCommandController, } from "./command.shared";
export function Command({ children, defaultQuery, onQueryChange, query, shouldFilter, style, ...props }) {
    const theme = useTheme();
    const controller = useCommandController({
        defaultQuery,
        onQueryChange,
        query,
        shouldFilter,
    });
    return (_jsx(CommandProvider, { value: controller, children: _jsx(View, { style: [
                {
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.lg + 2,
                    backgroundColor: theme.colors.surface,
                },
                style,
            ], ...props, children: children }) }));
}
export const CommandInput = React.forwardRef(({ onChangeText, placeholder = "Search commands", style, ...props }, ref) => {
    const context = useCommandContext();
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
CommandInput.displayName = "CommandInput";
export const CommandList = React.forwardRef(({ children, style, ...props }, ref) => (_jsx(ScrollView, { ref: ref, style: [{ maxHeight: 288 }, style], contentContainerStyle: { padding: 8 }, ...props, children: children })));
CommandList.displayName = "CommandList";
export const CommandEmpty = React.forwardRef(({ children = "No results found.", style, textStyle, ...props }, ref) => {
    const context = useCommandContext();
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
CommandEmpty.displayName = "CommandEmpty";
export const CommandGroup = React.forwardRef(({ children, heading, headingStyle, style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsxs(View, { ref: ref, style: [{ paddingVertical: 4, gap: 4 }, style], ...props, children: [heading ? (_jsx(Text, { style: [
                    {
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        color: theme.colors.foregroundMuted,
                        fontFamily: theme.typography.family.sans,
                        fontSize: 11,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                    },
                    headingStyle,
                ], children: heading })) : null, _jsx(View, { style: { gap: 4 }, children: children })] }));
});
CommandGroup.displayName = "CommandGroup";
export const CommandItem = React.forwardRef(({ children, keywords, onCommandSelect, onPress, style, textStyle, textValue, value, ...props }, ref) => {
    const context = useCommandContext();
    const theme = useTheme();
    const itemId = React.useId();
    const searchValue = textValue ??
        (typeof children === "string" || typeof children === "number" ? String(children) : value) ??
        "";
    const itemValue = value ?? searchValue;
    const visible = matchesCommandQuery(context.query, searchValue, keywords);
    React.useEffect(() => {
        context.setItemVisibility(itemId, visible);
        return () => context.unregisterItem(itemId);
    }, [context, itemId, visible]);
    if (!visible) {
        return null;
    }
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", onPress: (event) => {
            onCommandSelect?.(itemValue);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                minHeight: 40,
                borderRadius: theme.radius.md,
                justifyContent: "center",
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
            },
            style,
        ], ...props, children: typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [
                {
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.family.sans,
                    fontSize: theme.typography.size.sm,
                },
                textStyle,
            ], children: children })) : (children) }));
});
CommandItem.displayName = "CommandItem";
