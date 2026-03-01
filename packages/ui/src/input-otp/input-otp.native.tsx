import * as React from "react";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { InputOTPProvider, useInputOTPContext, useInputOTPController, type InputOTPSharedProps } from "./input-otp.shared";

export interface InputOTPProps extends Omit<ViewProps, "style">, InputOTPSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function InputOTP({ children, defaultValue, length, onValueChange, style, value, ...props }: InputOTPProps) {
  const controller = useInputOTPController({ defaultValue, length, onValueChange, value });
  return (
    <InputOTPProvider value={controller}>
      <View style={style} {...props}>{children}</View>
    </InputOTPProvider>
  );
}

export interface InputOTPGroupProps extends Omit<ViewProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const InputOTPGroup = React.forwardRef<React.ElementRef<typeof View>, InputOTPGroupProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props}>
      {children}
    </View>
  ),
);
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends Omit<React.ComponentProps<typeof TextInput>, "onChangeText" | "style" | "value"> {
  readonly index: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const InputOTPSlot = React.forwardRef<React.ElementRef<typeof TextInput>, InputOTPSlotProps>(
  ({ index, style, textStyle, ...props }, ref) => {
    const context = useInputOTPContext();
    const theme = useTheme();

    return (
      <TextInput
        ref={ref}
        keyboardType="number-pad"
        maxLength={1}
        value={context.value[index] ?? ""}
        onChangeText={(next) => context.setValueAt(index, next)}
        style={[
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
          style as StyleProp<TextStyle>,
          textStyle,
        ]}
        {...props}
      />
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<React.ElementRef<typeof Text>, React.ComponentProps<typeof Text>>(
  ({ children = "—", style, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text ref={ref} style={[{ color: theme.colors.foregroundMuted }, style]} {...props}>
        {children}
      </Text>
    );
  },
);
InputOTPSeparator.displayName = "InputOTPSeparator";
