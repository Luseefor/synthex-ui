import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { separatorVariants, } from "./separator.shared";
const separatorClassStyles = {
    slots: ["root"],
    base: {
        root: "shrink-0 bg-[color:var(--sx-color-border)]",
    },
    variants: {
        orientation: {
            horizontal: {
                root: "h-px w-full",
            },
            vertical: {
                root: "h-full w-px",
            },
        },
    },
};
export function Separator({ className, orientation, ...props }) {
    const slots = resolveVariantStyles(separatorVariants, separatorClassStyles, {
        orientation,
    });
    return (_jsx("div", { role: "separator", "aria-orientation": orientation ?? "horizontal", className: cn(...slots.root, className), ...props }));
}
