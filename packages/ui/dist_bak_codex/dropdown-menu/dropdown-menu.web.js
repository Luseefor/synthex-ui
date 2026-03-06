import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { DropdownMenuProvider, useDropdownMenuContext, useDropdownMenuController, } from "./dropdown-menu.shared";
export function DropdownMenu({ children, className, defaultOpen, onOpenChange, open, ...props }) {
    const controller = useDropdownMenuController({ defaultOpen, onOpenChange, open });
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
    return (_jsx(DropdownMenuProvider, { value: controller, children: _jsx("div", { ref: rootRef, className: cn("relative inline-flex", className), ...props, children: children }) }));
}
export const DropdownMenuTrigger = React.forwardRef(({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useDropdownMenuContext();
    const handleClick = (event) => {
        context.setOpen(!context.open);
        onClick?.(event);
    };
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            "aria-expanded": context.open,
            "aria-haspopup": "menu",
            onClick: (e) => {
                handleClick(e);
                children.props.onClick?.(e);
            },
        });
    }
    return (_jsx("button", { ref: ref, type: type, "aria-expanded": context.open, "aria-haspopup": "menu", onClick: handleClick, ...props, children: children }));
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
export const DropdownMenuContent = React.forwardRef(({ className, ...props }, ref) => {
    const context = useDropdownMenuContext();
    if (!context.open) {
        return null;
    }
    return (_jsx("div", { ref: ref, role: "menu", className: cn("absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]", className), ...props }));
});
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuLabel = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]", className), ...props })));
DropdownMenuLabel.displayName = "DropdownMenuLabel";
export const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("my-1 h-px bg-[color:var(--sx-color-border)]", className), ...props })));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
export const DropdownMenuItem = React.forwardRef(({ children, className, onClick, type = "button", ...props }, ref) => {
    const context = useDropdownMenuContext();
    return (_jsx("button", { ref: ref, type: type, role: "menuitem", className: cn("flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)]", className), onClick: (event) => {
            onClick?.(event);
            context.setOpen(false);
        }, ...props, children: children }));
});
DropdownMenuItem.displayName = "DropdownMenuItem";
