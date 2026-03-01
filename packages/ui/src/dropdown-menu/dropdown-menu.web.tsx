import * as React from "react";
import { cn } from "../_shared/variants";
import {
  DropdownMenuProvider,
  useDropdownMenuContext,
  useDropdownMenuController,
  type DropdownMenuSharedProps,
} from "./dropdown-menu.shared";

export interface DropdownMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    DropdownMenuSharedProps {
  readonly children: React.ReactNode;
}

export function DropdownMenu({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: DropdownMenuProps) {
  const controller = useDropdownMenuController({ defaultOpen, onOpenChange, open });
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
    <DropdownMenuProvider value={controller}>
      <div ref={rootRef} className={cn("relative inline-flex", className)} {...props}>
        {children}
      </div>
    </DropdownMenuProvider>
  );
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, onClick, type = "button", ...props }, ref) => {
  const context = useDropdownMenuContext();

  return (
    <button
      ref={ref}
      type={type}
      aria-expanded={context.open}
      aria-haspopup="menu"
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

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, ...props }, ref) => {
  const context = useDropdownMenuContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
        className,
      )}
      {...props}
    />
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
  ),
);

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 h-px bg-[color:var(--sx-color-border)]", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, className, onClick, type = "button", ...props }, ref) => {
  const context = useDropdownMenuContext();

  return (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-150 hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
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
  },
);

DropdownMenuItem.displayName = "DropdownMenuItem";
