import * as React from "react";
import { cn } from "../_shared/variants";
import { handleMenuArrowKeys } from "../_shared/a11y.web";
import { useControllableState } from "../hooks/useControllableState";
import { CheckIcon, ChevronRightIcon } from "../icons/index.web";
import {
  overlayPositionClasses,
  overlayPositionStyle,
  type OverlayPositionProps,
} from "../_shared/positioning.web";
import {
  DropdownMenuProvider,
  useDropdownMenuContext,
  useDropdownMenuController,
  useDropdownMenuRadioGroupController,
  DropdownMenuRadioGroupProvider,
  useOptionalDropdownMenuRadioGroupContext,
  useDropdownMenuSubContext,
  useDropdownMenuSubController,
  DropdownMenuSubProvider,
  type DropdownMenuCheckboxItemSharedProps,
  type DropdownMenuRadioGroupSharedProps,
  type DropdownMenuRadioItemSharedProps,
  type DropdownMenuSharedProps,
  type DropdownMenuSubSharedProps,
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, onClick, type = "button", asChild, ...props }, ref) => {
  const context = useDropdownMenuContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(!context.open);
    onClick?.(event);
  };

  type AsChildProps = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    [key: string]: unknown;
  };

  const triggerA11y = {
    id: props.id ?? context.triggerId,
    "aria-expanded": context.open,
    "aria-haspopup": "menu" as const,
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
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    OverlayPositionProps { }

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ align = "start", alignOffset = 0, className, id, onKeyDown, side = "bottom", sideOffset = 0, style, ...props }, ref) => {
  const context = useDropdownMenuContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={id ?? context.contentId}
      role="menu"
      aria-labelledby={context.triggerId}
      tabIndex={-1}
      data-side={side}
      data-align={align}
      className={cn(
        "absolute z-50 min-w-56 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
        overlayPositionClasses(side, align),
        className,
      )}
      style={{ ...overlayPositionStyle(side, sideOffset, alignOffset), ...style }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleMenuArrowKeys(event);
      }}
      {...props}
    />
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> { }

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

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("my-1 h-px bg-[color:var(--sx-color-border)]", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, className, onClick, type = "button", ...props }, ref) => {
    const context = useDropdownMenuContext();

    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-start text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
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

export interface DropdownMenuSubProps
  extends React.HTMLAttributes<HTMLDivElement>,
    DropdownMenuSubSharedProps {
  readonly children: React.ReactNode;
}

export function DropdownMenuSub({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: DropdownMenuSubProps) {
  const controller = useDropdownMenuSubController({ defaultOpen, onOpenChange, open });

  return (
    <DropdownMenuSubProvider value={controller}>
      <div data-state={controller.open ? "open" : "closed"} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </DropdownMenuSubProvider>
  );
}

export interface DropdownMenuSubTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuSubTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuSubTriggerProps>(
  ({ children, className, onClick, onKeyDown, onMouseEnter, type = "button", ...props }, ref) => {
    const sub = useDropdownMenuSubContext();

    const focusFirstSubItem = (trigger: HTMLElement | null) => {
      if (!trigger) return;
      const root = trigger.parentElement;
      if (!root) return;
      const menu = root.querySelector<HTMLElement>('[role="menu"]');
      const first = menu?.querySelector<HTMLElement>(
        '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
      );
      first?.focus();
    };

    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        id={props.id ?? sub.triggerId}
        aria-haspopup="menu"
        aria-expanded={sub.open}
        aria-controls={sub.contentId}
        data-state={sub.open ? "open" : "closed"}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-start text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
          className,
        )}
        onClick={(event) => {
          const trigger = event.currentTarget;
          onClick?.(event);
          if (event.defaultPrevented) return;
          sub.setOpen(!sub.open);
          if (!sub.open) {
            requestAnimationFrame(() => focusFirstSubItem(trigger));
          }
        }}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          if (event.defaultPrevented) return;
          if (!sub.open) {
            sub.setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          const trigger = event.currentTarget;
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            if (!sub.open) {
              sub.setOpen(true);
            }
            requestAnimationFrame(() => focusFirstSubItem(trigger));
          } else if (event.key === "ArrowLeft" || event.key === "Escape") {
            if (sub.open) {
              event.preventDefault();
              event.stopPropagation();
              sub.setOpen(false);
            }
          }
        }}
        {...props}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
        <span aria-hidden="true" className="shrink-0 text-[color:var(--sx-color-foreground-muted)]">
          <ChevronRightIcon size={14} />
        </span>
      </button>
    );
  },
);

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ children, className, id, onKeyDown, style, ...props }, ref) => {
    const sub = useDropdownMenuSubContext();

    if (!sub.open) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={id ?? sub.contentId}
        role="menu"
        aria-labelledby={sub.triggerId}
        tabIndex={-1}
        data-state="open"
        data-side="right"
        className={cn(
          "absolute left-full top-0 z-50 ml-1 min-w-44 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
          className,
        )}
        style={style}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            try {
              (event.nativeEvent as Event).stopImmediatePropagation?.();
            } catch {
              // ignore
            }
            sub.setOpen(false);
            document.getElementById(sub.triggerId)?.focus();
            return;
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            event.stopPropagation();
            sub.setOpen(false);
            document.getElementById(sub.triggerId)?.focus();
            return;
          }
          handleMenuArrowKeys(event);
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export interface DropdownMenuCheckboxItemProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "checked" | "defaultChecked" | "onChange"
    >,
    DropdownMenuCheckboxItemSharedProps {}

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuCheckboxItemProps
>(
  (
    { children, checked, className, defaultChecked = false, disabled, onCheckedChange, onClick, type = "button", ...props },
    ref,
  ) => {
    const [currentChecked, setCurrentChecked] = useControllableState<boolean>({
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
      value: checked,
    });

    return (
      <button
        ref={ref}
        type={type}
        role="menuitemcheckbox"
        aria-checked={currentChecked}
        data-state={currentChecked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-start text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)] disabled:pointer-events-none disabled:opacity-45",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          setCurrentChecked(!currentChecked);
        }}
        {...props}
      >
        <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center">
          {currentChecked ? <CheckIcon size={14} strokeWidth={2.4} /> : null}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
      </button>
    );
  },
);

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export interface DropdownMenuRadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">,
    DropdownMenuRadioGroupSharedProps {}

export function DropdownMenuRadioGroup({
  children,
  defaultValue,
  onValueChange,
  value,
  ...props
}: DropdownMenuRadioGroupProps) {
  const controller = useDropdownMenuRadioGroupController({ defaultValue, onValueChange, value });

  return (
    <DropdownMenuRadioGroupProvider value={controller}>
      <div role="group" {...props}>
        {children}
      </div>
    </DropdownMenuRadioGroupProvider>
  );
}

export interface DropdownMenuRadioItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">,
    DropdownMenuRadioItemSharedProps {}

export const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  ({ children, className, onClick, value, type = "button", ...props }, ref) => {
    const group = useOptionalDropdownMenuRadioGroupContext();
    const checked = group ? group.value === value : false;

    return (
      <button
        ref={ref}
        type={type}
        role="menuitemradio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-start text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          group?.onValueChange(value);
        }}
        {...props}
      >
        <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center">
          {checked ? (
            <span className="block size-2 rounded-full bg-[color:var(--sx-color-foreground)]" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
      </button>
    );
  },
);

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export interface DropdownMenuArrowProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuArrow = React.forwardRef<HTMLDivElement, DropdownMenuArrowProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden={true}
      data-slot="dropdown-menu-arrow"
      className={cn(
        "size-2 rotate-45 border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]",
        className,
      )}
      {...props}
    />
  ),
);

DropdownMenuArrow.displayName = "DropdownMenuArrow";
