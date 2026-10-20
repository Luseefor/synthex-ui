import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import type { DialogSharedProps } from "./dialog.shared";

export interface DialogProps extends DialogSharedProps {
  readonly children: React.ReactNode;
  readonly modal?: boolean;
}

export function Dialog({ children, defaultOpen, modal = true, onOpenChange, open }: DialogProps) {
  return (
    <DialogPrimitive.Root
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </DialogPrimitive.Root>
  );
}

export interface DialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  (props, ref) => (
    <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />
  ),
);

DialogTrigger.displayName = "DialogTrigger";

export interface DialogCloseProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {
  readonly asChild?: boolean;
}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  (props, ref) => (
    <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />
  ),
);

DialogClose.displayName = "DialogClose";

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  readonly dismissible?: boolean;
  readonly hideClose?: boolean;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      children,
      className,
      dismissible = true,
      hideClose = false,
      onEscapeKeyDown,
      onInteractOutside,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        aria-modal="true"
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          if (!dismissible && !event.defaultPrevented) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (!dismissible && !event.defaultPrevented) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          if (!dismissible && !event.defaultPrevented) {
            event.preventDefault();
          }
        }}
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[var(--sx-shadow-dialog)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {!hideClose ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="Close dialog"
            className="absolute end-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-70 transition-all duration-[var(--sx-motion-fast)] hover:opacity-100 hover:bg-[color:var(--sx-color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]"
          >
            <CloseIcon size={15} />
          </DialogPrimitive.Close>
        ) : null}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);

DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-header"
    className={cn("flex flex-col gap-1.5 text-start", className)}
    {...props}
  />
));

DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn(
      "text-lg font-semibold leading-none tracking-[-0.02em] text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn(
      "text-sm leading-relaxed text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-footer"
    className={cn(
      "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3",
      className,
    )}
    {...props}
  />
));

DialogFooter.displayName = "DialogFooter";
