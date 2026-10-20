import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../_shared/variants";
import {
  TooltipProvider,
  useTooltipContext,
  useTooltipController,
  type TooltipSharedProps,
} from "./tooltip.shared";

export interface TooltipProps extends TooltipSharedProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  /**
   * Delay before showing. Defaults to 0 for shadcn parity (shadcn
   * `TooltipProvider` uses `delayDuration={0}`); Radix defaults to 700.
   * Accepted on native for API parity but ignored (native shows instantly).
   */
  readonly delayDuration?: number;
}

export function Tooltip({
  children,
  className,
  defaultOpen,
  // shadcn parity: instant by default; keep passing to both Provider and Root.
  delayDuration = 0,
  onOpenChange,
  open,
}: TooltipProps) {
  const controller = useTooltipController({ defaultOpen, onOpenChange, open });

  return (
    <TooltipProvider value={controller}>
      <TooltipPrimitive.Provider delayDuration={delayDuration}>
        <TooltipPrimitive.Root
          delayDuration={delayDuration}
          onOpenChange={controller.setOpen}
          open={controller.open}
        >
          <span data-slot="tooltip" className={cn("relative inline-flex", className)}>
            {children}
          </span>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    </TooltipProvider>
  );
}

export interface TooltipTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ onBlur, onFocus, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const context = useTooltipContext();

    return (
      <TooltipPrimitive.Trigger
        ref={ref}
        data-slot="tooltip-trigger"
        onBlur={(event) => {
          context.setOpen(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onMouseEnter={(event) => {
          context.setOpen(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          context.setOpen(false);
          onMouseLeave?.(event);
        }}
        {...props}
      />
    );
  },
);

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  readonly alignOffset?: number;
  readonly sideOffset?: number;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      align = "center",
      alignOffset = 0,
      className,
      side = "bottom",
      sideOffset = 0,
      ...props
    },
    ref,
  ) => (
    <TooltipPrimitive.Portal data-slot="tooltip-portal">
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-[var(--sx-radius-md)] bg-[color:#0f172a] px-3 py-2 text-xs font-medium text-white shadow-[0_16px_36px_rgba(15,23,42,0.24)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  ),
);

TooltipContent.displayName = "TooltipContent";
