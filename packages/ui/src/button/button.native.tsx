import * as React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { renderNativeInlineText } from "../_shared/native-text";
import { useTheme } from "../_shared/theme/context";
import { resolveButtonVariants, type ButtonSharedProps } from "./button.shared";

export interface ButtonProps
  extends Omit<PressableProps, "children" | "style">,
    ButtonSharedProps {
  readonly asChild?: boolean;
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const Button: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ButtonProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      asChild,
      accessibilityState,
      children,
      disabled,
      onPress,
      size,
      style,
      textStyle,
      variant,
      ...props
    },
    ref,
  ) => {
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
        // "default" is an alias of "md".
        default: {
          minHeight: 40,
          paddingHorizontal: 16,
          borderRadius: theme.radius.md,
        },
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
          color: theme.colors.foregroundOnDestructive ?? theme.colors.foregroundOnBrand,
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
        // "default" is an alias of "md".
        default: {
          fontSize: theme.typography.size.sm,
        },
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

    type AsChildProps = {
      accessibilityState?: PressableProps["accessibilityState"];
      children?: React.ReactNode;
      disabled?: boolean;
      style?: StyleProp<ViewStyle>;
      [key: string]: unknown;
    };

    const childElement =
      asChild && React.isValidElement<AsChildProps>(children) ? children : null;
    // React 19: ref lives on props. Never read `element.ref` (warns).
    const childRef = (
      childElement?.props as { ref?: React.Ref<React.ElementRef<typeof Pressable>> } | undefined
    )?.ref;
    const mergedRef = React.useCallback(
      (node: React.ElementRef<typeof Pressable> | null) => {
        const cleanups = [childRef, ref].map((target) => {
          if (typeof target === "function") {
            const cleanup = target(node);
            return typeof cleanup === "function" ? cleanup : () => { target(null); };
          }
          if (target) {
            target.current = node;
            return () => { target.current = null; };
          }
          return undefined;
        });
        return () => { for (const cleanup of cleanups) cleanup?.(); };
      },
      [childRef, ref],
    );

    if (childElement) {
      const childOnPress = childElement.props.onPress as
        | ((event: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => void)
        | undefined;
      const childAccessibilityState = childElement.props.accessibilityState as
        | PressableProps["accessibilityState"]
        | undefined;
      const isDisabled = !!disabled || !!childElement.props.disabled;
      return React.cloneElement(childElement, {
        ref: mergedRef,
        accessibilityRole: "button",
        disabled: isDisabled,
        ...props,
        accessibilityState: {
          ...childAccessibilityState,
          ...accessibilityState,
          disabled: isDisabled,
        },
        onPress: (event: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
          if (isDisabled) {
            return;
          }
          childOnPress?.(event);
          if (event.defaultPrevented) {
            return;
          }
          onPress?.(event);
        },
        style: [styles.container, isDisabled && styles.disabled, style, childElement.props.style],
      });
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
        disabled={disabled}
        onPress={(event) => {
          if (disabled) {
            return;
          }
          onPress?.(event);
        }}
        style={({ pressed }) => [
          ...styles.container,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        {renderNativeInlineText(children, [styles.label, textStyle])}
      </Pressable>
    );
  },
);

Button.displayName = "Button";
