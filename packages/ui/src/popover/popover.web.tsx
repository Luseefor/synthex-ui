import * as React from "react";
import { cn } from "../_shared/variants";
import {
  overlayPositionClasses,
  overlayPositionStyle,
  type OverlayPositionProps,
} from "../_shared/positioning.web";
import {
  PopoverProvider,
  usePopoverContext,
  usePopoverController,
  type PopoverSharedProps,
} from "./popover.shared";

export interface PopoverProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
  PopoverSharedProps {
  readonly children: React.ReactNode;
}

export function Popover({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: PopoverProps) {
  const controller = usePopoverController({ defaultOpen, onOpenChange, open });
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!controller.open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        controller.setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        controller.setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [controller]);

  return (
    <PopoverProvider value={controller}>
      <div ref={rootRef} className={cn("relative inline-flex", className)} {...props}>
        {children}
      </div>
    </PopoverProvider>
  );
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, type = "button", asChild, ...props }, ref) => {
  const context = usePopoverContext();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(!context.open);
      onClick?.(event);
    },
    [context, onClick]
  );

  type AsChildProps = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    [key: string]: unknown;
  };

  const triggerA11y = {
    id: props.id ?? context.triggerId,
    "aria-expanded": context.open,
    "aria-haspopup": "dialog" as const,
    "aria-controls": context.contentId,
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      ...triggerA11y,
      ...props,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        children.props.onClick?.(e);
      },
    });
  }

  return (
    <button
      ref={ref}
      type={type}
      {...triggerA11y}
      onClick={(event) => {
        context.setOpen(!context.open);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

PopoverTrigger.displayName = "PopoverTrigger";

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & OverlayPositionProps
>(({ align = "start", alignOffset = 0, className, id, side = "bottom", sideOffset = 0, style, ...props }, ref) => {
  const context = usePopoverContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={id ?? context.contentId}
      data-side={side}
      data-align={align}
      className={cn(
        "absolute z-50 min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-3 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
        overlayPositionClasses(side, align),
        className,
      )}
      style={{ ...overlayPositionStyle(side, sideOffset, alignOffset), ...style }}
      {...props}
    />
  );
});

PopoverContent.displayName = "PopoverContent";
