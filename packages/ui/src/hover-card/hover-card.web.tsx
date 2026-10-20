import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "../_shared/variants";
import {
  HoverCardProvider,
  useHoverCardContext,
  useHoverCardController,
  type HoverCardSharedProps,
} from "./hover-card.shared";

export interface HoverCardProps
  extends React.HTMLAttributes<HTMLDivElement>, HoverCardSharedProps {
  readonly children?: React.ReactNode;
}

export function HoverCard({
  children,
  className,
  closeDelay,
  defaultOpen,
  onOpenChange,
  open,
  openDelay,
  ...props
}: HoverCardProps) {
  const controller = useHoverCardController({
    closeDelay,
    defaultOpen,
    onOpenChange,
    open,
    openDelay,
  });

  return (
    <HoverCardProvider value={controller}>
      <HoverCardPrimitive.Root
        closeDelay={controller.closeDelay}
        onOpenChange={controller.setOpen}
        open={controller.open}
        openDelay={controller.openDelay}
      >
        <div
          data-slot="hover-card"
          className={cn("relative inline-flex", className)}
          {...props}
        >
          {children}
        </div>
      </HoverCardPrimitive.Root>
    </HoverCardProvider>
  );
}

export interface HoverCardTriggerProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const HoverCardTrigger = React.forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(
  ({ onBlur, onFocus, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const context = useHoverCardContext();
    const openTimer = React.useRef<number | null>(null);
    const closeTimer = React.useRef<number | null>(null);

    React.useEffect(
      () => () => {
        if (openTimer.current) window.clearTimeout(openTimer.current);
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
      },
      [],
    );

    const scheduleOpen = React.useCallback(() => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      if (context.openDelay <= 0) {
        context.setOpen(true);
        return;
      }
      openTimer.current = window.setTimeout(() => context.setOpen(true), context.openDelay);
    }, [context]);

    const scheduleClose = React.useCallback(() => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (context.closeDelay <= 0) {
        context.setOpen(false);
        return;
      }
      closeTimer.current = window.setTimeout(() => context.setOpen(false), context.closeDelay);
    }, [context]);

    return (
      <HoverCardPrimitive.Trigger
        ref={ref}
        data-slot="hover-card-trigger"
        onBlur={(event) => {
          context.setOpen(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onMouseEnter={(event) => {
          scheduleOpen();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          scheduleClose();
          onMouseLeave?.(event);
        }}
        {...props}
      />
    );
  },
);

HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  readonly alignOffset?: number;
  readonly sideOffset?: number;
}

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
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
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        ref={ref}
        data-slot="hover-card-content"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-64 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  ),
);

HoverCardContent.displayName = "HoverCardContent";
