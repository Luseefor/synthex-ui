import * as React from "react";
import { cn } from "../_shared/variants";
import {
  overlayPositionClasses,
  overlayPositionStyle,
  type OverlayPositionProps,
} from "../_shared/positioning.web";
import { HoverCardProvider, useHoverCardContext, useHoverCardController, type HoverCardSharedProps } from "./hover-card.shared";

export interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement>, HoverCardSharedProps {
  readonly children?: React.ReactNode;
}

export function HoverCard({ children, className, closeDelay, defaultOpen, onOpenChange, open, openDelay, ...props }: HoverCardProps) {
  const controller = useHoverCardController({ closeDelay, defaultOpen, onOpenChange, open, openDelay });
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const scheduleOpen = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (controller.openDelay <= 0) {
      controller.setOpen(true);
      return;
    }
    openTimer.current = window.setTimeout(() => controller.setOpen(true), controller.openDelay);
  };
  const scheduleClose = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (controller.closeDelay <= 0) {
      controller.setOpen(false);
      return;
    }
    closeTimer.current = window.setTimeout(() => controller.setOpen(false), controller.closeDelay);
  };

  React.useEffect(() => () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  return (
    <HoverCardProvider value={controller}>
      <div
        className={cn("relative inline-flex", className)}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        {...props}
      >
        {children}
      </div>
    </HoverCardProvider>
  );
}

export const HoverCardTrigger = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean }
>(({ children, asChild, onBlur, onFocus, onMouseEnter, onMouseLeave, ...props }, ref) => {
  const context = useHoverCardContext();

  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    context.setOpen(true);
    onMouseEnter?.(event);
  };
  const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>) => {
    context.setOpen(false);
    onMouseLeave?.(event);
  };
  const handleFocus = (event: React.FocusEvent<HTMLSpanElement>) => {
    context.setOpen(true);
    onFocus?.(event);
  };
  const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    context.setOpen(false);
    onBlur?.(event);
  };

  type AsChildProps = {
    onBlur?: (event: React.FocusEvent<HTMLSpanElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLSpanElement>) => void;
    onMouseEnter?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    [key: string]: unknown;
  };

  const triggerA11y = {
    "aria-expanded": context.open,
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      ...triggerA11y,
      ...props,
      onMouseEnter: (e: React.MouseEvent<HTMLSpanElement>) => {
        handleMouseEnter(e);
        children.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent<HTMLSpanElement>) => {
        handleMouseLeave(e);
        children.props.onMouseLeave?.(e);
      },
      onFocus: (e: React.FocusEvent<HTMLSpanElement>) => {
        handleFocus(e);
        children.props.onFocus?.(e);
      },
      onBlur: (e: React.FocusEvent<HTMLSpanElement>) => {
        handleBlur(e);
        children.props.onBlur?.(e);
      },
    });
  }
  return (
    <span
      ref={ref}
      {...triggerA11y}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </span>
  );
});
HoverCardTrigger.displayName = "HoverCardTrigger";

export const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & OverlayPositionProps
>(
  ({ align = "start", alignOffset = 0, className, side = "bottom", sideOffset = 0, style, ...props }, ref) => {
    const context = useHoverCardContext();
    if (!context.open) return null;
    return (
      <div
        ref={ref}
        data-side={side}
        data-align={align}
        className={cn(
          "absolute z-50 min-w-64 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
          overlayPositionClasses(side, align),
          className,
        )}
        style={{ ...overlayPositionStyle(side, sideOffset, alignOffset), ...style }}
        {...props}
      />
    );
  },
);
HoverCardContent.displayName = "HoverCardContent";
