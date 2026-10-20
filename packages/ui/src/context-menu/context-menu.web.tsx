import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "../_shared/variants";
import { CheckIcon, ChevronRightIcon } from "../icons/index.web";
import type {
  ContextMenuSharedProps,
  ContextMenuSubSharedProps,
} from "./context-menu.shared";

export interface ContextMenuProps extends ContextMenuSharedProps {
  readonly children: React.ReactNode;
  readonly dir?: "ltr" | "rtl";
  readonly modal?: boolean;
}

export function ContextMenu({ children, defaultOpen, dir, modal, onOpenChange, open }: ContextMenuProps) {
  // Radix ContextMenu Root has no `defaultOpen`; emulate uncontrolled initial
  // state for compat while staying controlled when `open` is provided.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;

  return (
    <ContextMenuPrimitive.Root
      data-slot="context-menu"
      dir={dir}
      modal={modal}
      onOpenChange={(next) => {
        if (!isControlled) {
          setUncontrolledOpen(next);
        }
        onOpenChange?.(next);
      }}
      open={isControlled ? open : uncontrolledOpen}
    >
      {children}
    </ContextMenuPrimitive.Root>
  );
}

export interface ContextMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const ContextMenuTrigger = React.forwardRef<HTMLSpanElement, ContextMenuTriggerProps>(
  (props, ref) => (
    <ContextMenuPrimitive.Trigger ref={ref} data-slot="context-menu-trigger" {...props} />
  ),
);

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export interface ContextMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> {
  readonly align?: "start" | "center" | "end";
  readonly alignOffset?: number;
  readonly side?: "top" | "right" | "bottom" | "left";
  readonly sideOffset?: number;
}

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  (
    {
      align = "start",
      alignOffset = 0,
      className,
      side,
      sideOffset = 8,
      ...props
    },
    ref,
  ) => {
    // `align`/`side` are forwarded to Radix (MenuContent supports them);
    // context menus are cursor-anchored so placement is best-effort.
    return (
      <ContextMenuPrimitive.Portal data-slot="context-menu-portal">
        <ContextMenuPrimitive.Content
          ref={ref}
          data-slot="context-menu-content"
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "z-[90] min-w-56 overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.16)] data-[state=open]:animate-in data-[state=open]:fade-in-0",
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Portal>
    );
  },
);

ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuLabelProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> {}

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Label
      ref={ref}
      data-slot="context-menu-label"
      className={cn(
        "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

ContextMenuLabel.displayName = "ContextMenuLabel";

export interface ContextMenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator> {}

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Separator
      ref={ref}
      data-slot="context-menu-separator"
      className={cn("my-1 h-px bg-[color:var(--sx-color-border)]", className)}
      {...props}
    />
  ),
);

ContextMenuSeparator.displayName = "ContextMenuSeparator";

export interface ContextMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {}

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-slot="context-menu-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] outline-none transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    />
  ),
);

ContextMenuItem.displayName = "ContextMenuItem";

export interface ContextMenuSubProps extends ContextMenuSubSharedProps {
  readonly children: React.ReactNode;
}

export function ContextMenuSub({ children, defaultOpen, onOpenChange, open }: ContextMenuSubProps) {
  return (
    <ContextMenuPrimitive.Sub
      data-slot="context-menu-sub"
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </ContextMenuPrimitive.Sub>
  );
}

export interface ContextMenuSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> {}

export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ children, className, ...props }, ref) => (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      className={cn(
        "flex w-full cursor-default select-none items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[state=open]:bg-[color:var(--sx-color-surface-muted)]",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
      <span aria-hidden="true" className="shrink-0 text-[color:var(--sx-color-foreground-muted)]">
        <ChevronRightIcon size={14} />
      </span>
    </ContextMenuPrimitive.SubTrigger>
  ),
);

ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export interface ContextMenuSubContentProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> {}

export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Portal data-slot="context-menu-sub-portal">
      <ContextMenuPrimitive.SubContent
        ref={ref}
        data-slot="context-menu-sub-content"
        className={cn(
          "z-50 min-w-44 overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  ),
);

ContextMenuSubContent.displayName = "ContextMenuSubContent";

export interface ContextMenuCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> {}

export const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
  ({ children, className, checked, defaultChecked, onSelect, ...props }, ref) => (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="context-menu-checkbox-item"
      checked={checked}
      defaultChecked={checked === undefined && defaultChecked === undefined ? false : defaultChecked}
      onSelect={(event) => {
        event.preventDefault();
        onSelect?.(event);
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon size={14} strokeWidth={2.4} />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </ContextMenuPrimitive.CheckboxItem>
  ),
);

ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export interface ContextMenuRadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioGroup> {}

export function ContextMenuRadioGroup({ ...props }: ContextMenuRadioGroupProps) {
  return (
    <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
  );
}

export interface ContextMenuRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem> {}

export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ children, className, onSelect, ...props }, ref) => (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      data-slot="context-menu-radio-item"
      onSelect={(event) => {
        event.preventDefault();
        onSelect?.(event);
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <span className="block size-2 rounded-full bg-[color:var(--sx-color-foreground)]" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </ContextMenuPrimitive.RadioItem>
  ),
);

ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const ContextMenuShortcut = React.forwardRef<HTMLSpanElement, ContextMenuShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

ContextMenuShortcut.displayName = "ContextMenuShortcut";

export interface ContextMenuArrowProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Arrow> {}

export const ContextMenuArrow = React.forwardRef<SVGSVGElement, ContextMenuArrowProps>(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Arrow
      ref={ref}
      data-slot="context-menu-arrow"
      aria-hidden="true"
      className={cn(
        "fill-[color:var(--sx-color-surface)] stroke-[color:var(--sx-color-border)]",
        className,
      )}
      {...props}
    />
  ),
);

ContextMenuArrow.displayName = "ContextMenuArrow";
