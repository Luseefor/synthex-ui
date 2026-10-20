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
}

export function ContextMenu({
  children,
  defaultOpen,
  onOpenChange,
  open,
  style,
  ...props
}: ContextMenuProps) {
  const controller = useContextMenuController({ defaultOpen, onOpenChange, open });

  return (
    <ContextMenuProvider value={controller}>
      <View style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </ContextMenuProvider>
  );
}

export interface ContextMenuTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const ContextMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ContextMenuTriggerProps
>(({ children, onLongPress, style, asChild, ...props }, ref) => {
  const context = useContextMenuContext();

  type AsChildProps = {
    onLongPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
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
      {...props}
    >
      {children}
    </Pressable>
  );
});

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export interface ContextMenuContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
}

// Native renders in normal flow; side/align/sideOffset/alignOffset are accepted for API parity and ignored.
export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuContentProps
>(({ align, alignOffset, side, sideOffset, style, ...props }, ref) => {
  const context = useContextMenuContext();
  const theme = useTheme();

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
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
}

export const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuLabelProps
>(({ children, style, textStyle, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View ref={ref} style={[{ paddingHorizontal: 12, paddingVertical: 8 }, style]} {...props}>
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
}

export const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuSeparatorProps
>(({ style, ...props }, ref) => {
  const theme = useTheme();

  return (
    <View
      ref={ref}
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
}

export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ContextMenuItemProps
>(({ children, onPress, style, textStyle, ...props }, ref) => {
  const context = useContextMenuContext();
  const theme = useTheme();

  return (
    <Pressable
      ref={ref}
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

export type ContextMenuSubProps = BaseMenuSubProps;
export function ContextMenuSub(props: ContextMenuSubProps) {
  return <BaseMenuSub {...props} />;
}

export type ContextMenuSubTriggerProps = BaseMenuSubTriggerProps;
export const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubTrigger>,
  ContextMenuSubTriggerProps
>((props, ref) => <BaseMenuSubTrigger ref={ref} {...props} />);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export type ContextMenuSubContentProps = BaseMenuSubContentProps;
export const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof BaseMenuSubContent>,
  ContextMenuSubContentProps
>((props, ref) => <BaseMenuSubContent ref={ref} {...props} />);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export type ContextMenuCheckboxItemProps = BaseMenuCheckboxItemProps;
export const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuCheckboxItem>,
  ContextMenuCheckboxItemProps
>((props, ref) => <BaseMenuCheckboxItem ref={ref} {...props} />);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export type ContextMenuRadioGroupProps = BaseMenuRadioGroupProps;
export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <BaseMenuRadioGroup {...props} />;
}

export type ContextMenuRadioItemProps = BaseMenuRadioItemProps;
export const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof BaseMenuRadioItem>,
  ContextMenuRadioItemProps
>((props, ref) => <BaseMenuRadioItem ref={ref} {...props} />);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export type ContextMenuShortcutProps = BaseMenuShortcutProps;
export const ContextMenuShortcut = React.forwardRef<
  React.ElementRef<typeof BaseMenuShortcut>,
  ContextMenuShortcutProps
>((props, ref) => <BaseMenuShortcut ref={ref} {...props} />);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export type ContextMenuArrowProps = BaseMenuArrowProps;
export const ContextMenuArrow = React.forwardRef<
  React.ElementRef<typeof BaseMenuArrow>,
  ContextMenuArrowProps
>((props, ref) => <BaseMenuArrow ref={ref} {...props} />);
ContextMenuArrow.displayName = "ContextMenuArrow";
