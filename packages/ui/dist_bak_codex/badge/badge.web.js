import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { badgeVariants } from "./badge.shared";
const badgeClassStyles = {
    slots: ["root"],
    base: {
        root: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--sx-color-ring)] focus:ring-offset-2",
    },
    variants: {
        variant: {
            default: {
                root: "border-transparent bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] hover:bg-[color:var(--sx-color-primary)]/80",
            },
            secondary: {
                root: "border-transparent bg-[color:var(--sx-color-secondary)] text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-secondary)]/80",
            },
            destructive: {
                root: "border-transparent bg-[color:var(--sx-color-destructive)] text-[color:var(--sx-color-foreground-on-brand)] hover:bg-[color:var(--sx-color-destructive)]/80",
            },
            outline: {
                root: "border-[color:var(--sx-color-border-strong)] bg-transparent text-[color:var(--sx-color-foreground)]",
            },
        },
    },
};
export function Badge({ className, variant, ...props }) {
    const slots = resolveVariantStyles(badgeVariants, badgeClassStyles, { variant });
    return _jsx("div", { className: cn(...slots.root, className), ...props });
}
