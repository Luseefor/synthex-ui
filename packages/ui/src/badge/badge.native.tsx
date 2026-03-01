import * as React from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveBadgeVariants, type BadgeSharedProps } from "./badge.shared";

export interface BadgeProps extends Omit<ViewProps, "style">, BadgeSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  children,
  style,
  textStyle,
  variant,
  ...props
}: BadgeProps) {
  const theme = useTheme();
  const resolved = resolveBadgeVariants({ variant });

  const containerStyle: ViewStyle = {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    borderWidth: resolved.variant === "outline" ? 1 : 0,
    borderColor:
      resolved.variant === "outline" ? theme.colors.borderStrong : "transparent",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: {
      default: theme.colors.primaryMuted,
      secondary: theme.colors.secondaryMuted,
      destructive: theme.colors.destructiveMuted,
      outline: "transparent",
    }[resolved.variant],
  };

  const labelStyle: TextStyle = {
    color: {
      default: theme.colors.primary,
      secondary: theme.colors.foreground,
      destructive: theme.colors.destructive,
      outline: theme.colors.foreground,
    }[resolved.variant],
    fontFamily: theme.typography.family.sans,
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {renderBadgeText(children, [labelStyle, textStyle])}
    </View>
  );
}

function renderBadgeText(
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
