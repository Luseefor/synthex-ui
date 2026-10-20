import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { cn } from "../_shared/variants";
import { CheckIcon, ChevronRightIcon } from "../icons/index.web";
import type {
  MenubarSharedProps,
  MenubarSubSharedProps,
} from "./menubar.shared";

export interface MenubarProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>,
    MenubarSharedProps {}

export const Menubar = React.forwardRef<HTMLElement, MenubarProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Root
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="menubar"
      role="menubar"
      aria-orientation="horizontal"
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-1",
        className,
      )}
      {...props}
    />
  ),
);

Menubar.displayName = "Menubar";

export interface MenubarMenuProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Menu> {
  // Radix Menubar.Menu only supports `value`; open state is derived from the
  // parent Menubar `value`. `defaultOpen`/`open`/`onOpenChange` are
  // intentionally omitted (use Menubar Root `value`/`defaultValue` instead).
}

export function MenubarMenu({ children, value, ...props }: MenubarMenuProps) {
  return (
    <MenubarPrimitive.Menu data-slot="menubar-menu" value={value} {...props}>
      {children}
    </MenubarPrimitive.Menu>
  );
}

export interface MenubarTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn(
        "inline-flex min-w-[6rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] outline-none hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)] focus:bg-[color:var(--sx-color-surface)] focus:text-[color:var(--sx-color-foreground)] data-[state=open]:bg-[color:var(--sx-color-surface)] data-[state=open]:text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);

MenubarTrigger.displayName = "MenubarTrigger";

export interface MenubarContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {}

export const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ align = "start", alignOffset = 0, className, side = "bottom", sideOffset = 8, ...props }, ref) => (
    <MenubarPrimitive.Portal data-slot="menubar-portal">
      <MenubarPrimitive.Content
        ref={ref}
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-52 overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
);

MenubarContent.displayName = "MenubarContent";

export interface MenubarItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {}

export const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    />
  ),
);

MenubarItem.displayName = "MenubarItem";

export interface MenubarLabelProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> {}

export const MenubarLabel = React.forwardRef<HTMLDivElement, MenubarLabelProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Label
      ref={ref}
      data-slot="menubar-label"
      className={cn(
        "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

MenubarLabel.displayName = "MenubarLabel";

export interface MenubarSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator> {}

export const MenubarSeparator = React.forwardRef<HTMLDivElement, MenubarSeparatorProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Separator
      ref={ref}
      data-slot="menubar-separator"
      className={cn("my-1 h-px bg-[color:var(--sx-color-border)]", className)}
      {...props}
    />
  ),
);

MenubarSeparator.displayName = "MenubarSeparator";

export interface MenubarSubProps extends MenubarSubSharedProps {
  readonly children: React.ReactNode;
}

export function MenubarSub({ children, defaultOpen, onOpenChange, open }: MenubarSubProps) {
  return (
    <MenubarPrimitive.Sub
      data-slot="menubar-sub"
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </MenubarPrimitive.Sub>
  );
}

export interface MenubarSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> {}

export const MenubarSubTrigger = React.forwardRef<HTMLDivElement, MenubarSubTriggerProps>(
  ({ children, className, ...props }, ref) => (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
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
    </MenubarPrimitive.SubTrigger>
  ),
);

MenubarSubTrigger.displayName = "MenubarSubTrigger";

export interface MenubarSubContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent> {}

export const MenubarSubContent = React.forwardRef<HTMLDivElement, MenubarSubContentProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Portal data-slot="menubar-sub-portal">
      <MenubarPrimitive.SubContent
        ref={ref}
        data-slot="menubar-sub-content"
        className={cn(
          "z-50 min-w-44 overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
);

MenubarSubContent.displayName = "MenubarSubContent";

export interface MenubarCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> {}

export const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, MenubarCheckboxItemProps>(
  ({ children, className, checked, defaultChecked, onSelect, ...props }, ref) => (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
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
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon size={14} strokeWidth={2.4} />
        </MenubarPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </MenubarPrimitive.CheckboxItem>
  ),
);

MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export interface MenubarRadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioGroup> {}

export function MenubarRadioGroup({ ...props }: MenubarRadioGroupProps) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

export interface MenubarRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> {}

export const MenubarRadioItem = React.forwardRef<HTMLDivElement, MenubarRadioItemProps>(
  ({ children, className, onSelect, ...props }, ref) => (
    <MenubarPrimitive.RadioItem
      ref={ref}
      data-slot="menubar-radio-item"
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
        <MenubarPrimitive.ItemIndicator>
          <span className="block size-2 rounded-full bg-[color:var(--sx-color-foreground)]" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </MenubarPrimitive.RadioItem>
  ),
);

MenubarRadioItem.displayName = "MenubarRadioItem";

export interface MenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const MenubarShortcut = React.forwardRef<HTMLSpanElement, MenubarShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

MenubarShortcut.displayName = "MenubarShortcut";

export interface MenubarArrowProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Arrow> {}

export const MenubarArrow = React.forwardRef<SVGSVGElement, MenubarArrowProps>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Arrow
      ref={ref}
      data-slot="menubar-arrow"
      aria-hidden="true"
      className={cn(
        "fill-[color:var(--sx-color-surface)] stroke-[color:var(--sx-color-border)]",
        className,
      )}
      {...props}
    />
  ),
);

MenubarArrow.displayName = "MenubarArrow";
