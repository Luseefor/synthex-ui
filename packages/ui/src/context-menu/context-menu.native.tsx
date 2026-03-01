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
  ContextMenuProvider,
  useContextMenuContext,
  useContextMenuController,
  type ContextMenuSharedProps,
} from "./context-menu.shared";

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
}

export const ContextMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ContextMenuTriggerProps
>(({ children, onLongPress, style, ...props }, ref) => {
  const context = useContextMenuContext();

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

export interface ContextMenuContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof View>,
  ContextMenuContentProps
>(({ style, ...props }, ref) => {
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
