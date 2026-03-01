import * as React from "react";
import { cn } from "../_shared/variants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuTriggerProps,
} from "../dropdown-menu/dropdown-menu.web";

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menubar"
      className={cn(
        "inline-flex items-center gap-1 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-1",
        className,
      )}
      {...props}
    />
  ),
);

Menubar.displayName = "Menubar";

export function MenubarMenu(props: DropdownMenuProps) {
  return <DropdownMenu {...props} />;
}

export const MenubarTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuTrigger
      ref={ref}
      className={cn(
        "inline-flex min-w-[6rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] transition-[background-color,color,box-shadow] duration-150 hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]",
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
