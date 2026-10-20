import * as React from "react";
import { cn } from "../_shared/variants";
import { handleMenuArrowKeys } from "../_shared/a11y.web";
import {
  overlayPositionStyle,
  type OverlayPositionProps,
} from "../_shared/positioning.web";
import {
  DropdownMenuArrow as BaseMenuArrow,
  DropdownMenuCheckboxItem as BaseMenuCheckboxItem,
  DropdownMenuRadioGroup as BaseMenuRadioGroup,
  DropdownMenuRadioItem as BaseMenuRadioItem,
  DropdownMenuShortcut as BaseMenuShortcut,
  DropdownMenuSub as BaseMenuSub,
  DropdownMenuSubContent as BaseMenuSubContent,
  DropdownMenuSubTrigger as BaseMenuSubTrigger,
  type DropdownMenuArrowProps as BaseMenuArrowProps,
  type DropdownMenuCheckboxItemProps as BaseMenuCheckboxItemProps,
  type DropdownMenuRadioGroupProps as BaseMenuRadioGroupProps,
  type DropdownMenuRadioItemProps as BaseMenuRadioItemProps,
  type DropdownMenuShortcutProps as BaseMenuShortcutProps,
  type DropdownMenuSubContentProps as BaseMenuSubContentProps,
  type DropdownMenuSubProps as BaseMenuSubProps,
  type DropdownMenuSubTriggerProps as BaseMenuSubTriggerProps,
} from "../dropdown-menu/dropdown-menu.web";
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
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ children, onContextMenu, asChild, ...props }, ref) => {
  const context = useContextMenuContext();

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    context.setPosition({ x: event.clientX, y: event.clientY });
    context.setOpen(true);
    onContextMenu?.(event);
  };

  type AsChildProps = {
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
    [key: string]: unknown;
  };

  const triggerA11y = {
    "aria-haspopup": "menu" as const,
    "aria-expanded": context.open,
    "aria-controls": context.contentId,
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      ...triggerA11y,
      ...props,
      onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => {
        handleContextMenu(e);
        children.props.onContextMenu?.(e);
      },
    });
  }

  return (
    <div
      ref={ref}
      {...triggerA11y}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {children}
    </div>
  );
});

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & OverlayPositionProps
>(({ align = "start", alignOffset = 0, className, id, onKeyDown, side = "bottom", sideOffset = 0, style, ...props }, ref) => {
  const context = useContextMenuContext();

  if (!context.open) {
    return null;
  }

  // Cursor-anchored: side/align select the offset direction; offsets nudge the fixed position.
  const dx = side === "left" ? -sideOffset : side === "right" ? sideOffset : alignOffset;
  const dy = side === "top" ? -sideOffset : side === "bottom" ? sideOffset : alignOffset;

  return (
    <div
      ref={ref}
      id={id ?? context.contentId}
      role="menu"
      tabIndex={-1}
      data-side={side}
      data-align={align}
      className={cn(
        "fixed z-[90] min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.16)]",
        className,
      )}
      style={{
        left: context.position.x + dx,
        top: context.position.y + dy,
        ...style,
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleMenuArrowKeys(event);
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
    role="separator"
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

export type ContextMenuSubProps = BaseMenuSubProps;
export function ContextMenuSub(props: ContextMenuSubProps) {
  return <BaseMenuSub {...props} />;
}

export type ContextMenuSubTriggerProps = BaseMenuSubTriggerProps;
export const ContextMenuSubTrigger = React.forwardRef<HTMLButtonElement, ContextMenuSubTriggerProps>(
  (props, ref) => <BaseMenuSubTrigger ref={ref} {...props} />,
);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export type ContextMenuSubContentProps = BaseMenuSubContentProps;
export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  (props, ref) => <BaseMenuSubContent ref={ref} {...props} />,
);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export type ContextMenuCheckboxItemProps = BaseMenuCheckboxItemProps;
export const ContextMenuCheckboxItem = React.forwardRef<HTMLButtonElement, ContextMenuCheckboxItemProps>(
  (props, ref) => <BaseMenuCheckboxItem ref={ref} {...props} />,
);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export type ContextMenuRadioGroupProps = BaseMenuRadioGroupProps;
export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <BaseMenuRadioGroup {...props} />;
}

export type ContextMenuRadioItemProps = BaseMenuRadioItemProps;
export const ContextMenuRadioItem = React.forwardRef<HTMLButtonElement, ContextMenuRadioItemProps>(
  (props, ref) => <BaseMenuRadioItem ref={ref} {...props} />,
);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export type ContextMenuShortcutProps = BaseMenuShortcutProps;
export const ContextMenuShortcut = React.forwardRef<HTMLSpanElement, ContextMenuShortcutProps>(
  (props, ref) => <BaseMenuShortcut ref={ref} {...props} />,
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export type ContextMenuArrowProps = BaseMenuArrowProps;
export const ContextMenuArrow = React.forwardRef<HTMLDivElement, ContextMenuArrowProps>(
  (props, ref) => <BaseMenuArrow ref={ref} {...props} />,
);
ContextMenuArrow.displayName = "ContextMenuArrow";
