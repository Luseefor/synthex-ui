import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "../_shared/variants";

export interface NavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {}

export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  (
    {
      children,
      className,
      defaultValue,
      delayDuration,
      onValueChange,
      orientation,
      skipDelayDuration,
      value,
      ...props
    },
    ref,
  ) => (
    <NavigationMenuPrimitive.Root
      ref={ref as React.Ref<HTMLElement>}
      data-slot="navigation-menu"
      defaultValue={defaultValue}
      delayDuration={delayDuration}
      onValueChange={onValueChange}
      orientation={orientation}
      skipDelayDuration={skipDelayDuration}
      value={value}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  ),
);

NavigationMenu.displayName = "NavigationMenu";

export interface NavigationMenuListProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> {}

export const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List
      ref={ref}
      data-slot="navigation-menu-list"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-2",
        className,
      )}
      {...props}
    />
  ),
);

NavigationMenuList.displayName = "NavigationMenuList";

export interface NavigationMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item> {}

export const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ className, value, ...props }, ref) => (
    <NavigationMenuPrimitive.Item
      ref={ref}
      data-slot="navigation-menu-item"
      value={value}
      className={cn("contents", className)}
      {...props}
    />
  ),
);

NavigationMenuItem.displayName = "NavigationMenuItem";

export interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      data-slot="navigation-menu-trigger"
      className={cn(
        "inline-flex min-w-[7rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium outline-none transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] text-[color:var(--sx-color-foreground-muted)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)] data-[state=open]:bg-[color:var(--sx-color-surface)] data-[state=open]:text-[color:var(--sx-color-foreground)] data-[state=open]:shadow-[0_8px_18px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  ),
);

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export interface NavigationMenuLinkProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link> {
  readonly asChild?: boolean;
}

export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Link
      ref={ref}
      data-slot="navigation-menu-link"
      className={cn(
        "inline-flex min-w-[7rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] outline-none transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)] focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] data-[active]:bg-[color:var(--sx-color-surface)] data-[active]:text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);

NavigationMenuLink.displayName = "NavigationMenuLink";

export interface NavigationMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> {}

export const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      data-slot="navigation-menu-content"
      className={cn(
        "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)] data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  ),
);

NavigationMenuContent.displayName = "NavigationMenuContent";

export interface NavigationMenuViewportProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {}

export const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      data-slot="navigation-menu-viewport"
      data-viewport="navigation-menu"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  ),
);

NavigationMenuViewport.displayName = "NavigationMenuViewport";
