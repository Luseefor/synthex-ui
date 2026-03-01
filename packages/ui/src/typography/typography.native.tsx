import * as React from "react";
import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";

interface NativeTypographyProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const H1 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size["4xl"],
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.8,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

H1.displayName = "H1";

export const H2 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size["3xl"],
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.5,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

H2.displayName = "H2";

export const H3 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size["2xl"],
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.35,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

H3.displayName = "H3";

export const Lead = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.lg,
            lineHeight: theme.typography.size.lg * theme.typography.lineHeight.relaxed,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

Lead.displayName = "Lead";

export const Muted = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

Muted.displayName = "Muted";

export const Small = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xs,
            fontWeight: theme.typography.weight.medium,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

Small.displayName = "Small";
