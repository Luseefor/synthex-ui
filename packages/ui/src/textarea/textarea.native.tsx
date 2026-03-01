import * as React from "react";
import {
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { createFieldControlStyle } from "../_shared/field-control.native";
import {
  resolveTextareaVariants,
  type TextareaSharedProps,
} from "./textarea.shared";

export interface TextareaProps
  extends Omit<NativeTextInputProps, "style">,
    TextareaSharedProps {
  readonly style?: StyleProp<TextStyle>;
}

export const Textarea = React.forwardRef<
  React.ElementRef<typeof NativeTextInput>,
  TextareaProps
>(({ invalid, style, uiSize, ...props }, ref) => {
  const theme = useTheme();
  const resolved = resolveTextareaVariants({ invalid, uiSize });

  const textareaStyle = React.useMemo<TextStyle>(() => {
    return {
      ...createFieldControlStyle(theme, {
        multiline: true,
        size: resolved.size,
        tone: resolved.tone,
      }),
      textAlignVertical: "top",
    };
  }, [resolved.size, resolved.tone, theme]);

  return (
    <NativeTextInput
      ref={ref}
      multiline
      placeholderTextColor={theme.colors.foregroundMuted}
      style={[textareaStyle, style]}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
