import * as React from "react";
import { cn } from "../_shared/variants";
import {
  overlayPositionClasses,
  overlayPositionStyle,
  type OverlayPositionProps,
} from "../_shared/positioning.web";
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

  const handleFocus = (event: React.FocusEvent<HTMLSpanElement>) => {
    context.setOpen(true);
    onFocus?.(event);
  };
  const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    context.setOpen(false);
    onBlur?.(event);
  };
  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    context.setOpen(true);
    onMouseEnter?.(event);
  };
  const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>) => {
    context.setOpen(false);
    onMouseLeave?.(event);
  };

  type AsChildProps = {
    onFocus?: (event: React.FocusEvent<HTMLSpanElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLSpanElement>) => void;
    onMouseEnter?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    [key: string]: unknown;
  };

  const triggerA11y = {
    id: (props as { id?: string }).id ?? context.triggerId,
    "aria-describedby": context.open ? context.contentId : undefined,
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      ...triggerA11y,
      ...props,
      onFocus: (e: React.FocusEvent<HTMLSpanElement>) => {
        handleFocus(e);
        children.props.onFocus?.(e);
      },
      onBlur: (e: React.FocusEvent<HTMLSpanElement>) => {
        handleBlur(e);
        children.props.onBlur?.(e);
      },
      onMouseEnter: (e: React.MouseEvent<HTMLSpanElement>) => {
        handleMouseEnter(e);
        children.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent<HTMLSpanElement>) => {
        handleMouseLeave(e);
        children.props.onMouseLeave?.(e);
      },
    });
  }

  return (
    <span
      ref={ref}
      tabIndex={0}
      {...triggerA11y}
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
  React.HTMLAttributes<HTMLDivElement> & OverlayPositionProps
>(({ align = "center", alignOffset = 0, className, id, side = "bottom", sideOffset = 0, style, ...props }, ref) => {
  const context = useTooltipContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={id ?? context.contentId}
      role="tooltip"
      data-side={side}
      data-align={align}
      className={cn(
        "absolute z-50 rounded-[var(--sx-radius-md)] bg-[color:#0f172a] px-3 py-2 text-xs font-medium text-white shadow-[0_16px_36px_rgba(15,23,42,0.24)]",
        overlayPositionClasses(side, align),
        className,
      )}
      style={{ ...overlayPositionStyle(side, sideOffset, alignOffset), ...style }}
      {...props}
    />
  );
});

TooltipContent.displayName = "TooltipContent";
