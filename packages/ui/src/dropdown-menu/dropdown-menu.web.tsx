import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../_shared/variants";
import { CheckIcon, ChevronRightIcon } from "../icons/index.web";
import type {
  DropdownMenuSharedProps,
  DropdownMenuSubSharedProps,
} from "./dropdown-menu.shared";

export interface DropdownMenuProps extends DropdownMenuSharedProps {
  readonly children: React.ReactNode;
  readonly dir?: "ltr" | "rtl";
  readonly modal?: boolean;
}

export function DropdownMenu({
  children,
  defaultOpen,
  dir,
  modal,
  onOpenChange,
  open,
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root
      data-slot="dropdown-menu"
      defaultOpen={defaultOpen}
      dir={dir}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </DropdownMenuPrimitive.Root>
  );
}

export interface DropdownMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>((props, ref) => (
  <DropdownMenuPrimitive.Trigger ref={ref} data-slot="dropdown-menu-trigger" {...props} />
));

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ align = "start", alignOffset = 0, className, side = "bottom", sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal">
    <DropdownMenuPrimitive.Content
      ref={ref}
      data-slot="dropdown-menu-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-56 overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuLabelProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {}

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
      ref={ref}
      data-slot="dropdown-menu-label"
      className={cn(
        "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {}

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn("my-1 h-px bg-[color:var(--sx-color-border)]", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    />
  ),
);

DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuSubProps extends DropdownMenuSubSharedProps {
  readonly children: React.ReactNode;
}

export function DropdownMenuSub({ children, defaultOpen, onOpenChange, open }: DropdownMenuSubProps) {
  return (
    <DropdownMenuPrimitive.Sub
      data-slot="dropdown-menu-sub"
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </DropdownMenuPrimitive.Sub>
  );
}

export interface DropdownMenuSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {}

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(({ children, className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    data-slot="dropdown-menu-sub-trigger"
    className={cn(
      "flex w-full cursor-default select-none items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[state=open]:bg-[color:var(--sx-color-surface-muted)]",
      className,
    )}
    {...props}
  >
    <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
    <span aria-hidden="true" className="shrink-0 text-[color:var(--sx-color-foreground-muted)]">
      <ChevronRightIcon size={14} />
    </span>
  </DropdownMenuPrimitive.SubTrigger>
));

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export interface DropdownMenuSubContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> {}

export const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubContentProps
>(({ className, onEscapeKeyDown, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-sub-portal">
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      data-slot="dropdown-menu-sub-content"
      onEscapeKeyDown={(event) => {
        event.stopPropagation();
        onEscapeKeyDown?.(event);
      }}
      className={cn(
        "z-50 min-w-44 overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export interface DropdownMenuCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {}

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(({ children, className, defaultChecked, checked, onSelect, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    data-slot="dropdown-menu-checkbox-item"
    checked={checked}
    defaultChecked={checked === undefined && defaultChecked === undefined ? false : defaultChecked}
    onSelect={(event) => {
      event.preventDefault();
      onSelect?.(event);
    }}
    className={cn(
      "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
      className,
    )}
    {...props}
  >
    <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon size={14} strokeWidth={2.4} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className="min-w-0 flex-1">{children}</span>
  </DropdownMenuPrimitive.CheckboxItem>
));

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export interface DropdownMenuRadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioGroup> {}

export function DropdownMenuRadioGroup({ ...props }: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
  );
}

export interface DropdownMenuRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {}

export const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(({ children, className, onSelect, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    data-slot="dropdown-menu-radio-item"
    onSelect={(event) => {
      event.preventDefault();
      onSelect?.(event);
    }}
    className={cn(
      "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
      className,
    )}
    {...props}
  >
    <span aria-hidden="true" className="flex w-4 shrink-0 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <span className="block size-2 rounded-full bg-[color:var(--sx-color-foreground)]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className="min-w-0 flex-1">{children}</span>
  </DropdownMenuPrimitive.RadioItem>
));

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

export interface DropdownMenuArrowProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Arrow> {}

export const DropdownMenuArrow = React.forwardRef<SVGSVGElement, DropdownMenuArrowProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Arrow
      ref={ref}
      data-slot="dropdown-menu-arrow"
      aria-hidden="true"
      className={cn(
        "fill-[color:var(--sx-color-surface)] stroke-[color:var(--sx-color-border)]",
        className,
      )}
      {...props}
    />
  ),
);

DropdownMenuArrow.displayName = "DropdownMenuArrow";
