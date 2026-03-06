import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { cardVariants } from "./card.shared";
const cardClassStyles = {
    slots: ["root"],
    base: {
        root: "rounded-[calc(var(--sx-radius-lg)+2px)] border text-[color:var(--sx-color-foreground)] transition-[background-color,border-color,box-shadow,transform] duration-[var(--sx-motion-fast)]",
    },
    variants: {
        variant: {
            default: {
                root: "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[var(--sx-shadow-sm)]",
            },
            elevated: {
                root: "border-transparent bg-[color:var(--sx-color-surface-raised)] shadow-[var(--sx-shadow-md)]",
            },
            interactive: {
                root: "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[var(--sx-shadow-sm)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-md)]",
            },
            muted: {
                root: "border-transparent bg-[color:var(--sx-color-surface-muted)] shadow-none",
            },
            accent: {
                root: "border-[color:var(--sx-color-accent)] bg-[color:var(--sx-color-accent-muted)] shadow-[var(--sx-shadow-sm)]",
            },
        },
    },
};
export const Card = React.forwardRef(({ className, variant, ...props }, ref) => {
    const slots = resolveVariantStyles(cardVariants, cardClassStyles, { variant });
    return (_jsx("div", { ref: ref, className: cn(...slots.root, className), ...props }));
});
Card.displayName = "Card";
export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-col gap-1.5 px-6 py-5", className), ...props })));
CardHeader.displayName = "CardHeader";
export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h3", { ref: ref, className: cn("text-lg font-semibold tracking-[-0.02em] text-[color:var(--sx-color-foreground)]", className), ...props })));
CardTitle.displayName = "CardTitle";
export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn("text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", className), ...props })));
CardDescription.displayName = "CardDescription";
export const CardContent = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("px-6 pb-6", className), ...props })));
CardContent.displayName = "CardContent";
export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex items-center gap-3 px-6 pb-6", className), ...props })));
CardFooter.displayName = "CardFooter";
