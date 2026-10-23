import * as React from "react";
import {
  Modal,
  Pressable,
  Text,
  type GestureResponderEvent,
  type ModalProps,
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
import { renderNativeInlineText } from "../_shared/native-text";
import {
  DialogProvider,
  useDialogContext,
  useDialogController,
  type DialogSharedProps,
} from "./dialog.shared";

function mergeRefs<T>(...refs: Array<React.Ref<T | null> | undefined>) {
  return (value: T | null) => {
    const cleanups: Array<() => void> = [];
    const voidCallbacks: Array<React.RefCallback<T | null>> = [];
    const objects: Array<React.RefObject<T | null>> = [];
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(value);
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        } else {
          voidCallbacks.push(ref);
        }
      } else if (ref != null) {
        ref.current = value;
        objects.push(ref);
      }
    }
    if (cleanups.length === 0 && objects.length === 0) {
      return undefined;
    }
    return () => {
      for (const callback of voidCallbacks) {
        callback(null);
      }
      for (const ref of objects) {
        ref.current = null;
      }
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  };
}

function getChildRef<T>(child: React.ReactElement): React.Ref<T> | undefined {
  return (child.props as { readonly ref?: React.Ref<T> }).ref;
}

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

export const DialogTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogTriggerProps
>(({ children, onPress, style, asChild, testID, disabled, accessibilityState, ...props }, ref) => {
  const context = useDialogContext();
  const theme = useTheme();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (disabled === true) {
        return;
      }
      onPress?.(event);
      if (event.defaultPrevented) {
        return;
      }
      context.setOpen(true);
    },
    [context, disabled, onPress]
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  const childElement =
    asChild && React.isValidElement<AsChildProps>(children) ? children : null;
  const childRef = childElement ? getChildRef(childElement) : undefined;
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, childRef),
    [ref, childRef],
  );

  if (childElement) {
    const childDisabled = (childElement.props as { readonly disabled?: boolean }).disabled;
    const resolvedDisabled = disabled === true || childDisabled === true;
    const childOnPress = childElement.props.onPress;
    return React.cloneElement(childElement, {
      ref: mergedRef,
      testID: (childElement.props as { testID?: string }).testID ?? testID ?? "dialog-trigger",
      disabled: resolvedDisabled,
      accessibilityRole: childElement.props.accessibilityRole ?? "button",
      ...props,
      accessibilityState: {
        ...(childElement.props.accessibilityState as PressableProps["accessibilityState"]),
        ...accessibilityState,
        disabled: resolvedDisabled,
      },
      onPress: (event: GestureResponderEvent) => {
        if (resolvedDisabled) {
          return;
        }
        childOnPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        onPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        context.setOpen(true);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      style={style}
      testID={testID ?? "dialog-trigger"}
      disabled={disabled}
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

DialogTrigger.displayName = "DialogTrigger";

export interface DialogCloseProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const DialogClose: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogCloseProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogCloseProps
>(({ children, onPress, style, asChild, testID, disabled, accessibilityState, ...props }, ref) => {
  const context = useDialogContext();
  const theme = useTheme();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (disabled === true) {
        return;
      }
      onPress?.(event);
      if (event.defaultPrevented) {
        return;
      }
      context.setOpen(false);
    },
    [context, disabled, onPress]
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  const childElement =
    asChild && React.isValidElement<AsChildProps>(children) ? children : null;
  const childRef = childElement ? getChildRef(childElement) : undefined;
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, childRef),
    [ref, childRef],
  );

  if (childElement) {
    const childDisabled = (childElement.props as { readonly disabled?: boolean }).disabled;
    const resolvedDisabled = disabled === true || childDisabled === true;
    const childOnPress = childElement.props.onPress;
    return React.cloneElement(childElement, {
      ref: mergedRef,
      testID: (childElement.props as { testID?: string }).testID ?? testID ?? "dialog-close",
      disabled: resolvedDisabled,
      accessibilityRole: childElement.props.accessibilityRole ?? "button",
      ...props,
      accessibilityState: {
        ...(childElement.props.accessibilityState as PressableProps["accessibilityState"]),
        ...accessibilityState,
        disabled: resolvedDisabled,
      },
      onPress: (event: GestureResponderEvent) => {
        if (resolvedDisabled) {
          return;
        }
        childOnPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        onPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        context.setOpen(false);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      style={style}
      testID={testID ?? "dialog-close"}
      disabled={disabled}
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

DialogClose.displayName = "DialogClose";

export interface DialogContentProps extends Omit<ViewProps, "style"> {
  readonly dismissible?: boolean;
  readonly hideClose?: boolean;
  readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
  readonly style?: StyleProp<ViewStyle>;
}

export const DialogContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DialogContentProps>(
  (
    {
      children,
      dismissible = true,
      hideClose = false,
      modalProps,
      style,
      testID,
      accessibilityViewIsModal = true,
      ...props
    },
    ref,
  ) => {
    const context = useDialogContext();
    const theme = useTheme();
    const { onRequestClose: callerOnRequestClose, ...restModalProps } = modalProps ?? {};
    const handleRequestClose = React.useCallback(
      (event: Parameters<NonNullable<ModalProps["onRequestClose"]>>[0]) => {
        callerOnRequestClose?.(event);
        if (dismissible) {
          context.setOpen(false);
        }
      },
      [callerOnRequestClose, context, dismissible],
    );

    if (!context.open) {
      return null;
    }

    return (
      <Modal
        {...restModalProps}
        transparent
        animationType={restModalProps.animationType ?? "fade"}
        visible={context.open}
        onRequestClose={handleRequestClose}
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
              accessibilityViewIsModal={accessibilityViewIsModal}
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
                  accessibilityLabel="Close dialog"
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

export const DialogHeader: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DialogSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "dialog-header"} style={[{ gap: 8 }, style]} {...props} />
  ),
);

DialogHeader.displayName = "DialogHeader";

export interface DialogTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const DialogTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, DialogTextProps>(
  ({ style, testID, accessibilityRole = "header", ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "dialog-title"}
        accessibilityRole={accessibilityRole}
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

export const DialogDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<
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

export const DialogFooter: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DialogSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DialogSectionProps>(
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
