import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { resolveProgressVariants } from "./progress.shared";
export const Progress = React.forwardRef(({ className, max = 100, size, value = 0, ...props }, ref) => {
    const resolved = resolveProgressVariants({ size });
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = max <= 0 ? 0 : (clampedValue / max) * 100;
    return (_jsx("div", { ref: ref, role: "progressbar", "aria-valuemax": max, "aria-valuemin": 0, "aria-valuenow": Math.round(clampedValue), className: cn("relative w-full overflow-hidden rounded-full bg-[color:var(--sx-color-secondary-muted)]", resolved.size === "sm"
            ? "h-2"
            : resolved.size === "lg"
                ? "h-4"
                : "h-3", className), ...props, children: _jsx("div", { className: "h-full rounded-full bg-[linear-gradient(90deg,var(--sx-color-primary)_0%,color-mix(in_srgb,var(--sx-color-primary)_84%,white_16%)_100%)] transition-[width] duration-300 ease-out", style: { width: `${percentage}%` } }) }));
});
Progress.displayName = "Progress";
