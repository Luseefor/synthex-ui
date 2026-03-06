import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
export const Label = React.forwardRef(({ className, ...props }, ref) => (_jsx("label", { ref: ref, className: cn("text-sm font-medium leading-none tracking-[-0.01em] text-[color:var(--sx-color-foreground)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className), ...props })));
Label.displayName = "Label";
