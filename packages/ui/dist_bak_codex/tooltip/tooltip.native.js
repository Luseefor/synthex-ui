import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { TooltipProvider, useTooltipContext, useTooltipController, } from "./tooltip.shared";
export function Tooltip({ children, defaultOpen, onOpenChange, open, style, ...props }) {
    const controller = useTooltipController({ defaultOpen, onOpenChange, open });
    return (_jsx(TooltipProvider, { value: controller, children: _jsx(View, { style: [{ position: "relative" }, style], ...props, children: children }) }));
}
export const TooltipTrigger = React.forwardRef(({ children, onHoverIn, onHoverOut, onPressIn, onPressOut, style, asChild, ...props }, ref) => {
    const context = useTooltipContext();
    const handleHoverIn = React.useCallback((event) => { context.setOpen(true); onHoverIn?.(event); }, [context, onHoverIn]);
    const handleHoverOut = React.useCallback((event) => { context.setOpen(false); onHoverOut?.(event); }, [context, onHoverOut]);
    const handlePressIn = React.useCallback((event) => { context.setOpen(true); onPressIn?.(event); }, [context, onPressIn]);
    const handlePressOut = React.useCallback((event) => { context.setOpen(false); onPressOut?.(event); }, [context, onPressOut]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onHoverIn: (e) => { handleHoverIn(e); children.props.onHoverIn?.(e); },
            onHoverOut: (e) => { handleHoverOut(e); children.props.onHoverOut?.(e); },
            onPressIn: (e) => { handlePressIn(e); children.props.onPressIn?.(e); },
            onPressOut: (e) => { handlePressOut(e); children.props.onPressOut?.(e); },
        });
    }
    return (_jsx(Pressable, { ref: ref, onHoverIn: handleHoverIn, onHoverOut: handleHoverOut, onPressIn: handlePressIn, onPressOut: handlePressOut, style: style, ...props, children: children }));
});
TooltipTrigger.displayName = "TooltipTrigger";
export const TooltipContent = React.forwardRef(({ style, ...props }, ref) => {
    const context = useTooltipContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(Text, { ref: ref, style: [
            {
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 8,
                borderRadius: theme.radius.md,
                backgroundColor: "#0f172a",
                color: "#ffffff",
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.xs,
                fontWeight: theme.typography.weight.medium,
            },
            style,
        ], ...props }));
});
TooltipContent.displayName = "TooltipContent";
