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
import { renderNativeInlineText } from "../_shared/native-text";
import { NativePressableAction } from "../_shared/pressable.native";
import { useTheme } from "../_shared/theme/context";
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  ContextMenuProvider,
  useContextMenuContext,
  useContextMenuController,
  type ContextMenuSharedProps,
} from "./context-menu.shared";
import {
  DropdownMenuArrow as BaseMenuArrow,
  DropdownMenuCheckboxItem as BaseMenuCheckboxItem,
  DropdownMenuRadioGroup as BaseMenuRadioGroup,
  DropdownMenuRadioItem as BaseMenuRadioItem,
  DropdownMenuShortcut as BaseMenuShortcut,
  DropdownMenuSub as BaseMenuSub,
  DropdownMenuSubContent as BaseMenuSubContent,
  DropdownMenuSubTrigger as BaseMenuSubTrigger,
  type DropdownMenuArrowProps as BaseMenuArrowProps,
  type DropdownMenuCheckboxItemProps as BaseMenuCheckboxItemProps,
  type DropdownMenuRadioGroupProps as BaseMenuRadioGroupProps,
  type DropdownMenuRadioItemProps as BaseMenuRadioItemProps,
  type DropdownMenuShortcutProps as BaseMenuShortcutProps,
  type DropdownMenuSubContentProps as BaseMenuSubContentProps,
  type DropdownMenuSubProps as BaseMenuSubProps,
  type DropdownMenuSubTriggerProps as BaseMenuSubTriggerProps,
} from "../dropdown-menu/dropdown-menu.native";

export interface ContextMenuProps
  extends Omit<ViewProps, "children" | "style">,
    ContextMenuSharedProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly dir?: "ltr" | "rtl";
  readonly modal?: boolean;
  readonly testID?: string;
}

export function ContextMenu({
  children,
  defaultOpen,
  dir,
  modal,
  onOpenChange,
  open,
  style,
  testID,
  ...props
}: ContextMenuProps) {
  void modal;
  const controller = useContextMenuController({ defaultOpen, onOpenChange, open });

  // testID mirrors web `data-slot="context-menu"` for parity.
  return (
    <NativeOverlayProvider dir={dir}><ContextMenuProvider value={controller}>
      <View testID={testID ?? "context-menu"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </ContextMenuProvider></NativeOverlayProvider>
  );
}

export interface ContextMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const ContextMenuTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, ContextMenuTriggerProps>((props, ref) => {
  const context = useContextMenuContext();
  const anchorRef = useNativeOverlayTriggerRef(ref);
  return <NativePressableAction {...props} forwardedRef={anchorRef} collapsable={false}
    defaultTestID="context-menu-trigger" activation="longPress" expanded={context.open} onAction={() => context.setOpen(true)} />;
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";

export interface ContextMenuContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ContextMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = useContextMenuContext();
  const theme = useTheme();

  return (
    <NativeOverlayContent
      open={context.open} onDismiss={() => context.setOpen(false)}
      side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}
      ref={ref}
      testID={testID ?? "context-menu-content"}
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

ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuLabelProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ContextMenuLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuLabelProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuLabelProps
>(({ children, style, textStyle, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View ref={ref} testID={testID ?? "context-menu-label"} style={[{ paddingHorizontal: 12, paddingVertical: 8 }, style]} {...props}>
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

ContextMenuLabel.displayName = "ContextMenuLabel";

export interface ContextMenuSeparatorProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const ContextMenuSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuSeparatorProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuSeparatorProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View
      ref={ref}
      testID={testID ?? "context-menu-separator"}
      style={[{ marginVertical: 4, height: 1, backgroundColor: theme.colors.border }, style]}
      {...props}
    />
  );
});

ContextMenuSeparator.displayName = "ContextMenuSeparator";

export interface ContextMenuItemProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ContextMenuItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuItemProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ContextMenuItemProps
>(({ children, onPress, style, textStyle, testID, ...props }, ref) => {
  const context = useContextMenuContext();
  const theme = useTheme();

  return (
    <NativePressableAction
      forwardedRef={ref} defaultTestID="context-menu-item"
      onAction={() => context.setOpen(false)} onPress={onPress}
      testID={testID ?? "context-menu-item"}
      accessibilityRole="button"
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
    </NativePressableAction>
  );
});

ContextMenuItem.displayName = "ContextMenuItem";

export type ContextMenuSubProps = BaseMenuSubProps & { readonly testID?: string };
export function ContextMenuSub({ testID, ...props }: ContextMenuSubProps) {
  return <BaseMenuSub testID={testID ?? "context-menu-sub"} {...props} />;
}

export type ContextMenuSubTriggerProps = BaseMenuSubTriggerProps & { readonly testID?: string };
export const ContextMenuSubTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuSubTriggerProps> & React.RefAttributes<React.ElementRef<typeof BaseMenuSubTrigger>>
> = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubTrigger>,
  ContextMenuSubTriggerProps
>(({ testID, ...props }, ref) => <BaseMenuSubTrigger ref={ref} testID={testID ?? "context-menu-sub-trigger"} {...props} />);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export type ContextMenuSubContentProps = BaseMenuSubContentProps & { readonly testID?: string };
export const ContextMenuSubContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuSubContentProps> & React.RefAttributes<React.ElementRef<typeof BaseMenuSubContent>>
> = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubContent>,
  ContextMenuSubContentProps
>(({ testID, ...props }, ref) => <BaseMenuSubContent ref={ref} testID={testID ?? "context-menu-sub-content"} {...props} />);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export type ContextMenuCheckboxItemProps = BaseMenuCheckboxItemProps & { readonly testID?: string };
export const ContextMenuCheckboxItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuCheckboxItemProps> & React.RefAttributes<React.ElementRef<typeof BaseMenuCheckboxItem>>
> = React.forwardRef<
  React.ElementRef<typeof BaseMenuCheckboxItem>,
  ContextMenuCheckboxItemProps
>(({ testID, ...props }, ref) => <BaseMenuCheckboxItem ref={ref} testID={testID ?? "context-menu-checkbox-item"} {...props} />);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export type ContextMenuRadioGroupProps = BaseMenuRadioGroupProps & { readonly testID?: string };
export function ContextMenuRadioGroup({ testID, ...props }: ContextMenuRadioGroupProps) {
  return <BaseMenuRadioGroup testID={testID ?? "context-menu-radio-group"} {...props} />;
}

export type ContextMenuRadioItemProps = BaseMenuRadioItemProps & { readonly testID?: string };
export const ContextMenuRadioItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuRadioItemProps> & React.RefAttributes<React.ElementRef<typeof BaseMenuRadioItem>>
> = React.forwardRef<
  React.ElementRef<typeof BaseMenuRadioItem>,
  ContextMenuRadioItemProps
>(({ testID, ...props }, ref) => <BaseMenuRadioItem ref={ref} testID={testID ?? "context-menu-radio-item"} {...props} />);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export type ContextMenuShortcutProps = BaseMenuShortcutProps & { readonly testID?: string };
export const ContextMenuShortcut: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuShortcutProps> & React.RefAttributes<React.ElementRef<typeof BaseMenuShortcut>>
> = React.forwardRef<
  React.ElementRef<typeof BaseMenuShortcut>,
  ContextMenuShortcutProps
>(({ testID, ...props }, ref) => <BaseMenuShortcut ref={ref} testID={testID ?? "context-menu-shortcut"} {...props} />);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export type ContextMenuArrowProps = BaseMenuArrowProps & { readonly testID?: string };
export const ContextMenuArrow: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ContextMenuArrowProps> & React.RefAttributes<React.ElementRef<typeof BaseMenuArrow>>
> = React.forwardRef<
  React.ElementRef<typeof BaseMenuArrow>,
  ContextMenuArrowProps
>(({ testID, ...props }, ref) => <BaseMenuArrow ref={ref} testID={testID ?? "context-menu-arrow"} {...props} />);
ContextMenuArrow.displayName = "ContextMenuArrow";
