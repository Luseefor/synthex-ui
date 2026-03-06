import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { HoverCardProvider, useHoverCardContext, useHoverCardController } from "./hover-card.shared";
export function HoverCard({ children, className, closeDelay, defaultOpen, onOpenChange, open, openDelay, ...props }) {
    const controller = useHoverCardController({ closeDelay, defaultOpen, onOpenChange, open, openDelay });
    const openTimer = React.useRef(null);
    const closeTimer = React.useRef(null);
    const scheduleOpen = () => {
        if (closeTimer.current)
            window.clearTimeout(closeTimer.current);
        if (controller.openDelay <= 0) {
            controller.setOpen(true);
            return;
        }
        openTimer.current = window.setTimeout(() => controller.setOpen(true), controller.openDelay);
    };
    const scheduleClose = () => {
        if (openTimer.current)
            window.clearTimeout(openTimer.current);
        if (controller.closeDelay <= 0) {
            controller.setOpen(false);
            return;
        }
        closeTimer.current = window.setTimeout(() => controller.setOpen(false), controller.closeDelay);
    };
    React.useEffect(() => () => {
        if (openTimer.current)
            window.clearTimeout(openTimer.current);
        if (closeTimer.current)
            window.clearTimeout(closeTimer.current);
    }, []);
    return (_jsx(HoverCardProvider, { value: controller, children: _jsx("div", { className: cn("relative inline-flex", className), onMouseEnter: scheduleOpen, onMouseLeave: scheduleClose, ...props, children: children }) }));
}
export const HoverCardTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { ref, ...props });
    }
    return _jsx("span", { ref: ref, ...props, children: children });
});
HoverCardTrigger.displayName = "HoverCardTrigger";
export const HoverCardContent = React.forwardRef(({ className, ...props }, ref) => {
    const context = useHoverCardContext();
    if (!context.open)
        return null;
    return (_jsx("div", { ref: ref, className: cn("absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-64 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)]", className), ...props }));
});
HoverCardContent.displayName = "HoverCardContent";
