import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { PopoverProvider, usePopoverContext, usePopoverController, } from "./popover.shared";
export function Popover({ children, defaultOpen, onOpenChange, open, style, ...props }) {
    const controller = usePopoverController({ defaultOpen, onOpenChange, open });
    return (_jsx(PopoverProvider, { value: controller, children: _jsx(View, { style: [{ position: "relative" }, style], ...props, children: children }) }));
}
export const PopoverTrigger = React.forwardRef(({ children, onPress, style, asChild, ...props }, ref) => {
    const context = usePopoverContext();
    const handlePress = React.useCallback((event) => {
        context.setOpen(!context.open);
        onPress?.(event);
    }, [context, onPress]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onPress: (e) => {
                handlePress(e);
                children.props.onPress?.(e);
            },
        });
    }
    return (_jsx(Pressable, { ref: ref, onPress: handlePress, style: style, ...props, children: children }));
});
PopoverTrigger.displayName = "PopoverTrigger";
export const PopoverContent = React.forwardRef(({ style, ...props }, ref) => {
    const context = usePopoverContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [
            {
                marginTop: 8,
                minWidth: 224,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surface,
                padding: 12,
                shadowColor: "#0f172a",
                shadowOpacity: 0.14,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 6,
            },
            style,
        ], ...props }));
});
PopoverContent.displayName = "PopoverContent";
