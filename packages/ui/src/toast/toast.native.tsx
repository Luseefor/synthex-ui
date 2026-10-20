import * as React from "react";
import {
  Modal,
  Pressable,
  Text as NativeText,
  View,
  type PressableProps,
  type TextProps as NativeTextProps,
  type ViewProps,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { Button } from "../button/button.native";
import { CheckIcon, CloseIcon } from "../icons/index.native";
import {
  ToastProviderStore,
  useToast,
  useToastState,
  useToastStore,
  type ToastDescriptor,
  type ToastSharedProps,
} from "./toast.shared";

export interface ToastProviderProps extends ViewProps {
  readonly children: React.ReactNode;
}

export function ToastProvider({ children, ...props }: ToastProviderProps) {
  const store = useToastState();
  return (
    <ToastProviderStore value={store}>
      <View {...props}>{children}</View>
    </ToastProviderStore>
  );
}

export interface ToastViewportProps extends ViewProps {
  readonly expand?: boolean;
  readonly position?: "top" | "bottom";
  readonly richColors?: boolean;
}
export function ToastViewport({
  expand = false,
  position = "bottom",
  // Retained for Sonner API parity; variant colors already convey richness.
  richColors: _richColors = false,
  style,
  ...props
}: ToastViewportProps) {
  const store = useToastStore();

  return (
    <Modal transparent visible={store.toasts.length > 0}>
      <View
        style={[
          {
            gap: expand ? 16 : 12,
            left: 16,
            position: "absolute",
            right: 16,
            ...(position === "top" ? { top: 16 } : { bottom: 16 }),
          },
          style,
        ]}
        {...props}
      >
        {store.toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </View>
    </Modal>
  );
}

function ToastCard({ toast }: { readonly toast: ToastDescriptor }) {
  const store = useToastStore();
  const theme = useTheme();
  const duration = toast.duration ?? 5000;

  React.useEffect(() => {
    if (!duration) {
      return;
    }
    const timeout = setTimeout(() => {
      store.dismissToast(toast.id);
    }, duration);
    return () => {
      clearTimeout(timeout);
    };
  }, [duration, store, toast.id]);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        padding: 16,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor:
            toast.variant === "success"
              ? theme.colors.primaryMuted
              : toast.variant === "warning"
                ? theme.colors.accentMuted
                : toast.variant === "destructive"
                  ? theme.colors.destructiveMuted
                  : theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: 999,
          borderWidth: 1,
          height: 36,
          justifyContent: "center",
          width: 36,
        }}
      >
        {toast.variant === "destructive" ? (
          <CloseIcon
            color={theme.colors.destructive}
            size={14}
            strokeWidth={2.2}
          />
        ) : (
          <CheckIcon
            color={
              toast.variant === "warning"
                ? theme.colors.accent
                : toast.variant === "success"
                  ? theme.colors.primary
                  : theme.colors.foregroundMuted
            }
            size={14}
            strokeWidth={2.2}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <ToastTitle>{toast.title}</ToastTitle>
        {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {toast.actionLabel ? (
            <ToastAction
              onPress={() => {
                toast.action?.();
                store.dismissToast(toast.id);
              }}
            >
              {toast.actionLabel}
            </ToastAction>
          ) : null}
          <ToastClose onPress={() => store.dismissToast(toast.id)} />
        </View>
      </View>
    </View>
  );
}

export interface ToastProps extends ViewProps, ToastSharedProps {}
export function Toast({
  children,
  duration = 5000,
  onOpenChange,
  open = true,
  style,
  ...props
}: ToastProps) {
  const [visible, setVisible] = React.useState(open);

  React.useEffect(() => {
    setVisible(open);
  }, [open]);

  React.useEffect(() => {
    if (!visible || !duration) {
      return;
    }
    const timeout = setTimeout(() => {
      setVisible(false);
      onOpenChange?.(false);
    }, duration);
    return () => {
      clearTimeout(timeout);
    };
  }, [duration, onOpenChange, visible]);

  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          flexDirection: "row",
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export interface ToastTitleProps extends NativeTextProps {}
export function ToastTitle({ style, ...props }: ToastTitleProps) {
  const theme = useTheme();
  return (
    <NativeText
      style={[
        {
          color: theme.colors.foreground,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
          fontWeight: "600",
          lineHeight: 20,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface ToastDescriptionProps extends NativeTextProps {}
export function ToastDescription({ style, ...props }: ToastDescriptionProps) {
  const theme = useTheme();
  return (
    <NativeText
      style={[
        {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
          lineHeight: 20,
          marginTop: 4,
        },
        style,
      ]}
      {...props}
    />
  );
}

export interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function ToastAction(props: ToastActionProps) {
  return <Button size="sm" variant="secondary" {...props} />;
}

export interface ToastCloseProps extends Omit<PressableProps, "children" | "style"> {
  readonly children?: React.ReactNode;
}
export function ToastClose({ children, ...props }: ToastCloseProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel="Dismiss toast"
      style={[
        {
          alignItems: "center",
          borderColor: theme.colors.border,
          borderRadius: 999,
          borderWidth: 1,
          justifyContent: "center",
          minHeight: 32,
          minWidth: 32,
        },
      ]}
      {...props}
    >
      <NativeText style={{ color: theme.colors.foregroundMuted, fontWeight: "600" }}>
        {children ?? "×"}
      </NativeText>
    </Pressable>
  );
}

export interface ToasterProps extends ToastViewportProps {}

export function Toaster(props: ToasterProps) {
  return <ToastViewport {...props} />;
}

// Single implementation serves both Toaster and Sonner for API parity.
// Swipe-to-dismiss and focus management remain future enhancements.
export const Sonner = Toaster;
export type SonnerProps = ToasterProps;

export function useSonner() {
  return useToast();
}

export { useToast };
