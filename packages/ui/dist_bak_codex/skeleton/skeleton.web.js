import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { resolveSkeletonVariants } from "./skeleton.shared";
export const Skeleton = React.forwardRef(({ className, variant, ...props }, ref) => {
    const resolved = resolveSkeletonVariants({ variant });
    return (_jsx("div", { ref: ref, className: cn("animate-pulse rounded-[var(--sx-radius-md)]", resolved.variant === "soft"
            ? "bg-[color:color-mix(in_srgb,var(--sx-color-secondary-muted)_76%,white_24%)]"
            : "bg-[color:var(--sx-color-secondary-muted)]", className), ...props }));
});
Skeleton.displayName = "Skeleton";
