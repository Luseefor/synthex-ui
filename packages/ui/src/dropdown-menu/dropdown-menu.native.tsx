import * as React from "react";
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { useControllableState } from "../hooks/useControllableState";
import { CheckIcon, ChevronRightIcon } from "../icons/index.native";
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  DropdownMenuProvider,
  useDropdownMenuContext,
  useDropdownMenuController,
  useDropdownMenuRadioGroupController,
  DropdownMenuRadioGroupProvider,
  useOptionalDropdownMenuRadioGroupContext,
  useDropdownMenuSubContext,
  useDropdownMenuSubController,
  DropdownMenuSubProvider,
  type DropdownMenuCheckboxItemSharedProps,
  type DropdownMenuRadioGroupSharedProps,
  type DropdownMenuRadioItemSharedProps,
  type DropdownMenuSharedProps,
  type DropdownMenuSubSharedProps,
} from "./dropdown-menu.shared";

export interface DropdownMenuProps
  extends Omit<ViewProps, "children" | "style">,
  DropdownMenuSharedProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly dir?: "ltr" | "rtl";
  readonly modal?: boolean;
}

export function DropdownMenu({
  children,
  defaultOpen,
  dir,
  modal,
  onOpenChange,
  open,
  style,
  testID,
  ...props
}: DropdownMenuProps) {
  void modal;
  const controller = useDropdownMenuController({ defaultOpen, onOpenChange, open });

  return (
    <DropdownMenuProvider value={controller}>
      <View
        testID={testID ?? "dropdown-menu"}
        style={[{ position: "relative" }, dir ? { direction: dir } : null, style]}
        {...props}
      >
        {children}
      </View>
    </DropdownMenuProvider>
  );
}

export interface DropdownMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const DropdownMenuTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useDropdownMenuContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(!context.open);
      onPress?.(event);
    },
    [context, onPress]
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      ...props,
      testID: testID ?? "dropdown-menu-trigger",
      accessibilityRole: "button",
      accessibilityState: { expanded: context.open },
      onPress: (e: GestureResponderEvent) => {
        handlePress(e);
        children.props.onPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-trigger"}
      accessibilityRole="button"
      accessibilityState={{ expanded: context.open }}
      onPress={handlePress}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
}

// Native renders in normal flow; side/align/sideOffset/alignOffset are accepted for API parity and ignored.
export const DropdownMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = useDropdownMenuContext();
  const theme = useTheme();

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      testID={testID ?? "dropdown-menu-content"}
      style={[
        {
          marginTop: 8,
          minWidth: 224,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg + 2,
          backgroundColor: theme.colors.surface,
          padding: 6,
          gap: 4,
        },
        style,
      ]}
      {...props}
    />
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuLabelProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuLabelProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuLabelProps
>(({ children, style, textStyle, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View ref={ref} testID={testID ?? "dropdown-menu-label"} style={[{ paddingHorizontal: 12, paddingVertical: 8 }, style]} {...props}>
      <Text
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: 11,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
});

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DropdownMenuSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuSeparatorProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuSeparatorProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View
      ref={ref}
      testID={testID ?? "dropdown-menu-separator"}
      style={[{ marginVertical: 4, height: 1, backgroundColor: theme.colors.border }, style]}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuItemProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuItemProps
>(({ children, onPress, style, textStyle, testID, ...props }, ref) => {
  const context = useDropdownMenuContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-item"}
      accessibilityRole="button"
      onPress={(event) => {
        onPress?.(event);
        context.setOpen(false);
      }}
      style={({ pressed }) => [
        {
          minHeight: 40,
          borderRadius: theme.radius.md,
          justifyContent: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
        },
        style,
      ]}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={[
            {
              color: theme.colors.foreground,
              fontFamily: theme.typography.family.sans,
              fontSize: theme.typography.size.sm,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuSubProps extends Omit<ViewProps, "style">, DropdownMenuSubSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function DropdownMenuSub({ children, defaultOpen, onOpenChange, open, style, testID, ...props }: DropdownMenuSubProps) {
  const controller = useDropdownMenuSubController({ defaultOpen, onOpenChange, open });

  return (
    <DropdownMenuSubProvider value={controller}>
      <View testID={testID ?? "dropdown-menu-sub"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </DropdownMenuSubProvider>
  );
}

export interface DropdownMenuSubTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuSubTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuSubTriggerProps
>(({ children, onPress, style, textStyle, testID, ...props }, ref) => {
  const sub = useDropdownMenuSubContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-sub-trigger"}
      accessibilityRole="button"
      accessibilityState={{ expanded: sub.open }}
      accessibilityHint="Opens submenu"
      onPress={(event) => {
        sub.setOpen(!sub.open);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          minHeight: 40,
          borderRadius: theme.radius.md,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: pressed || sub.open ? theme.colors.surfaceMuted : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
        {typeof children === "string" || typeof children === "number" ? (
          <Text
            style={[
              { color: theme.colors.foreground, fontFamily: theme.typography.family.sans, fontSize: theme.typography.size.sm },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
      <ChevronRightIcon size={14} />
    </Pressable>
  );
});

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export interface DropdownMenuSubContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DropdownMenuSubContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuSubContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuSubContentProps
>(({ style, testID, ...props }, ref) => {
  const sub = useDropdownMenuSubContext();
  const theme = useTheme();

  if (!sub.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      testID={testID ?? "dropdown-menu-sub-content"}
      style={[
        {
          marginTop: 4,
          marginLeft: 16,
          minWidth: 176,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg + 2,
          backgroundColor: theme.colors.surface,
          padding: 6,
          gap: 4,
        },
        style,
      ]}
      {...props}
    />
  );
});

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export interface DropdownMenuCheckboxItemProps extends Omit<PressableProps, "style">, DropdownMenuCheckboxItemSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuCheckboxItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuCheckboxItemProps
>(({ children, checked, defaultChecked = false, onCheckedChange, onPress, style, textStyle, testID, ...props }, ref) => {
  const theme = useTheme();
  const [currentChecked, setCurrentChecked] = useControllableState<boolean>({
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
    value: checked,
  });

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-checkbox-item"}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: currentChecked }}
      onPress={(event) => {
        setCurrentChecked(!currentChecked);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          minHeight: 40,
          borderRadius: theme.radius.md,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <View style={{ width: 16, alignItems: "center", justifyContent: "center" }}>
        {currentChecked ? <CheckIcon size={14} strokeWidth={2.4} /> : null}
      </View>
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={[
            { flex: 1, color: theme.colors.foreground, fontFamily: theme.typography.family.sans, fontSize: theme.typography.size.sm },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </Pressable>
  );
});

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export interface DropdownMenuRadioGroupProps extends Omit<ViewProps, "style">, DropdownMenuRadioGroupSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function DropdownMenuRadioGroup({ children, defaultValue, onValueChange, value, style, testID, ...props }: DropdownMenuRadioGroupProps) {
  const controller = useDropdownMenuRadioGroupController({ defaultValue, onValueChange, value });

  return (
    <DropdownMenuRadioGroupProvider value={controller}>
      <View testID={testID ?? "dropdown-menu-radio-group"} style={style} {...props}>
        {children}
      </View>
    </DropdownMenuRadioGroupProvider>
  );
}

export interface DropdownMenuRadioItemProps extends Omit<PressableProps, "style">, DropdownMenuRadioItemSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuRadioItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuRadioItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuRadioItemProps
>(({ children, onPress, style, textStyle, value, testID, ...props }, ref) => {
  const theme = useTheme();
  const group = useOptionalDropdownMenuRadioGroupContext();
  const checked = group ? group.value === value : false;

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-radio-item"}
      accessibilityRole="radio"
      accessibilityState={{ checked, selected: checked }}
      onPress={(event) => {
        group?.onValueChange(value);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          minHeight: 40,
          borderRadius: theme.radius.md,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <View style={{ width: 16, alignItems: "center", justifyContent: "center" }}>
        {checked ? (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.foreground }} />
        ) : null}
      </View>
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={[
            { flex: 1, color: theme.colors.foreground, fontFamily: theme.typography.family.sans, fontSize: theme.typography.size.sm },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </Pressable>
  );
});

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export interface DropdownMenuShortcutProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuShortcut: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuShortcutProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DropdownMenuShortcutProps>(
  ({ children, style, textStyle, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View ref={ref} testID={testID ?? "dropdown-menu-shortcut"} style={[{ marginLeft: "auto", paddingLeft: 16 }, style]} {...props}>
        {typeof children === "string" || typeof children === "number" ? (
          <Text
            style={[
              {
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: 12,
                letterSpacing: 1,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    );
  },
);

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export interface DropdownMenuArrowProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DropdownMenuArrow: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuArrowProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DropdownMenuArrowProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        testID={testID ?? "dropdown-menu-arrow"}
        aria-hidden={true}
        style={[
          {
            width: 8,
            height: 8,
            transform: [{ rotate: "45deg" }],
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

DropdownMenuArrow.displayName = "DropdownMenuArrow";
