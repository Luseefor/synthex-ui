import * as React from "react";
import { renderNativeInlineText } from "../_shared/native-text";
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
  NativeOverlayContent,
  NativeOverlayProvider,
  useNativeOverlayTriggerRef,
} from "../_shared/overlay.native";
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

function getChildRef<T>(child: React.ReactElement): React.Ref<T> | undefined {
  return (child.props as { readonly ref?: React.Ref<T> }).ref;
}

type ComposedTriggerStyle = PressableProps["style"];

function composeTriggerStyle(
  parent: StyleProp<ViewStyle> | undefined,
  child: unknown,
): ComposedTriggerStyle {
  if (typeof child === "function") {
    if (parent == null) {
      return child as ComposedTriggerStyle;
    }
    const childFn = child as (state: { pressed: boolean }) => StyleProp<ViewStyle>;
    return (state: { pressed: boolean }) => [parent, childFn(state)];
  }
  if (parent == null) {
    return child as ComposedTriggerStyle;
  }
  if (child == null) {
    return parent as ComposedTriggerStyle;
  }
  return [parent, child as StyleProp<ViewStyle>];
}

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
    <NativeOverlayProvider dir={dir}>
      <DropdownMenuProvider value={controller}>
        <View
          testID={testID ?? "dropdown-menu"}
          style={[{ position: "relative" }, dir ? { direction: dir } : null, style]}
          {...props}
        >
          {children}
        </View>
      </DropdownMenuProvider>
    </NativeOverlayProvider>
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
>(({ children, onPress, style, asChild, testID, disabled, accessibilityState, accessibilityRole, ...props }, ref) => {
  const context = useDropdownMenuContext();
  const theme = useTheme();

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  const childElement =
    asChild && React.isValidElement<AsChildProps>(children) ? children : null;
  const childRef = childElement
    ? getChildRef<React.ElementRef<typeof View>>(childElement)
    : undefined;
  const mergedRef = useNativeOverlayTriggerRef(
    ref as React.Ref<React.ElementRef<typeof View>> | undefined,
    childRef,
  );

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (disabled === true) {
        return;
      }
      onPress?.(event);
      if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
        return;
      }
      context.setOpen(!context.open);
    },
    [context, disabled, onPress]
  );

  if (childElement) {
    const childDisabled = (childElement.props as { readonly disabled?: boolean }).disabled;
    const resolvedDisabled = disabled === true || childDisabled === true;
    const childOnPress = childElement.props.onPress as
      | ((event: GestureResponderEvent) => void)
      | undefined;
    const childTestID = (childElement.props as { testID?: string }).testID;
    const childStyle = (childElement.props as { style?: PressableProps["style"] }).style;
    const childAccessibilityState = (childElement.props as { accessibilityState?: PressableProps["accessibilityState"] }).accessibilityState;
    const childRole = (childElement.props as { accessibilityRole?: PressableProps["accessibilityRole"] }).accessibilityRole;
    return React.cloneElement(childElement, {
      ref: mergedRef,
      testID: childTestID ?? testID ?? "dropdown-menu-trigger",
      disabled: resolvedDisabled,
      collapsable: false,
      accessibilityRole: accessibilityRole ?? childRole ?? "button",
      ...props,
      accessibilityState: {
        ...childAccessibilityState,
        ...accessibilityState,
        expanded: context.open,
        disabled: resolvedDisabled,
      },
      style: composeTriggerStyle(style, childStyle),
      onPress: (event: GestureResponderEvent) => {
        if (resolvedDisabled) {
          return;
        }
        childOnPress?.(event);
        if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
          return;
        }
        onPress?.(event);
        if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
          return;
        }
        context.setOpen(!context.open);
      },
    });
  }

  return (
    <Pressable
      ref={mergedRef as unknown as React.Ref<React.ElementRef<typeof Pressable>>}
      testID={testID ?? "dropdown-menu-trigger"}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{ ...accessibilityState, expanded: context.open, disabled: !!disabled }}
      disabled={disabled}
      collapsable={false}
      onPress={handlePress}
      style={style}
      {...props}
    >
      {renderNativeInlineText(children, {
        color: theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm,
      })}
    </Pressable>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const DropdownMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DropdownMenuContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = useDropdownMenuContext();
  const theme = useTheme();

  return (
    <NativeOverlayContent
      ref={ref}
      open={context.open}
      onDismiss={() => context.setOpen(false)}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      testID={testID ?? "dropdown-menu-content"}
      style={[
        {
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
  const labelStyle: StyleProp<TextStyle> = [
    {
      color: theme.colors.foregroundMuted,
      fontFamily: theme.typography.family.sans,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    textStyle,
  ];

  return (
    <View ref={ref} testID={testID ?? "dropdown-menu-label"} style={[{ paddingHorizontal: 12, paddingVertical: 8 }, style]} {...props}>
      {renderNativeInlineText(children, labelStyle)}
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
>(({ children, onPress, style, textStyle, testID, disabled, ...props }, ref) => {
  const context = useDropdownMenuContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-item"}
      accessibilityRole="button"
      disabled={disabled}
      onPress={(event) => {
        if (disabled === true) {
          return;
        }
        onPress?.(event);
        if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
          return;
        }
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
      {renderNativeInlineText(children, [
        {
          color: theme.colors.foreground,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
        },
        textStyle,
      ])}
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
>(({ children, onPress, style, textStyle, testID, disabled, accessibilityState, ...props }, ref) => {
  const sub = useDropdownMenuSubContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-sub-trigger"}
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, expanded: sub.open, disabled: !!disabled }}
      accessibilityHint="Opens submenu"
      onPress={(event) => {
        if (disabled) return;
        onPress?.(event);
        if (!event.defaultPrevented) sub.setOpen(!sub.open);
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
        {renderNativeInlineText(children, [
          { color: theme.colors.foreground, fontFamily: theme.typography.family.sans, fontSize: theme.typography.size.sm },
          textStyle,
        ])}
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
>(({ children, checked, defaultChecked = false, onCheckedChange, onPress, style, textStyle, testID, disabled, accessibilityState, ...props }, ref) => {
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
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, checked: currentChecked, disabled: !!disabled }}
      onPress={(event) => {
        if (disabled) return;
        onPress?.(event);
        if (!event.defaultPrevented) setCurrentChecked(!currentChecked);
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
        <View style={{ flex: 1 }}>
          {renderNativeInlineText(children, [
            { color: theme.colors.foreground, fontFamily: theme.typography.family.sans, fontSize: theme.typography.size.sm },
            textStyle,
          ])}
        </View>
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
>(({ children, onPress, style, textStyle, value, testID, disabled, accessibilityState, ...props }, ref) => {
  const theme = useTheme();
  const group = useOptionalDropdownMenuRadioGroupContext();
  const checked = group ? group.value === value : false;

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "dropdown-menu-radio-item"}
      accessibilityRole="radio"
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, checked, selected: checked, disabled: !!disabled }}
      onPress={(event) => {
        if (disabled) return;
        onPress?.(event);
        if (!event.defaultPrevented) group?.onValueChange(value);
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
        <View style={{ flex: 1 }}>
          {renderNativeInlineText(children, [
            { color: theme.colors.foreground, fontFamily: theme.typography.family.sans, fontSize: theme.typography.size.sm },
            textStyle,
          ])}
        </View>
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
        {renderNativeInlineText(children, [
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: 12,
            letterSpacing: 1,
          },
          textStyle,
        ])}
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
