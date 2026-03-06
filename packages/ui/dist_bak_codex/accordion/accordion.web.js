import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { ChevronDownIcon } from "../icons/index.web";
import { AccordionItemProvider, AccordionProvider, useAccordionContext, useAccordionController, useAccordionItemContext, } from "./accordion.shared";
export function Accordion({ children, className, collapsible, defaultValue, onValueChange, type, value, ...props }) {
    const controller = useAccordionController({
        collapsible,
        defaultValue,
        onValueChange,
        type,
        value,
    });
    return (_jsx(AccordionProvider, { value: controller, children: _jsx("div", { className: cn("w-full", className), ...props, children: children }) }));
}
export const AccordionItem = React.forwardRef(({ children, className, value, ...props }, ref) => (_jsx(AccordionItemProvider, { value: { value }, children: _jsx("div", { ref: ref, className: cn("border-b border-[color:var(--sx-color-border)] last:border-b-0", className), ...props, children: children }) })));
AccordionItem.displayName = "AccordionItem";
export const AccordionTrigger = React.forwardRef(({ children, className, onClick, ...props }, ref) => {
    const accordion = useAccordionContext();
    const item = useAccordionItemContext();
    const open = accordion.isItemOpen(item.value);
    return (_jsxs("button", { ref: ref, type: "button", "aria-expanded": open, className: cn("flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium tracking-[-0.01em] text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-primary)]", className), onClick: (event) => {
            accordion.toggleItem(item.value);
            onClick?.(event);
        }, ...props, children: [_jsx("span", { children: children }), _jsx("span", { className: cn("transition-transform duration-[var(--sx-motion-fast)]", open && "rotate-180"), children: _jsx(ChevronDownIcon, { size: 16, strokeWidth: 2 }) })] }));
});
AccordionTrigger.displayName = "AccordionTrigger";
export const AccordionContent = React.forwardRef(({ children, className, ...props }, ref) => {
    const accordion = useAccordionContext();
    const item = useAccordionItemContext();
    const open = accordion.isItemOpen(item.value);
    return (_jsx("div", { ref: ref, hidden: !open, className: cn("pb-4 text-sm text-[color:var(--sx-color-foreground-muted)]", className), ...props, children: children }));
});
AccordionContent.displayName = "AccordionContent";
