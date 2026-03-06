import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { TextInput as NativeTextInput, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { createFieldControlStyle } from "../_shared/field-control.native";
import { resolveTextareaVariants, } from "./textarea.shared";
export const Textarea = React.forwardRef(({ invalid, style, uiSize, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveTextareaVariants({ invalid, uiSize });
    const textareaStyle = React.useMemo(() => {
        return {
            ...createFieldControlStyle(theme, {
                multiline: true,
                size: resolved.size,
                tone: resolved.tone,
            }),
            textAlignVertical: "top",
        };
    }, [resolved.size, resolved.tone, theme]);
    return (_jsx(NativeTextInput, { ref: ref, multiline: true, placeholderTextColor: theme.colors.foregroundMuted, style: [textareaStyle, style], ...props }));
});
Textarea.displayName = "Textarea";
