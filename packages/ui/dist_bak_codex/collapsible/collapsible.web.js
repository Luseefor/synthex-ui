import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { CollapsibleProvider, useCollapsibleContext, useCollapsibleController, } from "./collapsible.shared";
export function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, ...props }) {
    const controller = useCollapsibleController({ defaultOpen, disabled, onOpenChange, open });
    return (_jsx(CollapsibleProvider, { value: controller, children: _jsx("div", { "data-state": controller.open ? "open" : "closed", ...props, children: children }) }));
}
export const CollapsibleTrigger = React.forwardRef(({ children, onClick, type = "button", ...props }, ref) => {
    const context = useCollapsibleContext();
    return (_jsx("button", { ref: ref, type: type, "aria-expanded": context.open, disabled: context.disabled, onClick: (event) => {
            onClick?.(event);
            if (!event.defaultPrevented && !context.disabled) {
                context.setOpen(!context.open);
            }
        }, ...props, children: children }));
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";
export const CollapsibleContent = React.forwardRef(({ className, hidden, ...props }, ref) => {
    const context = useCollapsibleContext();
    if (!context.open) {
        return null;
    }
    return (_jsx("div", { ref: ref, hidden: hidden ?? !context.open, "data-state": context.open ? "open" : "closed", className: cn("data-[state=closed]:hidden", className), ...props }));
});
CollapsibleContent.displayName = "CollapsibleContent";
