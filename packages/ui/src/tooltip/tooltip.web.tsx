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
  React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean }
>(({ children, onBlur, onFocus, onMouseEnter, onMouseLeave, asChild, ...props }, ref) => {
  const context = useTooltipContext();

  const handleFocus = (event: any) => {
    context.setOpen(true);
    onFocus?.(event);
  };
  const handleBlur = (event: any) => {
    context.setOpen(false);
    onBlur?.(event);
  };
  const handleMouseEnter = (event: any) => {
    context.setOpen(true);
    onMouseEnter?.(event);
  };
  const handleMouseLeave = (event: any) => {
    context.setOpen(false);
    onMouseLeave?.(event);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props,
      onFocus: (e: any) => {
        handleFocus(e);
        (children.props as any).onFocus?.(e);
      },
      onBlur: (e: any) => {
        handleBlur(e);
        (children.props as any).onBlur?.(e);
      },
      onMouseEnter: (e: any) => {
        handleMouseEnter(e);
        (children.props as any).onMouseEnter?.(e);
      },
      onMouseLeave: (e: any) => {
        handleMouseLeave(e);
        (children.props as any).onMouseLeave?.(e);
      },
    });
  }

  return (
    <span
      ref={ref}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
