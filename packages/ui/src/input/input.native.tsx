import * as React from "react";
import {
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { createFieldControlStyle } from "../_shared/field-control.native";
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
    return {
      ...createFieldControlStyle(theme, {
        size: resolved.size,
        tone: resolved.tone,
      }),
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
