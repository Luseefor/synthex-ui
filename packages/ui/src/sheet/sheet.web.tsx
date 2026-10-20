import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import type { DialogSharedProps } from "../dialog/dialog.shared";

export interface SheetProps extends DialogSharedProps {
  readonly children: React.ReactNode;
  readonly modal?: boolean;
}

export function Sheet({ children, defaultOpen, modal = true, onOpenChange, open }: SheetProps) {
  return (
    <SheetPrimitive.Root
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </SheetPrimitive.Root>
  );
}

export interface SheetTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  (props, ref) => (
    <SheetPrimitive.Trigger ref={ref} data-slot="sheet-trigger" {...props} />
  ),
);

SheetTrigger.displayName = "SheetTrigger";

export interface SheetCloseProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close> {
  readonly asChild?: boolean;
}

export const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  (props, ref) => (
    <SheetPrimitive.Close ref={ref} data-slot="sheet-close" {...props} />
  ),
);

SheetClose.displayName = "SheetClose";

const sheetContentVariants = cva(
  "fixed z-[101] gap-4 border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    defaultVariants: {
      side: "right",
    },
    variants: {
      side: {
        bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        left: "start-0 top-0 h-full w-full max-w-md border-e data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        right: "end-0 top-0 h-full w-full max-w-md border-s data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        top: "inset-x-0 top-0 max-h-[85vh] w-full border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
      },
    },
  },
);

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  readonly dismissible?: boolean;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      children,
      className,
      dismissible = true,
      onEscapeKeyDown,
      onInteractOutside,
      onPointerDownOutside,
      side = "right",
      ...props
    },
    ref,
  ) => (
    <SheetPrimitive.Portal data-slot="sheet-portal">
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-[100] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        data-side={side}
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
        className={cn(sheetContentVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          data-slot="sheet-close"
          aria-label="Close sheet"
          className="absolute end-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)] transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]"
        >
          <CloseIcon size={16} />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  ),
);

SheetContent.displayName = "SheetContent";

export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sheet-header"
    className={cn("flex flex-col gap-2 text-start", className)}
    {...props}
  />
));

SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    data-slot="sheet-title"
    className={cn(
      "text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    data-slot="sheet-description"
    className={cn(
      "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

SheetDescription.displayName = "SheetDescription";

export const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sheet-footer"
    className={cn("mt-6 flex flex-wrap items-center justify-end gap-3", className)}
    {...props}
  />
));

SheetFooter.displayName = "SheetFooter";
