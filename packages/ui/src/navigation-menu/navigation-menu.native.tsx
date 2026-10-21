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
  readonly dir?: "ltr" | "rtl";
  readonly orientation?: "horizontal" | "vertical";
  readonly delayDuration?: number;
  readonly skipDelayDuration?: number;
  readonly testID?: string;
}

export function NavigationMenu({
  children,
  defaultValue,
  delayDuration,
  dir,
  onValueChange,
  orientation,
  skipDelayDuration,
  style,
  testID,
  value,
  ...props
}: NavigationMenuProps) {
  // Web-only Radix props; accepted for API parity, ignored native (inline layout).
  void delayDuration;
  void dir;
  void orientation;
  void skipDelayDuration;
  const controller = useNavigationMenuController({ defaultValue, onValueChange, value });

  return (
    <NavigationMenuProvider value={controller}>
      <View testID={testID ?? "navigation-menu"} style={[{ gap: 16 }, style]} {...props}>
        {children}
      </View>
    </NavigationMenuProvider>
  );
}

export interface NavigationMenuListProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const NavigationMenuList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuListProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuListProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View
      ref={ref}
      testID={testID ?? "navigation-menu-list"}
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
  readonly testID?: string;
}

export const NavigationMenuItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuItemProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuItemProps
>(({ children, style, testID, value, ...props }, ref) => (
  <NavigationMenuItemProvider value={{ value }}>
    <View ref={ref} testID={testID ?? "navigation-menu-item"} style={style} {...props}>
      {children}
    </View>
  </NavigationMenuItemProvider>
));

NavigationMenuItem.displayName = "NavigationMenuItem";

export interface NavigationMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const NavigationMenuTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  NavigationMenuTriggerProps
>(({ children, onPress, style, textStyle, asChild, testID, ...props }, ref) => {
  // `asChild` is web-only (Radix Slot); accepted for parity, ignored native.
  void asChild;
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const theme = useTheme();
  const isActive = context.value === item.value;

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "navigation-menu-trigger"}
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
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const NavigationMenuLink: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuLinkProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  NavigationMenuLinkProps
>(({ children, style, textStyle, asChild, testID, ...props }, ref) => {
  // `asChild` is web-only (Radix Slot); accepted for parity, ignored native.
  void asChild;
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "navigation-menu-link"}
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
  readonly testID?: string;
}

export const NavigationMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuContentProps
>(({ children, style, testID, ...props }, ref) => {
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
      testID={testID ?? "navigation-menu-content"}
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

// Web-only viewport container; on native content renders inline. Provided for API parity.
export const NavigationMenuViewport: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Omit<ViewProps, "style"> & { readonly style?: StyleProp<ViewStyle>; readonly testID?: string }> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  Omit<ViewProps, "style"> & { readonly style?: StyleProp<ViewStyle>; readonly testID?: string }
>(({ style, testID, ...props }, ref) => (
  <View ref={ref} testID={testID ?? "navigation-menu-viewport"} style={[{ gap: 16 }, style]} {...props} />
));

NavigationMenuViewport.displayName = "NavigationMenuViewport";
