import * as React from "react";
import {
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveInputVariants, type InputSharedProps } from "./input.shared";

export interface InputProps
  extends Omit<NativeTextInputProps, "style">,
    InputSharedProps {
  readonly style?: StyleProp<TextStyle>;
}

export const Input = React.forwardRef<
  React.ElementRef<typeof NativeTextInput>,
  InputProps
>(({ invalid, style, uiSize, ...props }, ref) => {
  const theme = useTheme();
  const resolved = resolveInputVariants({ invalid, uiSize });

  const inputStyle = React.useMemo<TextStyle>(() => {
    const sizeStyle: Record<typeof resolved.size, TextStyle> = {
      sm: {
        minHeight: 36,
        paddingHorizontal: 12,
        fontSize: 13,
      },
      md: {
        minHeight: 40,
        paddingHorizontal: 14,
        fontSize: theme.typography.size.sm,
      },
      lg: {
        minHeight: 44,
        paddingHorizontal: 16,
        fontSize: 15,
      },
    };

    return {
      borderWidth: 1,
      borderRadius: theme.radius.md,
      borderColor:
        resolved.tone === "invalid" ? theme.colors.destructive : theme.colors.border,
      backgroundColor: theme.colors.surfaceRaised,
      color: theme.colors.foreground,
      fontFamily: theme.typography.family.sans,
      ...sizeStyle[resolved.size],
    };
  }, [resolved.size, resolved.tone, theme]);

  return (
    <NativeTextInput
      ref={ref}
      placeholderTextColor={theme.colors.foregroundMuted}
      style={[inputStyle, style]}
      {...props}
    />
  );
});

Input.displayName = "Input";
