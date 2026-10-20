import * as React from "react";
import { cn } from "../_shared/variants";
import {
  DropdownMenu,
  DropdownMenuArrow as BaseMenuArrow,
  DropdownMenuCheckboxItem as BaseMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup as BaseMenuRadioGroup,
  DropdownMenuRadioItem as BaseMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut as BaseMenuShortcut,
  DropdownMenuSub as BaseMenuSub,
  DropdownMenuSubContent as BaseMenuSubContent,
  DropdownMenuSubTrigger as BaseMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuArrowProps as BaseMenuArrowProps,
  type DropdownMenuCheckboxItemProps as BaseMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  type DropdownMenuRadioGroupProps as BaseMenuRadioGroupProps,
  type DropdownMenuRadioItemProps as BaseMenuRadioItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuShortcutProps as BaseMenuShortcutProps,
  type DropdownMenuSubContentProps as BaseMenuSubContentProps,
  type DropdownMenuSubProps as BaseMenuSubProps,
  type DropdownMenuSubTriggerProps as BaseMenuSubTriggerProps,
  type DropdownMenuTriggerProps,
} from "../dropdown-menu/dropdown-menu.web";

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

function focusSiblingTrigger(current: HTMLElement, direction: 1 | -1): void {
  const root = current.closest('[role="menubar"]');
  if (!root) return;
  const triggers = Array.from(
    root.querySelectorAll<HTMLElement>('button[aria-haspopup="menu"]:not([disabled])'),
  );
  const index = triggers.indexOf(current);
  if (index === -1 || triggers.length === 0) return;
  const next = triggers[(index + direction + triggers.length) % triggers.length];
  next?.focus();
}

export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, onKeyDown, ...props }, ref) => (
    <div
      ref={ref}
      role="menubar"
      aria-orientation="horizontal"
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-1",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const target = event.target as HTMLElement | null;
        if (!target || target.getAttribute("aria-haspopup") !== "menu") return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          focusSiblingTrigger(target, 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          focusSiblingTrigger(target, -1);
        } else if (event.key === "Home") {
          event.preventDefault();
          const root = target.closest('[role="menubar"]');
          const first = root?.querySelector<HTMLElement>('button[aria-haspopup="menu"]:not([disabled])');
          first?.focus();
        } else if (event.key === "End") {
          event.preventDefault();
          const root = target.closest('[role="menubar"]');
          const triggers = root?.querySelectorAll<HTMLElement>('button[aria-haspopup="menu"]:not([disabled])');
          const last = triggers?.[triggers.length - 1];
          last?.focus();
        }
      }}
      {...props}
    />
  ),
);

Menubar.displayName = "Menubar";

export function MenubarMenu({ children, defaultOpen, onOpenChange, open, ...props }: DropdownMenuProps) {
  return (
    <DropdownMenu defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open} {...props}>
      {children}
    </DropdownMenu>
  );
}

export const MenubarTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuTrigger
      ref={ref}
      className={cn(
        "inline-flex min-w-[6rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);

MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuContent ref={ref} className={cn("min-w-52", className)} {...props} />
  ),
);

MenubarContent.displayName = "MenubarContent";

export const MenubarItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, ...props }, ref) => <DropdownMenuItem ref={ref} className={className} {...props} />,
);

MenubarItem.displayName = "MenubarItem";

export const MenubarLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => <DropdownMenuLabel ref={ref} className={className} {...props} />,
);

MenubarLabel.displayName = "MenubarLabel";

export const MenubarSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuSeparator ref={ref} className={className} {...props} />
  ),
);

MenubarSeparator.displayName = "MenubarSeparator";

export type MenubarSubProps = BaseMenuSubProps;
export function MenubarSub(props: MenubarSubProps) {
  return <BaseMenuSub {...props} />;
}

export type MenubarSubTriggerProps = BaseMenuSubTriggerProps;
export const MenubarSubTrigger = React.forwardRef<HTMLButtonElement, MenubarSubTriggerProps>(
  (props, ref) => <BaseMenuSubTrigger ref={ref} {...props} />,
);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

export type MenubarSubContentProps = BaseMenuSubContentProps;
export const MenubarSubContent = React.forwardRef<HTMLDivElement, MenubarSubContentProps>(
  (props, ref) => <BaseMenuSubContent ref={ref} {...props} />,
);
MenubarSubContent.displayName = "MenubarSubContent";

export type MenubarCheckboxItemProps = BaseMenuCheckboxItemProps;
export const MenubarCheckboxItem = React.forwardRef<HTMLButtonElement, MenubarCheckboxItemProps>(
  (props, ref) => <BaseMenuCheckboxItem ref={ref} {...props} />,
);
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export type MenubarRadioGroupProps = BaseMenuRadioGroupProps;
export function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return <BaseMenuRadioGroup {...props} />;
}

export type MenubarRadioItemProps = BaseMenuRadioItemProps;
export const MenubarRadioItem = React.forwardRef<HTMLButtonElement, MenubarRadioItemProps>(
  (props, ref) => <BaseMenuRadioItem ref={ref} {...props} />,
);
MenubarRadioItem.displayName = "MenubarRadioItem";

export type MenubarShortcutProps = BaseMenuShortcutProps;
export const MenubarShortcut = React.forwardRef<HTMLSpanElement, MenubarShortcutProps>(
  (props, ref) => <BaseMenuShortcut ref={ref} {...props} />,
);
MenubarShortcut.displayName = "MenubarShortcut";

export type MenubarArrowProps = BaseMenuArrowProps;
export const MenubarArrow = React.forwardRef<HTMLDivElement, MenubarArrowProps>(
  (props, ref) => <BaseMenuArrow ref={ref} {...props} />,
);
MenubarArrow.displayName = "MenubarArrow";
