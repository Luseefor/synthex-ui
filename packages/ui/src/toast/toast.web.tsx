import * as React from "react";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { CloseIcon } from "../icons/index.web";
import {
  ToastProviderStore,
  useToast,
  useToastState,
  useToastStore,
  type ToastDescriptor,
  type ToastSharedProps,
} from "./toast.shared";

export interface ToastProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode;
}

export function ToastProvider({ children, ...props }: ToastProviderProps) {
  const store = useToastState();

  return (
    <ToastProviderStore value={store}>
      <div {...props}>{children}</div>
    </ToastProviderStore>
  );
}

export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => {
    const store = useToastStore();

    return (
      <div
        ref={ref}
        data-slot="toast-viewport"
        className={cn(
          "fixed bottom-4 right-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3",
          className,
        )}
        {...props}
      >
        {store.toasts.map((toast) => (
          <Toast key={toast.id} duration={toast.duration}>
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? (
              <ToastDescription>{toast.description}</ToastDescription>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              {toast.actionLabel ? <ToastAction>{toast.actionLabel}</ToastAction> : null}
              <ToastClose onClick={() => store.dismissToast(toast.id)} />
            </div>
          </Toast>
        ))}
      </div>
    );
  },
);

ToastViewport.displayName = "ToastViewport";

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ToastSharedProps {}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ children, className, duration = 4000, onOpenChange, open = true, ...props }, ref) => {
    const [visible, setVisible] = React.useState(open);

    React.useEffect(() => {
      setVisible(open);
    }, [open]);

    React.useEffect(() => {
      if (!visible || !duration) {
        return;
      }

      const timeout = window.setTimeout(() => {
        setVisible(false);
        onOpenChange?.(false);
      }, duration);

      return () => {
        window.clearTimeout(timeout);
      };
    }, [duration, onOpenChange, visible]);

    if (!visible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Toast.displayName = "Toast";

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <div
      className={cn("text-sm font-semibold text-[color:var(--sx-color-foreground)]", className)}
      {...props}
    />
  );
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <p
      className={cn("mt-1 text-sm text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    />
  );
}

export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export function ToastAction({ className, type = "button", ...props }: ToastActionProps) {
  return <Button type={type} size="sm" variant="outline" className={className} {...props} />;
}

export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export function ToastClose({ className, type = "button", ...props }: ToastCloseProps) {
  return (
    <button
      type={type}
      aria-label="Dismiss toast"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] text-[color:var(--sx-color-foreground-muted)] transition-colors duration-150 hover:bg-[color:var(--sx-color-surface-muted)] hover:text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    >
      <CloseIcon size={14} />
    </button>
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
