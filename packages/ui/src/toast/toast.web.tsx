import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { Toaster as SonnerPrimitive } from "sonner";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import {
  ToastProviderStore,
  useToast,
  useToastState,
  useToastStore,
  type ToastSharedProps,
} from "./toast.shared";

export interface ToastProviderProps {
  readonly children: React.ReactNode;
  readonly swipeDirection?: React.ComponentProps<typeof ToastPrimitives.Provider>["swipeDirection"];
}

export function ToastProvider({ children, swipeDirection = "right" }: ToastProviderProps) {
  const store = useToastState();

  return (
    <ToastPrimitives.Provider swipeDirection={swipeDirection}>
      <ToastProviderStore value={store}>{children}</ToastProviderStore>
    </ToastPrimitives.Provider>
  );
}

export interface ToastViewportProps
  extends React.ComponentProps<typeof ToastPrimitives.Viewport> {
  readonly expand?: boolean;
  readonly position?: "top" | "bottom";
  readonly richColors?: boolean;
}

export const ToastViewport = React.forwardRef<HTMLOListElement, ToastViewportProps>(
  ({ className, expand = false, position = "bottom", richColors = false, ...props }, ref) => {
    const store = useToastStore();

    return (
      <ToastPrimitives.Viewport
        ref={ref}
        data-slot="toast-viewport"
        data-expand={expand}
        data-position={position}
        data-rich-colors={richColors}
        className={cn(
          "fixed z-[100] flex max-h-screen w-full max-w-[420px] flex-col p-4",
          position === "top" ? "top-0 right-0 sm:top-4 sm:right-4" : "right-0 bottom-0 sm:right-4 sm:bottom-4",
          expand && "gap-3",
          !expand && "gap-2",
          className,
        )}
        {...props}
      >
        {store.toasts.map((toast) => (
          <Toast
            key={toast.id}
            duration={toast.duration}
            variant={toast.variant}
            open
            onOpenChange={(open) => {
              if (!open) {
                store.dismissToast(toast.id);
              }
            }}
          >
            <div className="grid gap-1">
              {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
              {toast.description ? (
                <ToastDescription>{toast.description}</ToastDescription>
              ) : null}
            </div>
            {toast.actionLabel ? (
              <ToastAction
                altText={toast.actionLabel}
                onClick={() => {
                  toast.action?.();
                  store.dismissToast(toast.id);
                }}
              >
                {toast.actionLabel}
              </ToastAction>
            ) : null}
            <ToastClose onClick={() => store.dismissToast(toast.id)} />
          </Toast>
        ))}
      </ToastPrimitives.Viewport>
    );
  },
);

ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border",
        destructive:
          "destructive group border-destructive bg-destructive text-white",
        success: "bg-card text-card-foreground border-emerald-500/40",
        warning: "bg-card text-card-foreground border-amber-500/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ToastProps
  extends React.ComponentProps<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <ToastPrimitives.Root
      ref={ref}
      data-slot="toast"
      data-variant={variant}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  ),
);

Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentProps<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    data-slot="toast-action"
    className={cn(
      "ring-ring hover:bg-secondary focus:ring-ring inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:ring-1 focus:outline-none disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-white/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-destructive",
      className,
    )}
    {...props}
  />
));

ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentProps<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    data-slot="toast-close"
    aria-label="Dismiss toast"
    className={cn(
      "text-foreground/50 hover:text-foreground absolute top-1 right-1 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 [&_svg]:size-4",
      className,
    )}
    {...props}
  >
    <CloseIcon size={14} />
  </ToastPrimitives.Close>
));

ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentProps<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    data-slot="toast-title"
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
));

ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentProps<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    data-slot="toast-description"
    className={cn("text-muted-foreground text-sm opacity-90", className)}
    {...props}
  />
));

ToastDescription.displayName = ToastPrimitives.Description.displayName;

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription };

export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export interface ToasterProps extends ToastViewportProps {
  readonly theme?: "light" | "dark" | "system";
  readonly toastOptions?: Record<string, unknown>;
  readonly gap?: number;
  readonly visibleToasts?: number;
}

export function Toaster({
  expand = false,
  gap,
  position = "bottom",
  richColors = false,
  theme = "system",
  toastOptions,
  visibleToasts,
  ...props
}: ToasterProps): React.JSX.Element {
  const sonnerPosition =
    position === "top" ? ("top-right" as const) : ("bottom-right" as const);

  return (
    <>
      <ToastViewport expand={expand} position={position} richColors={richColors} {...props} />
      <SonnerPrimitive
        data-slot="sonner-toaster"
        theme={theme}
        position={sonnerPosition}
        expand={expand}
        richColors={richColors}
        gap={gap}
        visibleToasts={visibleToasts}
        toastOptions={toastOptions}
      />
    </>
  );
}

export const Sonner = Toaster;
export type SonnerProps = ToasterProps;

export function useSonner() {
  return useToast();
}

export { useToast, toastVariants };
export type { ToastSharedProps };
