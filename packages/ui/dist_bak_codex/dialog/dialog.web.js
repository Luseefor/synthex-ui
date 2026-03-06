import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import { DialogProvider, useDialogContext, useDialogController, } from "./dialog.shared";
export function Dialog({ children, defaultOpen, onOpenChange, open }) {
    const controller = useDialogController({ defaultOpen, onOpenChange, open });
    return _jsx(DialogProvider, { value: controller, children: children });
}
export const DialogTrigger = React.forwardRef(({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useDialogContext();
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
DialogTrigger.displayName = "DialogTrigger";
export const DialogClose = React.forwardRef(({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useDialogContext();
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
DialogClose.displayName = "DialogClose";
export const DialogContent = React.forwardRef(({ children, className, hideClose = false, onClick, ...props }, ref) => {
    const context = useDialogContext();
    React.useEffect(() => {
        if (!context.open) {
            return;
        }
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                context.setOpen(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [context]);
    if (!context.open) {
        return null;
    }
    return createPortal(_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-[100] bg-black/60 backdrop-blur-[6px]", style: { animation: "sx-overlay-in 200ms var(--sx-easing-standard)" }, onClick: () => context.setOpen(false) }), _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", className: cn("fixed left-1/2 top-1/2 z-[101] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[var(--sx-shadow-dialog)]", className), style: { animation: "sx-content-in 250ms var(--sx-easing-emphasized)" }, onClick: (event) => {
                    event.stopPropagation();
                    onClick?.(event);
                }, ...props, children: [!hideClose ? (_jsx("button", { type: "button", "aria-label": "Close dialog", className: "absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-70 transition-all duration-[var(--sx-motion-fast)] hover:opacity-100 hover:bg-[color:var(--sx-color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]", onClick: () => context.setOpen(false), children: _jsx(CloseIcon, { size: 15 }) })) : null, children] })] }), document.body);
});
DialogContent.displayName = "DialogContent";
export const DialogHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-col gap-1.5 text-left", className), ...props })));
DialogHeader.displayName = "DialogHeader";
export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h2", { ref: ref, className: cn("text-lg font-semibold leading-none tracking-[-0.02em] text-[color:var(--sx-color-foreground)]", className), ...props })));
DialogTitle.displayName = "DialogTitle";
export const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn("text-sm leading-relaxed text-[color:var(--sx-color-foreground-muted)]", className), ...props })));
DialogDescription.displayName = "DialogDescription";
export const DialogFooter = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className), ...props })));
DialogFooter.displayName = "DialogFooter";
