import * as React from "react";
import { cn } from "../_shared/variants";
import {
  ContextMenuProvider,
  useContextMenuContext,
  useContextMenuController,
  type ContextMenuSharedProps,
} from "./context-menu.shared";

export interface ContextMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    ContextMenuSharedProps {
  readonly children: React.ReactNode;
}

export function ContextMenu({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: ContextMenuProps) {
  const controller = useContextMenuController({ defaultOpen, onOpenChange, open });
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
    <ContextMenuProvider value={controller}>
      <div ref={rootRef} className={cn("relative inline-flex", className)} {...props}>
        {children}
      </div>
    </ContextMenuProvider>
  );
}

export const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, onContextMenu, ...props }, ref) => {
  const context = useContextMenuContext();

  return (
    <div
      ref={ref}
      onContextMenu={(event) => {
        event.preventDefault();
        context.setPosition({ x: event.clientX, y: event.clientY });
        context.setOpen(true);
        onContextMenu?.(event);
      }}
      {...props}
    >
      {children}
    </div>
  );
});

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const context = useContextMenuContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "fixed z-[90] min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.16)]",
        className,
      )}
      style={{
        left: context.position.x,
        top: context.position.y,
        ...style,
      }}
      {...props}
    />
  );
});

ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

ContextMenuLabel.displayName = "ContextMenuLabel";

export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 h-px bg-[color:var(--sx-color-border)]", className)}
    {...props}
  />
));

ContextMenuSeparator.displayName = "ContextMenuSeparator";

export const ContextMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, type = "button", ...props }, ref) => {
  const context = useContextMenuContext();

  return (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        context.setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

ContextMenuItem.displayName = "ContextMenuItem";
