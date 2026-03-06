import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { PopoverProvider, usePopoverContext, usePopoverController, } from "./popover.shared";
export function Popover({ children, className, defaultOpen, onOpenChange, open, ...props }) {
    const controller = usePopoverController({ defaultOpen, onOpenChange, open });
    const rootRef = React.useRef(null);
    React.useEffect(() => {
        if (!controller.open) {
            return;
        }
        const handlePointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                controller.setOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                controller.setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [controller]);
    return (_jsx(PopoverProvider, { value: controller, children: _jsx("div", { ref: rootRef, className: cn("relative inline-flex", className), ...props, children: children }) }));
}
export const PopoverTrigger = React.forwardRef(({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = usePopoverContext();
    const handleClick = React.useCallback((event) => {
        context.setOpen(!context.open);
        onClick?.(event);
    }, [context, onClick]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            "aria-expanded": context.open,
            onClick: (e) => {
                handleClick(e);
                children.props.onClick?.(e);
            },
        });
    }
    return (_jsx("button", { ref: ref, type: type, "aria-expanded": context.open, onClick: (event) => {
            context.setOpen(!context.open);
            onClick?.(event);
        }, ...props, children: children }));
});
PopoverTrigger.displayName = "PopoverTrigger";
export const PopoverContent = React.forwardRef(({ className, ...props }, ref) => {
    const context = usePopoverContext();
    if (!context.open) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: cn("absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-3 shadow-[0_18px_42px_rgba(15,23,42,0.14)]", className), ...props }));
});
PopoverContent.displayName = "PopoverContent";
