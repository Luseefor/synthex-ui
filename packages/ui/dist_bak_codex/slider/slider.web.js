import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { useControllableState } from "../hooks/useControllableState";
export const Slider = React.forwardRef(({ className, defaultValue = [50], max = 100, min = 0, onValueChange, step = 1, value, ...props }, ref) => {
    const [currentValue, setCurrentValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    const percentage = (((currentValue[0] ?? min) - min) / (max - min || 1)) * 100;
    return (_jsxs("div", { className: cn("relative flex h-10 w-full items-center", className), children: [_jsx("div", { className: "absolute left-0 right-0 h-2 rounded-full bg-[color:var(--sx-color-secondary-muted)]" }), _jsx("div", { "aria-hidden": "true", className: "absolute left-0 h-2 rounded-full bg-[color:var(--sx-color-primary)]", style: { width: `${percentage}%` } }), _jsx("input", { ref: ref, type: "range", min: min, max: max, step: step, value: currentValue[0] ?? min, className: "relative z-10 h-10 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[color:var(--sx-color-border-strong)] [&::-webkit-slider-thumb]:bg-[color:var(--sx-color-surface)] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(15,23,42,0.12)]", onChange: (event) => setCurrentValue([Number(event.currentTarget.value)]), ...props })] }));
});
Slider.displayName = "Slider";
