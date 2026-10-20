import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../_shared/variants";
import type { PopoverSharedProps } from "./popover.shared";

export interface PopoverProps extends PopoverSharedProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly modal?: boolean;
}

export function Popover({
  children,
  className,
  defaultOpen,
  modal = false,
  onOpenChange,
  open,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      <div data-slot="popover" className={cn("relative inline-flex", className)}>
        {children}
      </div>
    </PopoverPrimitive.Root>
  );
}

export interface PopoverTriggerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  (props, ref) => (
    <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />
  ),
);

PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  readonly alignOffset?: number;
  readonly sideOffset?: number;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      align = "start",
      alignOffset = 0,
      className,
      side = "bottom",
      sideOffset = 0,
      ...props
    },
    ref,
  ) => (
    <PopoverPrimitive.Portal data-slot="popover-portal">
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="popover-content"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-3 shadow-[0_18px_42px_rgba(15,23,42,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);

PopoverContent.displayName = "PopoverContent";
