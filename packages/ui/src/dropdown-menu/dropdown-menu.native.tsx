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
  DropdownMenuProvider,
  useDropdownMenuContext,
  useDropdownMenuController,
  type DropdownMenuSharedProps,
} from "./dropdown-menu.shared";

export interface DropdownMenuProps
  extends Omit<ViewProps, "children" | "style">,
  DropdownMenuSharedProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function DropdownMenu({
  children,
  defaultOpen,
  onOpenChange,
  open,
  style,
  ...props
}: DropdownMenuProps) {
  const controller = useDropdownMenuController({ defaultOpen, onOpenChange, open });

  return (
    <DropdownMenuProvider value={controller}>
      <View style={[{ position: "relative" }, style]} {...props}>
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

export const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuTriggerProps
>(({ children, onPress, style, asChild, ...props }, ref) => {
  const context = useDropdownMenuContext();

  const handlePress = React.useCallback(
    (event: any) => {
      context.setOpen(!context.open);
      onPress?.(event);
    },
    [context, onPress]
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props,
      accessibilityRole: "button",
      accessibilityState: { expanded: context.open },
      onPress: (e: any) => {
        handlePress(e);
        (children.props as any).onPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
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

export interface DropdownMenuContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuContentProps
>(({ style, ...props }, ref) => {
  const context = useDropdownMenuContext();
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

DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuLabelProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuLabelProps
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

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuSeparatorProps
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

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuItemProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuItemProps
>(({ children, onPress, style, textStyle, ...props }, ref) => {
  const context = useDropdownMenuContext();
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

DropdownMenuItem.displayName = "DropdownMenuItem";
