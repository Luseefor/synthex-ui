import * as React from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { useTheme } from "../_shared/theme/context";
import { resolveToggleVariants, type ToggleSharedProps } from "./toggle.shared";

export interface ToggleProps
  extends Omit<PressableProps, "children" | "style">,
    ToggleSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const Toggle = React.forwardRef<React.ElementRef<typeof Pressable>, ToggleProps>(
  (
    {
      children,
      defaultPressed = false,
      onPress,
      onPressedChange,
      pressed,
      size,
      style,
      textStyle,
      variant,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const [currentPressed, setCurrentPressed] = useControllableState({
      defaultValue: defaultPressed,
      onChange: onPressedChange,
      value: pressed,
    });
    const resolved = resolveToggleVariants({ size, variant });

    const containerStyle = React.useMemo<ViewStyle>(() => {
      const sizeStyle: Record<typeof resolved.size, ViewStyle> = {
        sm: { minHeight: 36, paddingHorizontal: 14, borderRadius: theme.radius.md },
        md: { minHeight: 40, paddingHorizontal: 16, borderRadius: theme.radius.md },
        lg: { minHeight: 44, paddingHorizontal: 20, borderRadius: theme.radius.lg },
      };

      const toneStyle: ViewStyle =
        resolved.variant === "default"
          ? currentPressed
            ? { backgroundColor: theme.colors.primary }
            : { backgroundColor: theme.colors.secondaryMuted }
          : {
              backgroundColor: currentPressed
                ? theme.colors.primaryMuted
                : theme.colors.surface,
              borderWidth: 1,
              borderColor: currentPressed ? theme.colors.primary : theme.colors.borderStrong,
            };

      return {
        alignItems: "center",
        justifyContent: "center",
        ...sizeStyle[resolved.size],
        ...toneStyle,
      };
    }, [currentPressed, resolved.size, resolved.variant, theme]);

    const labelStyle = React.useMemo<TextStyle>(
      () => ({
        color:
          resolved.variant === "default" && currentPressed
            ? theme.colors.foregroundOnBrand
            : currentPressed
              ? theme.colors.primary
              : theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        fontSize:
          resolved.size === "sm"
            ? 13
            : resolved.size === "lg"
              ? 15
              : theme.typography.size.sm,
        fontWeight: theme.typography.weight.semibold,
        letterSpacing: -0.2,
      }),
      [currentPressed, resolved.size, resolved.variant, theme],
    );

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ selected: currentPressed }}
        onPress={(event) => {
          onPress?.(event);

          if (event.defaultPrevented) {
            return;
          }

          setCurrentPressed(!currentPressed);
        }}
        style={({ pressed: isPressed }) => [
          containerStyle,
          isPressed && { opacity: 0.92 },
          style,
        ]}
        {...props}
      >
        {typeof children === "string" || typeof children === "number" ? (
          <Text style={[labelStyle, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

Toggle.displayName = "Toggle";
