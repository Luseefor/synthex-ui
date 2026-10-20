import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import type { DrawerSharedProps } from "./drawer.shared";

export interface DrawerProps extends DrawerSharedProps {
  readonly children?: React.ReactNode;
}

export function Drawer({
  children,
  defaultOpen,
  direction = "bottom",
  dismissible = true,
  modal = true,
  onOpenChange,
  open,
}: DrawerProps) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      defaultOpen={defaultOpen}
      direction={direction}
      dismissible={dismissible}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </DrawerPrimitive.Root>
  );
}

export interface DrawerTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  (props, ref) => (
    <DrawerPrimitive.Trigger ref={ref} data-slot="drawer-trigger" {...props} />
  ),
);

DrawerTrigger.displayName = "DrawerTrigger";

export interface DrawerCloseProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close> {
  readonly asChild?: boolean;
}

export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  (props, ref) => (
    <DrawerPrimitive.Close ref={ref} data-slot="drawer-close" {...props} />
  ),
);

DrawerClose.displayName = "DrawerClose";

const drawerContentVariants = cva(
  "fixed z-[101] gap-4 border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22)]",
  {
    defaultVariants: {
      side: "bottom",
    },
    variants: {
      side: {
        bottom:
          "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-[calc(var(--sx-radius-xl)+4px)] border-t",
        left: "bottom-0 left-0 top-0 h-full w-full max-w-md border-r",
        right: "bottom-0 right-0 top-0 h-full w-full max-w-md border-l",
        top: "inset-x-0 top-0 max-h-[85vh] w-full rounded-b-[calc(var(--sx-radius-xl)+4px)] border-b",
      },
    },
  },
);

export interface DrawerContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {
  readonly side?: "bottom" | "left" | "right" | "top";
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, side = "bottom", ...props }, ref) => (
    <DrawerPrimitive.Portal data-slot="drawer-portal">
      <DrawerPrimitive.Overlay
        data-slot="drawer-overlay"
        className="fixed inset-0 z-[100] bg-[rgba(15,23,42,0.38)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <DrawerPrimitive.Content
        ref={ref}
        data-slot="drawer-content"
        data-side={side}
        aria-modal="true"
        className={cn(drawerContentVariants({ side }), className)}
        {...props}
      >
        <div
          data-slot="drawer-handle"
          aria-hidden="true"
          className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-[color:var(--sx-color-border)]"
        />
        {children}
        <DrawerPrimitive.Close
          data-slot="drawer-close"
          aria-label="Close drawer"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]"
        >
          <CloseIcon size={16} />
        </DrawerPrimitive.Close>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  ),
);

DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drawer-header"
    className={cn("flex flex-col gap-2 text-left", className)}
    {...props}
  />
));

DrawerHeader.displayName = "DrawerHeader";

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    data-slot="drawer-title"
    className={cn(
      "text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    data-slot="drawer-description"
    className={cn(
      "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

DrawerDescription.displayName = "DrawerDescription";

export const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drawer-footer"
    className={cn("mt-6 flex flex-wrap items-center justify-end gap-3", className)}
    {...props}
  />
));

DrawerFooter.displayName = "DrawerFooter";
