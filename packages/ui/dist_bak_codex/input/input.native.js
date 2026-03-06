import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { TextInput as NativeTextInput, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { createFieldControlStyle } from "../_shared/field-control.native";
import { resolveInputVariants } from "./input.shared";
export const Input = React.forwardRef(({ invalid, style, uiSize, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveInputVariants({ invalid, uiSize });
    const inputStyle = React.useMemo(() => {
        return {
            ...createFieldControlStyle(theme, {
                size: resolved.size,
                tone: resolved.tone,
            }),
        };
    }, [resolved.size, resolved.tone, theme]);
    return (_jsx(NativeTextInput, { ref: ref, placeholderTextColor: theme.colors.foregroundMuted, style: [inputStyle, style], ...props }));
});
Input.displayName = "Input";
