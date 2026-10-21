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
import {
  DialogProvider as SheetProvider,
  useDialogContext as useSheetContext,
  useDialogController as useSheetController,
  type DialogSharedProps,
} from "../dialog/dialog.shared";

export interface SheetProps extends DialogSharedProps {
  readonly children: React.ReactNode;
  readonly modal?: boolean;
}

export function Sheet({ children, defaultOpen, modal, onOpenChange, open }: SheetProps) {
  void modal;
  const controller = useSheetController({ defaultOpen, onOpenChange, open });

  return <SheetProvider value={controller}>{children}</SheetProvider>;
}

export interface SheetTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const SheetTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SheetTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useSheetContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(true);
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
      testID: (children.props as { testID?: string }).testID ?? testID ?? "sheet-trigger",
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
      testID={testID ?? "sheet-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

SheetTrigger.displayName = "SheetTrigger";

export const SheetClose: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SheetTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useSheetContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(false);
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
      testID: (children.props as { testID?: string }).testID ?? testID ?? "sheet-close",
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
      testID={testID ?? "sheet-close"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

SheetClose.displayName = "SheetClose";

export interface SheetContentProps extends Omit<ViewProps, "style"> {
  readonly dismissible?: boolean;
  readonly side?: "top" | "right" | "bottom" | "left";
  readonly style?: StyleProp<ViewStyle>;
}

export const SheetContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SheetContentProps>(
  ({ children, dismissible = true, side = "right", style, testID, ...props }, ref) => {
    const context = useSheetContext();
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
          testID="sheet-overlay"
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
              testID={testID ?? "sheet-content"}
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
              <Pressable
                accessibilityRole="button"
                testID="sheet-close"
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

SheetContent.displayName = "SheetContent";

export interface SheetSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SheetHeader: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SheetSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "sheet-header"} style={[{ gap: 8 }, style]} {...props} />
  ),
);

SheetHeader.displayName = "SheetHeader";

export interface SheetTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const SheetTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, SheetTextProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "sheet-title"}
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

SheetTitle.displayName = "SheetTitle";

export const SheetDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<
  React.ElementRef<typeof Text>,
  SheetTextProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      testID={testID ?? "sheet-description"}
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

SheetDescription.displayName = "SheetDescription";

export const SheetFooter: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SheetSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View
      ref={ref}
      testID={testID ?? "sheet-footer"}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

SheetFooter.displayName = "SheetFooter";
