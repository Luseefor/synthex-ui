import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveProgressVariants } from "./progress.shared";
export const Progress = React.forwardRef(({ max = 100, size, style, value = 0, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveProgressVariants({ size });
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = max <= 0 ? 0 : clampedValue / max;
    const heights = {
        sm: 8,
        md: 12,
        lg: 16,
    };
    return (_jsx(View, { ref: ref, accessibilityRole: "progressbar", style: [
            {
                overflow: "hidden",
                borderRadius: 999,
                height: heights[resolved.size],
                backgroundColor: theme.colors.secondaryMuted,
            },
            style,
        ], ...props, children: _jsx(View, { style: {
                width: `${percentage * 100}%`,
                height: "100%",
                backgroundColor: theme.colors.primary,
                borderRadius: 999,
            } }) }));
});
Progress.displayName = "Progress";
