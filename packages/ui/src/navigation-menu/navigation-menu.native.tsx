import * as React from "react";
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  NavigationMenuItemProvider,
  NavigationMenuProvider,
  useNavigationMenuContext,
  useNavigationMenuController,
  useNavigationMenuItemContext,
  type NavigationMenuItemSharedProps,
  type NavigationMenuSharedProps,
} from "./navigation-menu.shared";

export interface NavigationMenuProps extends Omit<ViewProps, "style">, NavigationMenuSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function NavigationMenu({
  children,
  defaultValue,
  onValueChange,
  style,
  value,
  ...props
}: NavigationMenuProps) {
  const controller = useNavigationMenuController({ defaultValue, onValueChange, value });

  return (
    <NavigationMenuProvider value={controller}>
      <View style={[{ gap: 16 }, style]} {...props}>
        {children}
      </View>
    </NavigationMenuProvider>
  );
}

export interface NavigationMenuListProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuListProps
>(({ style, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          padding: 8,
          borderRadius: theme.radius.lg + 2,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundSubtle,
        },
        style,
      ]}
      {...props}
    />
  );
});

NavigationMenuList.displayName = "NavigationMenuList";

export interface NavigationMenuItemProps
  extends Omit<ViewProps, "style">,
    NavigationMenuItemSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const NavigationMenuItem = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuItemProps
>(({ children, style, value, ...props }, ref) => (
  <NavigationMenuItemProvider value={{ value }}>
    <View ref={ref} style={style} {...props}>
      {children}
    </View>
  </NavigationMenuItemProvider>
));

NavigationMenuItem.displayName = "NavigationMenuItem";

export interface NavigationMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  NavigationMenuTriggerProps
>(({ children, onPress, style, textStyle, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const theme = useTheme();
  const isActive = context.value === item.value;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ expanded: isActive }}
      onPress={(event) => {
        context.setValue(context.value === item.value ? "" : item.value);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          minWidth: 112,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: isActive ? theme.colors.surface : "transparent",
          opacity: pressed ? 0.94 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          {
            color: isActive ? theme.colors.foreground : theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weight.medium,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
});

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export interface NavigationMenuLinkProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const NavigationMenuLink = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  NavigationMenuLinkProps
>(({ children, style, textStyle, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        {
          minWidth: 112,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 10,
          opacity: pressed ? 0.94 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weight.medium,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
});

NavigationMenuLink.displayName = "NavigationMenuLink";

export interface NavigationMenuContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuContentProps
>(({ children, style, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const theme = useTheme();
  const isActive = context.value === item.value;

  if (!isActive) {
    return null;
  }

  return (
    <View
      ref={ref}
      style={[
        {
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: 20,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

NavigationMenuContent.displayName = "NavigationMenuContent";
