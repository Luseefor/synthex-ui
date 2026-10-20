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
  // `dir`/`modal` are web-only Radix props; accepted for parity, ignored native.
  void dir;
  void modal;
  const controller = useContextMenuController({ defaultOpen, onOpenChange, open });

  // testID mirrors web `data-slot="context-menu"` for parity.
  return (
    <ContextMenuProvider value={controller}>
      <View testID={testID ?? "context-menu"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </ContextMenuProvider>
  );
}

export interface ContextMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const ContextMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ContextMenuTriggerProps
>(({ children, onLongPress, style, asChild, testID, ...props }, ref) => {
  const context = useContextMenuContext();

  type AsChildProps = {
    onLongPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      testID: (children.props as { testID?: string }).testID ?? testID ?? "context-menu-trigger",
      ...props,
      onLongPress: (e: GestureResponderEvent) => {
        context.setOpen(true);
        onLongPress?.(e);
        children.props.onLongPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onLongPress={(event) => {
        context.setOpen(true);
        onLongPress?.(event);
      }}
      style={style}
      testID={testID ?? "context-menu-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export interface ContextMenuContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

// Native renders in normal flow; side/align/sideOffset/alignOffset are accepted for API parity and ignored.
export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = useContextMenuContext();
  const theme = useTheme();
  void align;
  void alignOffset;
  void side;
  void sideOffset;

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      testID={testID ?? "context-menu-content"}
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

ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuLabelProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const ContextMenuLabel = React.forwardRef<
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

export const ContextMenuSeparator = React.forwardRef<
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

export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ContextMenuItemProps
>(({ children, onPress, style, textStyle, testID, ...props }, ref) => {
  const context = useContextMenuContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
      testID={testID ?? "context-menu-item"}
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

ContextMenuItem.displayName = "ContextMenuItem";

export type ContextMenuSubProps = BaseMenuSubProps & { readonly testID?: string };
export function ContextMenuSub({ testID, ...props }: ContextMenuSubProps) {
  return <BaseMenuSub testID={testID ?? "context-menu-sub"} {...props} />;
}

export type ContextMenuSubTriggerProps = BaseMenuSubTriggerProps & { readonly testID?: string };
export const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubTrigger>,
  ContextMenuSubTriggerProps
>(({ testID, ...props }, ref) => <BaseMenuSubTrigger ref={ref} testID={testID ?? "context-menu-sub-trigger"} {...props} />);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export type ContextMenuSubContentProps = BaseMenuSubContentProps & { readonly testID?: string };
export const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubContent>,
  ContextMenuSubContentProps
>(({ testID, ...props }, ref) => <BaseMenuSubContent ref={ref} testID={testID ?? "context-menu-sub-content"} {...props} />);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export type ContextMenuCheckboxItemProps = BaseMenuCheckboxItemProps & { readonly testID?: string };
export const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuCheckboxItem>,
  ContextMenuCheckboxItemProps
>(({ testID, ...props }, ref) => <BaseMenuCheckboxItem ref={ref} testID={testID ?? "context-menu-checkbox-item"} {...props} />);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export type ContextMenuRadioGroupProps = BaseMenuRadioGroupProps & { readonly testID?: string };
export function ContextMenuRadioGroup({ testID, ...props }: ContextMenuRadioGroupProps) {
  return <BaseMenuRadioGroup testID={testID ?? "context-menu-radio-group"} {...props} />;
}

export type ContextMenuRadioItemProps = BaseMenuRadioItemProps & { readonly testID?: string };
export const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuRadioItem>,
  ContextMenuRadioItemProps
>(({ testID, ...props }, ref) => <BaseMenuRadioItem ref={ref} testID={testID ?? "context-menu-radio-item"} {...props} />);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export type ContextMenuShortcutProps = BaseMenuShortcutProps & { readonly testID?: string };
export const ContextMenuShortcut = React.forwardRef<
  React.ElementRef<typeof BaseMenuShortcut>,
  ContextMenuShortcutProps
>(({ testID, ...props }, ref) => <BaseMenuShortcut ref={ref} testID={testID ?? "context-menu-shortcut"} {...props} />);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export type ContextMenuArrowProps = BaseMenuArrowProps & { readonly testID?: string };
export const ContextMenuArrow = React.forwardRef<
  React.ElementRef<typeof BaseMenuArrow>,
  ContextMenuArrowProps
>(({ testID, ...props }, ref) => <BaseMenuArrow ref={ref} testID={testID ?? "context-menu-arrow"} {...props} />);
ContextMenuArrow.displayName = "ContextMenuArrow";
