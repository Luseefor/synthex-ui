import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import { DialogProvider as SheetProvider, useDialogContext as useSheetContext, useDialogController as useSheetController, } from "../dialog/dialog.shared";
export function Sheet({ children, defaultOpen, onOpenChange, open }) {
    const controller = useSheetController({ defaultOpen, onOpenChange, open });
    return _jsx(SheetProvider, { value: controller, children: children });
}
export const SheetTrigger = React.forwardRef(({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useSheetContext();
    const handleClick = React.useCallback((event) => {
        context.setOpen(true);
        onClick?.(event);
    }, [context, onClick]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onClick: (e) => {
                handleClick(e);
                children.props.onClick?.(e);
            },
        });
    }
    return (_jsx("button", { ref: ref, type: type, onClick: (event) => {
            context.setOpen(true);
            onClick?.(event);
        }, ...props, children: children }));
});
SheetTrigger.displayName = "SheetTrigger";
export const SheetClose = React.forwardRef(({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useSheetContext();
    const handleClick = React.useCallback((event) => {
        context.setOpen(false);
        onClick?.(event);
    }, [context, onClick]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onClick: (e) => {
                handleClick(e);
                children.props.onClick?.(e);
            },
        });
    }
    return (_jsx("button", { ref: ref, type: type, onClick: (event) => {
            context.setOpen(false);
            onClick?.(event);
        }, ...props, children: children }));
});
SheetClose.displayName = "SheetClose";
export const SheetContent = React.forwardRef(({ children, className, onClick, side = "right", ...props }, ref) => {
    const context = useSheetContext();
    if (!context.open) {
        return null;
    }
    return createPortal(_jsx("div", { className: "fixed inset-0 z-[100] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm", onClick: () => context.setOpen(false), children: _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", className: cn("absolute top-0 h-full w-full max-w-md border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.25)]", side === "right"
                ? "right-0 border-l"
                : "left-0 border-r", className), onClick: (event) => {
                event.stopPropagation();
                onClick?.(event);
            }, ...props, children: [_jsx("button", { type: "button", "aria-label": "Close sheet", className: "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)] transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-foreground)]", onClick: () => context.setOpen(false), children: _jsx(CloseIcon, { size: 16 }) }), children] }) }), document.body);
});
SheetContent.displayName = "SheetContent";
export const SheetHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-col gap-2 text-left", className), ...props })));
SheetHeader.displayName = "SheetHeader";
export const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h2", { ref: ref, className: cn("text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]", className), ...props })));
SheetTitle.displayName = "SheetTitle";
export const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn("text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", className), ...props })));
SheetDescription.displayName = "SheetDescription";
export const SheetFooter = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("mt-6 flex flex-wrap items-center justify-end gap-3", className), ...props })));
SheetFooter.displayName = "SheetFooter";
