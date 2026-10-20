import * as React from "react";
import {
  Modal,
  Pressable,
  Text,
  type GestureResponderEvent,
  type TextProps,
  View,
  type ModalProps,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { CloseIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import {
  DialogProvider,
  useDialogContext,
  useDialogController,
  type DialogSharedProps,
} from "./dialog.shared";

export interface DialogProps extends DialogSharedProps {
  readonly children: React.ReactNode;
  readonly modal?: boolean;
}

export function Dialog({ children, defaultOpen, modal, onOpenChange, open }: DialogProps) {
  void modal;
  const controller = useDialogController({ defaultOpen, onOpenChange, open });

  return <DialogProvider value={controller}>{children}</DialogProvider>;
}

export interface DialogTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useDialogContext();

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
      testID: (children.props as { testID?: string }).testID ?? testID ?? "dialog-trigger",
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
      testID={testID ?? "dialog-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

DialogTrigger.displayName = "DialogTrigger";

export interface DialogCloseProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const DialogClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogCloseProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useDialogContext();

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
      testID: (children.props as { testID?: string }).testID ?? testID ?? "dialog-close",
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
      testID={testID ?? "dialog-close"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

DialogClose.displayName = "DialogClose";

export interface DialogContentProps extends Omit<ViewProps, "style"> {
  readonly dismissible?: boolean;
  readonly hideClose?: boolean;
  readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
  readonly style?: StyleProp<ViewStyle>;
}

export const DialogContent = React.forwardRef<React.ElementRef<typeof View>, DialogContentProps>(
  ({ children, dismissible = true, hideClose = false, modalProps, style, testID, ...props }, ref) => {
    const context = useDialogContext();
    const theme = useTheme();

    if (!context.open) {
      return null;
    }

    return (
      <Modal
        transparent
        animationType="fade"
        visible={context.open}
        onRequestClose={() => {
          if (dismissible) {
            context.setOpen(false);
          }
        }}
        {...modalProps}
      >
        <Pressable
          testID="dialog-overlay"
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 24,
            justifyContent: "center",
            backgroundColor: "rgba(15,23,42,0.42)",
          }}
          onPress={() => {
            if (dismissible) {
              context.setOpen(false);
            }
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              alignSelf: "center",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <View
              ref={ref}
              testID={testID ?? "dialog-content"}
              style={[
                {
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.xl,
                  backgroundColor: theme.colors.surface,
                  padding: 24,
                  gap: 12,
                },
                style,
              ]}
              {...props}
            >
              {!hideClose ? (
                <Pressable
                  accessibilityRole="button"
                  testID="dialog-close"
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
              ) : null}
              {children}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

DialogContent.displayName = "DialogContent";

export interface DialogSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DialogHeader = React.forwardRef<React.ElementRef<typeof View>, DialogSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "dialog-header"} style={[{ gap: 8 }, style]} {...props} />
  ),
);

DialogHeader.displayName = "DialogHeader";

export interface DialogTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const DialogTitle = React.forwardRef<React.ElementRef<typeof Text>, DialogTextProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "dialog-title"}
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

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  DialogTextProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      testID={testID ?? "dialog-description"}
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

DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef<React.ElementRef<typeof View>, DialogSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View
      ref={ref}
      testID={testID ?? "dialog-footer"}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

DialogFooter.displayName = "DialogFooter";
