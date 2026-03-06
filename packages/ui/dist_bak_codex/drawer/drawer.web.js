import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import { DialogProvider, useDialogContext, useDialogController } from "../dialog/dialog.shared";
export function Drawer({ children, defaultOpen, onOpenChange, open }) {
    const controller = useDialogController({ defaultOpen, onOpenChange, open });
    return _jsx(DialogProvider, { value: controller, children: children });
}
export const DrawerTrigger = React.forwardRef(({ children, onClick, type = "button", ...props }, ref) => {
    const context = useDialogContext();
    return (_jsx("button", { ref: ref, type: type, onClick: (event) => {
            context.setOpen(true);
            onClick?.(event);
        }, ...props, children: children }));
});
DrawerTrigger.displayName = "DrawerTrigger";
export const DrawerClose = React.forwardRef(({ children, onClick, type = "button", ...props }, ref) => {
    const context = useDialogContext();
    return (_jsx("button", { ref: ref, type: type, onClick: (event) => {
            context.setOpen(false);
            onClick?.(event);
        }, ...props, children: children }));
});
DrawerClose.displayName = "DrawerClose";
export const DrawerContent = React.forwardRef(({ children, className, onClick, side = "bottom", ...props }, ref) => {
    const context = useDialogContext();
    if (!context.open)
        return null;
    return createPortal(_jsx("div", { className: "fixed inset-0 z-[100] bg-[rgba(15,23,42,0.38)] backdrop-blur-sm", onClick: () => context.setOpen(false), children: _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", className: cn("absolute border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22)]", side === "bottom"
                ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[calc(var(--sx-radius-xl)+4px)] border-t"
                : side === "left"
                    ? "bottom-0 left-0 top-0 w-full max-w-md border-r"
                    : "bottom-0 right-0 top-0 w-full max-w-md border-l", className), onClick: (event) => {
                event.stopPropagation();
                onClick?.(event);
            }, ...props, children: [_jsx("button", { type: "button", "aria-label": "Close drawer", className: "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)]", onClick: () => context.setOpen(false), children: _jsx(CloseIcon, { size: 16 }) }), children] }) }), document.body);
});
DrawerContent.displayName = "DrawerContent";
export const DrawerHeader = React.forwardRef(({ className, ...props }, ref) => _jsx("div", { ref: ref, className: cn("flex flex-col gap-2 text-left", className), ...props }));
DrawerHeader.displayName = "DrawerHeader";
export const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => _jsx("h2", { ref: ref, className: cn("text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]", className), ...props }));
DrawerTitle.displayName = "DrawerTitle";
export const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => _jsx("p", { ref: ref, className: cn("text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", className), ...props }));
DrawerDescription.displayName = "DrawerDescription";
export const DrawerFooter = React.forwardRef(({ className, ...props }, ref) => _jsx("div", { ref: ref, className: cn("mt-6 flex flex-wrap items-center justify-end gap-3", className), ...props }));
DrawerFooter.displayName = "DrawerFooter";
