import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { ChevronDownIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { AccordionItemProvider, AccordionProvider, useAccordionContext, useAccordionController, useAccordionItemContext, } from "./accordion.shared";
export function Accordion({ children, collapsible, defaultValue, onValueChange, style, type, value, ...props }) {
    const controller = useAccordionController({
        collapsible,
        defaultValue,
        onValueChange,
        type,
        value,
    });
    return (_jsx(AccordionProvider, { value: controller, children: _jsx(View, { style: style, ...props, children: children }) }));
}
export const AccordionItem = React.forwardRef(({ children, style, value, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(AccordionItemProvider, { value: { value }, children: _jsx(View, { ref: ref, style: [
                {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                },
                style,
            ], ...props, children: children }) }));
});
AccordionItem.displayName = "AccordionItem";
export const AccordionTrigger = React.forwardRef(({ children, onPress, style, textStyle, ...props }, ref) => {
    const accordion = useAccordionContext();
    const item = useAccordionItemContext();
    const theme = useTheme();
    const open = accordion.isItemOpen(item.value);
    return (_jsxs(Pressable, { ref: ref, accessibilityRole: "button", onPress: (event) => {
            accordion.toggleItem(item.value);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                paddingVertical: 16,
                opacity: pressed ? 0.92 : 1,
            },
            style,
        ], ...props, children: [typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [
                    {
                        color: theme.colors.foreground,
                        fontFamily: theme.typography.family.sans,
                        fontSize: theme.typography.size.sm,
                        fontWeight: theme.typography.weight.medium,
                    },
                    textStyle,
                ], children: children })) : (children), _jsx(View, { style: { transform: [{ rotate: open ? "180deg" : "0deg" }] }, children: _jsx(ChevronDownIcon, { size: 16, strokeWidth: 2 }) })] }));
});
AccordionTrigger.displayName = "AccordionTrigger";
export const AccordionContent = React.forwardRef(({ children, style, ...props }, ref) => {
    const accordion = useAccordionContext();
    const item = useAccordionItemContext();
    const open = accordion.isItemOpen(item.value);
    if (!open) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [{ paddingBottom: 16 }, style], ...props, children: children }));
});
AccordionContent.displayName = "AccordionContent";
