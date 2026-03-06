import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
export const AspectRatio = React.forwardRef(({ children, className, ratio = 16 / 9, style, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("relative w-full overflow-hidden", className), style: { aspectRatio: String(ratio), ...style }, ...props, children: _jsx("div", { className: "absolute inset-0", children: children }) })));
AspectRatio.displayName = "AspectRatio";
