import * as React from "react";
import {
  Modal,
  Pressable,
  Text,
  type GestureResponderEvent,
  type TextProps,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { CloseIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { useDialogController } from "../dialog/dialog.shared";
import { DialogProvider, useDialogContext } from "../dialog/dialog.shared";
import type { DrawerDirection, DrawerSharedProps } from "./drawer.shared";

export interface DrawerProps extends DrawerSharedProps {
  readonly children?: React.ReactNode;
}

export function Drawer({
  children,
  defaultOpen,
  direction,
  dismissible,
  modal,
  onOpenChange,
  open,
}: DrawerProps) {
  void direction;
  void dismissible;
  void modal;
  const controller = useDialogController({ defaultOpen, onOpenChange, open });

  return <DialogProvider value={controller}>{children}</DialogProvider>;
}

export interface DrawerTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DrawerTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useDialogContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(true);
      onPress?.(event);
    },
    [context, onPress],
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      testID: (children.props as { testID?: string }).testID ?? testID ?? "drawer-trigger",
      ...props,
      onPress: (e: GestureResponderEvent) => {
        handlePress(e);
        children.props.onPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      style={style}
      testID={testID ?? "drawer-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

DrawerTrigger.displayName = "DrawerTrigger";

export const DrawerClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DrawerTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useDialogContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(false);
      onPress?.(event);
    },
    [context, onPress],
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      testID: (children.props as { testID?: string }).testID ?? testID ?? "drawer-close",
      ...props,
      onPress: (e: GestureResponderEvent) => {
        handlePress(e);
        children.props.onPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      style={style}
      testID={testID ?? "drawer-close"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

DrawerClose.displayName = "DrawerClose";

export interface DrawerContentProps extends Omit<ViewProps, "style"> {
  readonly dismissible?: boolean;
  readonly side?: "bottom" | "left" | "right" | "top";
  readonly style?: StyleProp<ViewStyle>;
}

export const DrawerContent = React.forwardRef<React.ElementRef<typeof View>, DrawerContentProps>(
  ({ children, dismissible = true, side = "bottom", style, testID, ...props }, ref) => {
    const context = useDialogContext();
    const theme = useTheme();

    if (!context.open) {
      return null;
    }

    const isHorizontal = side === "top" || side === "bottom";

    return (
      <Modal
        transparent
        animationType="fade"
        visible={context.open}
        onRequestClose={() => {
          if (dismissible) context.setOpen(false);
        }}
      >
        <Pressable
          testID="drawer-overlay"
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.38)",
          }}
          onPress={() => {
            if (dismissible) context.setOpen(false);
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              ...(isHorizontal
                ? { left: 0, right: 0, [side]: 0, width: "100%" }
                : { top: 0, bottom: 0, [side]: 0, width: "100%", maxWidth: 420 }),
            } as ViewStyle}
            onPress={(event) => event.stopPropagation()}
          >
            <View
              ref={ref}
              testID={testID ?? "drawer-content"}
              style={[
                {
                  flex: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  padding: 24,
                },
                side === "right"
                  ? { borderLeftWidth: 1 }
                  : side === "left"
                    ? { borderRightWidth: 1 }
                    : side === "top"
                      ? { borderBottomWidth: 1 }
                      : { borderTopWidth: 1 },
                style,
              ]}
              {...props}
            >
              <View
                testID="drawer-handle"
                style={{
                  alignSelf: "center",
                  height: 6,
                  marginBottom: 16,
                  width: 48,
                  borderRadius: 999,
                  backgroundColor: theme.colors.border,
                }}
              />
              <Pressable
                accessibilityRole="button"
                testID="drawer-close"
                onPress={() => context.setOpen(false)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.surface,
                }}
              >
                <CloseIcon size={16} />
              </Pressable>
              {children}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

DrawerContent.displayName = "DrawerContent";

export interface DrawerSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DrawerHeader = React.forwardRef<React.ElementRef<typeof View>, DrawerSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "drawer-header"} style={[{ gap: 8 }, style]} {...props} />
  ),
);

DrawerHeader.displayName = "DrawerHeader";

export interface DrawerTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const DrawerTitle = React.forwardRef<React.ElementRef<typeof Text>, DrawerTextProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "drawer-title"}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.4,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  DrawerTextProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      testID={testID ?? "drawer-description"}
      style={[
        {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
          lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
        },
        style,
      ]}
      {...props}
    />
  );
});

DrawerDescription.displayName = "DrawerDescription";

export const DrawerFooter = React.forwardRef<React.ElementRef<typeof View>, DrawerSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View
      ref={ref}
      testID={testID ?? "drawer-footer"}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

DrawerFooter.displayName = "DrawerFooter";

export type { DrawerDirection };
