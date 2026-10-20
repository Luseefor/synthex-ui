import * as React from "react";
import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";

interface NativeTypographyProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const H1 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
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

export const H2 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
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

export const H3 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
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

export const Lead = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
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

export const Muted = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
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

export const Small = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
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

export const H4 = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text
        ref={ref}
        testID={testID ?? "typography-h4"}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.semibold,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);
H4.displayName = "H4";
export const P = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text
        ref={ref}
        testID={testID ?? "typography-p"}
        style={[
          {
            color: theme.colors.foreground,
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
P.displayName = "P";
export const Blockquote = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text
        ref={ref}
        testID={testID ?? "typography-blockquote"}
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            fontStyle: "italic",
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.border,
            paddingLeft: 12,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);
Blockquote.displayName = "Blockquote";
export const Code = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text
        ref={ref}
        testID={testID ?? "typography-code"}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.mono,
            fontSize: theme.typography.size.sm,
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.sm,
            paddingHorizontal: 4,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);
Code.displayName = "Code";
export const Large = React.forwardRef<React.ElementRef<typeof Text>, NativeTypographyProps & { readonly testID?: string }>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text
        ref={ref}
        testID={testID ?? "typography-large"}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.lg,
            fontWeight: theme.typography.weight.semibold,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);
Large.displayName = "Large";
