import * as React from "react";
import {
  Modal,
  Pressable,
  Text,
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
}

export function Dialog({ children, defaultOpen, onOpenChange, open }: DialogProps) {
  const controller = useDialogController({ defaultOpen, onOpenChange, open });

  return <DialogProvider value={controller}>{children}</DialogProvider>;
}

export interface DialogTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogTriggerProps
>(({ children, onPress, style, ...props }, ref) => {
  const context = useDialogContext();

  return (
    <Pressable
      ref={ref}
      onPress={(event) => {
        context.setOpen(true);
        onPress?.(event);
      }}
      style={style}
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
}

export const DialogClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogCloseProps
>(({ children, onPress, style, ...props }, ref) => {
  const context = useDialogContext();

  return (
    <Pressable
      ref={ref}
      onPress={(event) => {
        context.setOpen(false);
        onPress?.(event);
      }}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
});

DialogClose.displayName = "DialogClose";

export interface DialogContentProps extends Omit<ViewProps, "style"> {
  readonly hideClose?: boolean;
  readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
  readonly style?: StyleProp<ViewStyle>;
}

export const DialogContent = React.forwardRef<React.ElementRef<typeof View>, DialogContentProps>(
  ({ children, hideClose = false, modalProps, style, ...props }, ref) => {
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
        onRequestClose={() => context.setOpen(false)}
        {...modalProps}
      >
        <Pressable
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 24,
            justifyContent: "center",
            backgroundColor: "rgba(15,23,42,0.42)",
          }}
          onPress={() => context.setOpen(false)}
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
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[{ gap: 8 }, style]} {...props} />
  ),
);

DialogHeader.displayName = "DialogHeader";

export interface DialogTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const DialogTitle = React.forwardRef<React.ElementRef<typeof Text>, DialogTextProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
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
>(({ style, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
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
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

DialogFooter.displayName = "DialogFooter";
