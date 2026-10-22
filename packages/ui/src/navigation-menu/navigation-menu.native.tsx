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
import { NativeOverlayProvider, NativeOverlayContent, useNativeOverlayTriggerRef } from "../_shared/overlay.native";
import { NativePressableAction, composeNativePressableStyles } from "../_shared/pressable.native";
import { NativeDirectionContext } from "../_shared/direction-context.native";
import type { OverlayPositionProps } from "../_shared/positioning";
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

const NativeNavigationLayout = React.createContext<"horizontal" | "vertical">("horizontal");
const NativeNavigationDismiss = React.createContext<() => void>(() => {});

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
  orientation = "horizontal",
  skipDelayDuration,
  style,
  testID,
  value,
  ...props
}: NavigationMenuProps) {
  // Native opens explicitly by press; web hover delays do not apply.
  void delayDuration;
  void skipDelayDuration;
  const controller = useNavigationMenuController({ defaultValue, onValueChange, value });

  const inherited = React.useContext(NativeDirectionContext);
  const direction = React.useMemo(() => ({ ...inherited, dir: dir ?? inherited.dir }), [inherited, dir]);
  return (
    <NativeDirectionContext.Provider value={direction}>
    <NativeNavigationLayout.Provider value={orientation}>
    <NativeNavigationDismiss.Provider value={() => controller.setValue("")}>
    <NavigationMenuProvider value={controller}>
      <View testID={testID ?? "navigation-menu"} style={[{ gap: 16 }, style, { direction: direction.dir }]} {...props}>
        {children}
      </View>
    </NavigationMenuProvider>
    </NativeNavigationDismiss.Provider>
    </NativeNavigationLayout.Provider>
    </NativeDirectionContext.Provider>
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
  const orientation = React.useContext(NativeNavigationLayout);

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
        { flexDirection: orientation === "vertical" ? "column" : "row" },
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
    <NativeOverlayProvider>
    <View ref={ref} testID={testID ?? "navigation-menu-item"} style={style} {...props}>
      {children}
    </View>
    </NativeOverlayProvider>
  </NavigationMenuItemProvider>
));

NavigationMenuItem.displayName = "NavigationMenuItem";

export interface NavigationMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly textStyle?: StyleProp<TextStyle>;
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const NavigationMenuTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, NavigationMenuTriggerProps>(({ children, style, textStyle, asChild, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const active = context.value === item.value;
  const anchorRef = useNativeOverlayTriggerRef(ref);
  const theme = useTheme();
  const defaultStyle: PressableProps["style"] = ({ pressed }) => ({
    minWidth: 112, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 10, opacity: pressed ? 0.94 : 1,
    backgroundColor: active ? theme.colors.surface : "transparent",
  });
  return <NativePressableAction {...props} forwardedRef={anchorRef} collapsable={false} expanded={active} onAction={() => context.setValue(active ? "" : item.value)} asChild={asChild}
    defaultTestID="navigation-menu-trigger" style={composeNativePressableStyles(defaultStyle, style)}>
    {asChild ? children : <Text style={[
      { color: active ? theme.colors.foreground : theme.colors.foregroundMuted, fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium }, textStyle,
    ]}>{children}</Text>}
  </NativePressableAction>;
});

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export interface NavigationMenuLinkProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly textStyle?: StyleProp<TextStyle>;
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const NavigationMenuLink: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuLinkProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, NavigationMenuLinkProps>(({ children, style, textStyle, asChild, ...props }, ref) => {
  const dismiss = React.useContext(NativeNavigationDismiss);
  const theme = useTheme();
  const defaultStyle: PressableProps["style"] = ({ pressed }) => ({
    minWidth: 112, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md,
    paddingHorizontal: 12, paddingVertical: 10, opacity: pressed ? 0.94 : 1,
  });
  return <NativePressableAction {...props} forwardedRef={ref} defaultRole="link" onAction={dismiss} asChild={asChild}
    defaultTestID="navigation-menu-link" style={composeNativePressableStyles(defaultStyle, style)}>
    {asChild ? children : <Text style={[
      { color: theme.colors.foregroundMuted, fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium }, textStyle,
    ]}>{children}</Text>}
  </NativePressableAction>;
});

NavigationMenuLink.displayName = "NavigationMenuLink";

export interface NavigationMenuContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const NavigationMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NavigationMenuContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  NavigationMenuContentProps
>(({ children, style, testID, side, align, sideOffset, alignOffset, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const theme = useTheme();
  const isActive = context.value === item.value;

  return (
    <NativeOverlayContent
      open={isActive} onDismiss={() => context.setValue("")}
      side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}
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
    </NativeOverlayContent>
  );
});

NavigationMenuContent.displayName = "NavigationMenuContent";

// Compatibility layout container. Each native item owns its anchored Modal surface.
export const NavigationMenuViewport: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Omit<ViewProps, "style"> & { readonly style?: StyleProp<ViewStyle>; readonly testID?: string }> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  Omit<ViewProps, "style"> & { readonly style?: StyleProp<ViewStyle>; readonly testID?: string }
>(({ style, testID, ...props }, ref) => (
  <View ref={ref} testID={testID ?? "navigation-menu-viewport"} style={[{ gap: 16 }, style]} {...props} />
));

NavigationMenuViewport.displayName = "NavigationMenuViewport";
