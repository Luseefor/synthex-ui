import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Text, TextInput, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { InputOTPProvider, useInputOTPContext, useInputOTPController } from "./input-otp.shared";
export function InputOTP({ children, defaultValue, length, onValueChange, style, value, ...props }) {
    const controller = useInputOTPController({ defaultValue, length, onValueChange, value });
    return (_jsx(InputOTPProvider, { value: controller, children: _jsx(View, { style: style, ...props, children: children }) }));
}
export const InputOTPGroup = React.forwardRef(({ children, style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ flexDirection: "row", alignItems: "center", gap: 8 }, style], ...props, children: children })));
InputOTPGroup.displayName = "InputOTPGroup";
export const InputOTPSlot = React.forwardRef(({ index, style, textStyle, ...props }, ref) => {
    const context = useInputOTPContext();
    const theme = useTheme();
    return (_jsx(TextInput, { ref: ref, keyboardType: "number-pad", maxLength: 1, value: context.value[index] ?? "", onChangeText: (next) => context.setValueAt(index, next), style: [
            {
                width: 44,
                height: 44,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.borderStrong,
                backgroundColor: theme.colors.surface,
                textAlign: "center",
                color: theme.colors.foreground,
                fontSize: theme.typography.size.lg,
                fontWeight: theme.typography.weight.semibold,
            },
            style,
            textStyle,
        ], ...props }));
});
InputOTPSlot.displayName = "InputOTPSlot";
export const InputOTPSeparator = React.forwardRef(({ children = "—", style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Text, { ref: ref, style: [{ color: theme.colors.foregroundMuted }, style], ...props, children: children }));
});
InputOTPSeparator.displayName = "InputOTPSeparator";
