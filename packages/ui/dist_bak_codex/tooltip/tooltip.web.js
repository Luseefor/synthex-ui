import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { TooltipProvider, useTooltipContext, useTooltipController, } from "./tooltip.shared";
export function Tooltip({ children, className, defaultOpen, onOpenChange, open, ...props }) {
    const controller = useTooltipController({ defaultOpen, onOpenChange, open });
    return (_jsx(TooltipProvider, { value: controller, children: _jsx("span", { className: cn("relative inline-flex", className), ...props, children: children }) }));
}
export const TooltipTrigger = React.forwardRef(({ children, onBlur, onFocus, onMouseEnter, onMouseLeave, asChild, ...props }, ref) => {
    const context = useTooltipContext();
    const handleFocus = (event) => {
        context.setOpen(true);
        onFocus?.(event);
    };
    const handleBlur = (event) => {
        context.setOpen(false);
        onBlur?.(event);
    };
    const handleMouseEnter = (event) => {
        context.setOpen(true);
        onMouseEnter?.(event);
    };
    const handleMouseLeave = (event) => {
        context.setOpen(false);
        onMouseLeave?.(event);
    };
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onFocus: (e) => {
                handleFocus(e);
                children.props.onFocus?.(e);
            },
            onBlur: (e) => {
                handleBlur(e);
                children.props.onBlur?.(e);
            },
            onMouseEnter: (e) => {
                handleMouseEnter(e);
                children.props.onMouseEnter?.(e);
            },
            onMouseLeave: (e) => {
                handleMouseLeave(e);
                children.props.onMouseLeave?.(e);
            },
        });
    }
    return (_jsx("span", { ref: ref, tabIndex: 0, onFocus: handleFocus, onBlur: handleBlur, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, ...props, children: children }));
});
TooltipTrigger.displayName = "TooltipTrigger";
export const TooltipContent = React.forwardRef(({ className, ...props }, ref) => {
    const context = useTooltipContext();
    if (!context.open) {
        return null;
    }
    return (_jsx("div", { ref: ref, role: "tooltip", className: cn("absolute left-1/2 top-[calc(100%+0.5rem)] z-50 -translate-x-1/2 rounded-[var(--sx-radius-md)] bg-[color:#0f172a] px-3 py-2 text-xs font-medium text-white shadow-[0_16px_36px_rgba(15,23,42,0.24)]", className), ...props }));
});
TooltipContent.displayName = "TooltipContent";
