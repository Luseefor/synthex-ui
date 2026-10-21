import * as React from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveAlertVariants, type AlertSharedProps } from "./alert.shared";

export interface AlertProps extends Omit<ViewProps, "style">, AlertSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

const AlertVariantContext = React.createContext<AlertSharedProps["variant"] | undefined>(
  undefined,
);

export const Alert: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AlertProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, AlertProps>(
  ({ style, testID, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveAlertVariants({ variant });

    const alertStyle = React.useMemo<ViewStyle>(() => {
      const tones: Record<typeof resolved.variant, ViewStyle> = {
        default: {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        destructive: {
          borderColor: theme.colors.destructive,
          backgroundColor: theme.colors.destructiveMuted,
        },
        success: {
          borderColor: theme.colors.accent,
          backgroundColor: theme.colors.accentMuted,
        },
        warning: {
          borderColor: "#d97706",
          backgroundColor: "rgba(245,158,11,0.14)",
        },
      };

      return {
        borderWidth: 1,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 6,
        ...tones[resolved.variant],
      };
    }, [resolved.variant, theme]);

    return (
      <AlertVariantContext.Provider value={variant}>
        <View ref={ref} testID={testID ?? "alert"} style={[alertStyle, style]} {...props} />
      </AlertVariantContext.Provider>
    );
  },
);

Alert.displayName = "Alert";

export interface AlertTextProps extends Omit<TextProps, "style">, AlertSharedProps {
  readonly style?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const AlertTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AlertTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, AlertTextProps>(
  ({ style, testID, variant, ...props }, ref) => {
    const theme = useTheme();
    const contextVariant = React.useContext(AlertVariantContext);
    const resolved = resolveAlertVariants({ variant: variant ?? contextVariant });
    const color =
      resolved.variant === "destructive"
        ? theme.colors.destructive
        : resolved.variant === "success"
          ? theme.colors.accent
          : resolved.variant === "warning"
            ? "#b45309"
            : theme.colors.foreground;

    return (
      <Text
        ref={ref}
        testID={testID ?? "alert-title"}
        style={[
          {
            color,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.2,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

AlertTitle.displayName = "AlertTitle";

export const AlertDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AlertTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<
  React.ElementRef<typeof Text>,
  AlertTextProps
>(({ style, testID, variant, ...props }, ref) => {
  const theme = useTheme();
  const contextVariant = React.useContext(AlertVariantContext);
  const resolved = resolveAlertVariants({ variant: variant ?? contextVariant });
  const color =
    resolved.variant === "destructive"
      ? theme.colors.destructive
      : resolved.variant === "success"
        ? theme.colors.accent
        : resolved.variant === "warning"
          ? "#b45309"
          : theme.colors.foregroundMuted;

  return (
    <Text
      ref={ref}
      testID={testID ?? "alert-description"}
      style={[
        {
          color,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
          lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
        },
        style,
      ]}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";
