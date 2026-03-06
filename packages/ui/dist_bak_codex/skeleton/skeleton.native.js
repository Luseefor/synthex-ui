import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveSkeletonVariants } from "./skeleton.shared";
export const Skeleton = React.forwardRef(({ style, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveSkeletonVariants({ variant });
    return (_jsx(View, { ref: ref, style: [
            {
                borderRadius: theme.radius.md,
                backgroundColor: resolved.variant === "soft"
                    ? theme.colors.surfaceMuted
                    : theme.colors.secondaryMuted,
            },
            style,
        ], ...props }));
});
Skeleton.displayName = "Skeleton";
