import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../_shared/variants";
import { Button, type ButtonProps } from "../button/button.web";

export interface AlertDialogProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> {}

export function AlertDialog({ ...props }: AlertDialogProps) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export interface AlertDialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  (props, ref) => (
    <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />
  ),
);

AlertDialogTrigger.displayName = "AlertDialogTrigger";

export interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  readonly dismissible?: boolean;
  readonly hideClose?: boolean;
}

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  (
    {
      children,
      className,
      dismissible = false,
      hideClose = true,
      onEscapeKeyDown,
      ...props
    },
    ref,
  ) => (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal">
      <AlertDialogPrimitive.Overlay
        data-slot="alert-dialog-overlay"
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <AlertDialogPrimitive.Content
        ref={ref}
        data-slot="alert-dialog-content"
        role="alertdialog"
        aria-modal="true"
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          if (!dismissible && !event.defaultPrevented) {
            event.preventDefault();
          }
        }}
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[var(--sx-shadow-dialog)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose ? (
          <AlertDialogPrimitive.Cancel
            data-slot="alert-dialog-close"
            aria-label="Close dialog"
            className="absolute end-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-70 transition-all duration-[var(--sx-motion-fast)] hover:opacity-100 hover:bg-[color:var(--sx-color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]"
          >
            {"\u00D7"}
          </AlertDialogPrimitive.Cancel>
        ) : null}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  ),
);

AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-header"
    className={cn("flex flex-col gap-1.5 text-start", className)}
    {...props}
  />
));

AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn(
      "text-lg font-semibold leading-none tracking-[-0.02em] text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn(
      "text-sm leading-relaxed text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

AlertDialogDescription.displayName = "AlertDialogDescription";

export const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-dialog-footer"
    className={cn(
      "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3",
      className,
    )}
    {...props}
  />
));

AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      data-slot="alert-dialog-cancel"
      asChild
    >
      <Button
        variant={variant}
        className={cn("mt-2 sm:mt-0", className)}
        {...props}
      />
    </AlertDialogPrimitive.Cancel>
  ),
);

AlertDialogCancel.displayName = "AlertDialogCancel";

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "destructive", ...props }, ref) => (
    <AlertDialogPrimitive.Action
      ref={ref}
      data-slot="alert-dialog-action"
      asChild
    >
      <Button variant={variant} className={className} {...props} />
    </AlertDialogPrimitive.Action>
  ),
);

AlertDialogAction.displayName = "AlertDialogAction";
