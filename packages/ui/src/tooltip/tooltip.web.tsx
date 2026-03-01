import * as React from "react";
import { cn } from "../_shared/variants";
import {
  TooltipProvider,
  useTooltipContext,
  useTooltipController,
  type TooltipSharedProps,
} from "./tooltip.shared";

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    TooltipSharedProps {
  readonly children: React.ReactNode;
}

export function Tooltip({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: TooltipProps) {
  const controller = useTooltipController({ defaultOpen, onOpenChange, open });

  return (
    <TooltipProvider value={controller}>
      <span className={cn("relative inline-flex", className)} {...props}>
        {children}
      </span>
    </TooltipProvider>
  );
}

export const TooltipTrigger = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, onBlur, onFocus, onMouseEnter, onMouseLeave, ...props }, ref) => {
  const context = useTooltipContext();

  return (
    <span
      ref={ref}
      tabIndex={0}
      onFocus={(event) => {
        context.setOpen(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        context.setOpen(false);
        onBlur?.(event);
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
    >
      {children}
    </span>
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = useTooltipContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "absolute left-1/2 top-[calc(100%+0.5rem)] z-50 -translate-x-1/2 rounded-[var(--sx-radius-md)] bg-[color:#0f172a] px-3 py-2 text-xs font-medium text-white shadow-[0_16px_36px_rgba(15,23,42,0.24)]",
        className,
      )}
      {...props}
    />
  );
});

TooltipContent.displayName = "TooltipContent";
