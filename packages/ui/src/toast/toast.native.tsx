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
import {
  ToastProviderStore,
  useToast,
  useToastState,
  useToastStore,
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

export interface ToastViewportProps extends ViewProps {}
export function ToastViewport({ style, ...props }: ToastViewportProps) {
  const store = useToastStore();
  const theme = useTheme();

  return (
    <Modal transparent visible={store.toasts.length > 0}>
      <View
        style={[
          {
            bottom: 16,
            gap: 12,
            left: 16,
            position: "absolute",
            right: 16,
          },
          style,
        ]}
        {...props}
      >
        {store.toasts.map((toast) => (
          <View
            key={toast.id}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              {toast.actionLabel ? <ToastAction>{toast.actionLabel}</ToastAction> : null}
              <ToastClose onPress={() => store.dismissToast(toast.id)} />
            </View>
          </View>
        ))}
      </View>
    </Modal>
  );
}

export interface ToastProps extends ViewProps, ToastSharedProps {}
export function Toast({ children, style, ...props }: ToastProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
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
  return <Button size="sm" variant="outline" {...props} />;
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

export function Toaster() {
  return <ToastViewport />;
}

export const Sonner = Toaster;

export function useSonner() {
  return useToast();
}

export { useToast };
