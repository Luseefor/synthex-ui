import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Text as NativeText, } from "react-native";
import { useTheme } from "../_shared/theme/context";
export const Label = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(NativeText, { ref: ref, style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
                fontWeight: theme.typography.weight.medium,
                lineHeight: theme.typography.size.sm * theme.typography.lineHeight.normal,
            },
            style,
        ], ...props }));
});
Label.displayName = "Label";
