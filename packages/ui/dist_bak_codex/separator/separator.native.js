import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveSeparatorVariants, } from "./separator.shared";
export function Separator({ orientation, style, ...props }) {
    const theme = useTheme();
    const resolved = resolveSeparatorVariants({ orientation });
    return (_jsx(View, { style: [
            {
                backgroundColor: theme.colors.border,
            },
            resolved.orientation === "horizontal"
                ? {
                    height: 1,
                    width: "100%",
                }
                : {
                    height: "100%",
                    width: 1,
                },
            style,
        ], ...props }));
}
