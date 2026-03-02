import * as React from "react";
import { cn } from "../_shared/variants";
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
>(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { ref, ...props });
  }
  return <span ref={ref} {...props}>{children}</span>;
});
HoverCardTrigger.displayName = "HoverCardTrigger";

export const HoverCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = useHoverCardContext();
    if (!context.open) return null;
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-64 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
          className,
        )}
        {...props}
      />
    );
  },
);
HoverCardContent.displayName = "HoverCardContent";
