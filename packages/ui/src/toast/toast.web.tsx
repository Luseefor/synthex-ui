import * as React from "react";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { CheckIcon, CloseIcon } from "../icons/index.web";
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

export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> { }

export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => {
    const store = useToastStore();

    return (
      <div
        ref={ref}
        data-slot="toast-viewport"
        className={cn(
          "fixed bottom-0 right-0 z-[100] flex w-full max-w-[420px] flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:flex-col",
          className,
        )}
        {...props}
      >
        {store.toasts.map((toast) => (
          <Toast key={toast.id} duration={toast.duration} variant={toast.variant}>
            <div className="flex flex-1 flex-col gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description ? (
                <ToastDescription>{toast.description}</ToastDescription>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {toast.actionLabel ? (
                <ToastAction
                  onClick={() => {
                    toast.action?.();
                    store.dismissToast(toast.id);
                  }}
                >
                  {toast.actionLabel}
                </ToastAction>
              ) : null}
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
  ToastSharedProps { }

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      children,
      className,
      duration = 5000,
      onOpenChange,
      open = true,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(open);
    const [exiting, setExiting] = React.useState(false);

    React.useEffect(() => {
      setVisible(open);
    }, [open]);

    React.useEffect(() => {
      if (!visible || !duration) {
        return;
      }

      const timeout = window.setTimeout(() => {
        setExiting(true);
        window.setTimeout(() => {
          setVisible(false);
          onOpenChange?.(false);
        }, 200);
      }, duration);

      return () => {
        window.clearTimeout(timeout);
      };
    }, [duration, onOpenChange, visible]);

    if (!visible) {
      return null;
    }

    const variantClasses =
      variant === "success"
        ? "border-l-[3px] border-l-emerald-500"
        : variant === "warning"
          ? "border-l-[3px] border-l-amber-500"
          : variant === "destructive"
            ? "border-l-[3px] border-l-[color:var(--sx-color-destructive)]"
            : "border-l-[3px] border-l-[color:var(--sx-color-primary)]";

    const iconBg =
      variant === "success"
        ? "bg-emerald-500/10 text-emerald-600"
        : variant === "warning"
          ? "bg-amber-500/10 text-amber-600"
          : variant === "destructive"
            ? "bg-[color:var(--sx-color-destructive-muted)] text-[color:var(--sx-color-destructive)]"
            : "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-primary)]";

    return (
      <div
        ref={ref}
        role="status"
        data-state={exiting ? "closed" : "open"}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[var(--sx-shadow-toast)]",
          variantClasses,
          exiting
            ? "animate-[sx-toast-exit_200ms_var(--sx-easing-standard)_forwards]"
            : "animate-[sx-toast-enter_300ms_var(--sx-easing-emphasized)]",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            iconBg,
          )}
        >
          {variant === "destructive" ? <CloseIcon size={14} strokeWidth={2.5} /> : <CheckIcon size={14} strokeWidth={2.5} />}
        </div>
        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          {children}
        </div>
      </div>
    );
  },
);

Toast.displayName = "Toast";

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> { }
export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <div
      className={cn("text-sm font-semibold leading-5 tracking-[-0.01em] text-[color:var(--sx-color-foreground)]", className)}
      {...props}
    />
  );
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }
export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <p
      className={cn("text-[13px] leading-5 text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    />
  );
}

export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }
export function ToastAction({ className, type = "button", ...props }: ToastActionProps) {
  return (
    <Button
      type={type}
      size="sm"
      variant="outline"
      className={cn("h-7 shrink-0 rounded-[var(--sx-radius-md)] text-xs font-medium", className)}
      {...props}
    />
  );
}

export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }
export function ToastClose({ className, type = "button", ...props }: ToastCloseProps) {
  return (
    <button
      type={type}
      aria-label="Dismiss toast"
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-0 transition-all duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] hover:text-[color:var(--sx-color-foreground)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]",
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
