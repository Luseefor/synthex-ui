import * as React from "react";
import { Pressable, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import type { BreadcrumbLinkSharedProps } from "./breadcrumb.shared";

export interface BreadcrumbProps extends Omit<ViewProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const Breadcrumb = React.forwardRef<React.ElementRef<typeof View>, BreadcrumbProps>(
  ({ children, style, ...props }, ref) => <View ref={ref} style={style} {...props}>{children}</View>,
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = React.forwardRef<React.ElementRef<typeof View>, BreadcrumbProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }, style]} {...props}>
      {children}
    </View>
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = React.forwardRef<React.ElementRef<typeof View>, BreadcrumbProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props}>
      {children}
    </View>
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends Omit<PressableProps, "style">, BreadcrumbLinkSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const BreadcrumbLink = React.forwardRef<React.ElementRef<typeof Pressable>, BreadcrumbLinkProps>(
  ({ children, current = false, style, textStyle, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Pressable ref={ref} style={style} accessibilityState={{ selected: current }} {...props}>
        <Text style={[{ color: current ? theme.colors.foreground : theme.colors.foregroundMuted, fontSize: theme.typography.size.sm, fontWeight: current ? theme.typography.weight.semibold : theme.typography.weight.medium }, textStyle]}>
          {children}
        </Text>
      </Pressable>
    );
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export interface BreadcrumbTextProps extends Omit<React.ComponentProps<typeof Text>, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const BreadcrumbPage = React.forwardRef<React.ElementRef<typeof Text>, BreadcrumbTextProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();
    return <Text ref={ref} style={[{ color: theme.colors.foreground, fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold }, style]} {...props} />;
  },
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = React.forwardRef<React.ElementRef<typeof Text>, BreadcrumbTextProps>(
  ({ children = "›", style, ...props }, ref) => {
    const theme = useTheme();
    return <Text ref={ref} style={[{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm }, style]} {...props}>{children}</Text>;
  },
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = React.forwardRef<React.ElementRef<typeof Text>, BreadcrumbTextProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();
    return <Text ref={ref} style={[{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold }, style]} {...props}>…</Text>;
  },
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
