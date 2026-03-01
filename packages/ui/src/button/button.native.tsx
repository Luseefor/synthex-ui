import * as React from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveButtonVariants, type ButtonSharedProps } from "./button.shared";

export interface ButtonProps
  extends Omit<PressableProps, "children" | "style">,
    ButtonSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ children, disabled, size, style, textStyle, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveButtonVariants({ size, variant });

    const styles = React.useMemo(() => {
      const common: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: theme.space.sm,
        borderWidth: resolved.variant === "outline" ? 1 : 0,
        borderColor:
          resolved.variant === "outline" ? theme.colors.borderStrong : "transparent",
      };

      const sizeStyle: Record<typeof resolved.size, ViewStyle> = {
        sm: {
          minHeight: 36,
          paddingHorizontal: 14,
          borderRadius: theme.radius.md,
        },
        md: {
          minHeight: 40,
          paddingHorizontal: 16,
          borderRadius: theme.radius.md,
        },
        lg: {
          minHeight: 44,
          paddingHorizontal: 20,
          borderRadius: theme.radius.lg,
        },
        icon: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
        },
      };

      const toneStyle: Record<typeof resolved.variant, ViewStyle> = {
        default: {
          backgroundColor: theme.colors.primary,
          shadowColor: "#0f172a",
          shadowOpacity: 0.18,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        },
        secondary: {
          backgroundColor: theme.colors.secondaryMuted,
        },
        destructive: {
          backgroundColor: theme.colors.destructive,
        },
        ghost: {
          backgroundColor: "transparent",
        },
        outline: {
          backgroundColor: theme.colors.surface,
        },
        link: {
          backgroundColor: "transparent",
          paddingHorizontal: 0,
          minHeight: 0,
        },
      };

      const labelStyle: Record<typeof resolved.variant, TextStyle> = {
        default: {
          color: theme.colors.foregroundOnBrand,
        },
        secondary: {
          color: theme.colors.foreground,
        },
        destructive: {
          color: theme.colors.foregroundOnBrand,
        },
        ghost: {
          color: theme.colors.foreground,
        },
        outline: {
          color: theme.colors.foreground,
        },
        link: {
          color: theme.colors.primary,
          textDecorationLine: "underline",
        },
      };

      const labelSizeStyle: Record<typeof resolved.size, TextStyle> = {
        sm: {
          fontSize: 13,
        },
        md: {
          fontSize: theme.typography.size.sm,
        },
        lg: {
          fontSize: 15,
        },
        icon: {
          fontSize: theme.typography.size.sm,
        },
      };

      return {
        container: [common, sizeStyle[resolved.size], toneStyle[resolved.variant]] as const,
        label: [
          {
            fontFamily: theme.typography.family.sans,
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.2,
          },
          labelSizeStyle[resolved.size],
          labelStyle[resolved.variant],
        ] as const,
        pressed: {
          opacity: 0.92,
        } as const,
        disabled: {
          opacity: 0.45,
        } as const,
      };
    }, [resolved.size, resolved.variant, theme]);

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        disabled={disabled}
        style={({ pressed }) => [
          ...styles.container,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        {renderButtonChildren(children, [styles.label, textStyle])}
      </Pressable>
    );
  },
);

Button.displayName = "Button";

function renderButtonChildren(
  children: React.ReactNode,
  textStyle: StyleProp<TextStyle>,
) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <Text style={textStyle}>{child}</Text>;
    }

    return child;
  });
}
