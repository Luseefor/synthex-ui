import * as React from "react";
import {
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
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
    const sizeStyle: Record<typeof resolved.size, TextStyle> = {
      sm: {
        minHeight: 104,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
      },
      md: {
        minHeight: 128,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: theme.typography.size.sm,
      },
      lg: {
        minHeight: 160,
        paddingHorizontal: 16,
        paddingVertical: 14,
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
      textAlignVertical: "top",
      ...sizeStyle[resolved.size],
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
