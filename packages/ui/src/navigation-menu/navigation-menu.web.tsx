import * as React from "react";
import { cn } from "../_shared/variants";
import {
  NavigationMenuItemProvider,
  NavigationMenuProvider,
  useNavigationMenuContext,
  useNavigationMenuController,
  useNavigationMenuItemContext,
  type NavigationMenuItemSharedProps,
  type NavigationMenuSharedProps,
} from "./navigation-menu.shared";

export interface NavigationMenuProps
  extends Omit<
      React.HTMLAttributes<HTMLElement>,
      "defaultValue" | "onChange" | "value"
    >,
    NavigationMenuSharedProps {}

export function NavigationMenu({
  children,
  className,
  defaultValue,
  onValueChange,
  value,
  ...props
}: NavigationMenuProps) {
  const controller = useNavigationMenuController({ defaultValue, onValueChange, value });

  return (
    <NavigationMenuProvider value={controller}>
      <nav className={cn("flex flex-col gap-4", className)} {...props}>
        {children}
      </nav>
    </NavigationMenuProvider>
  );
}

export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavigationMenuList = React.forwardRef<HTMLDivElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
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
  extends React.HTMLAttributes<HTMLDivElement>,
    NavigationMenuItemSharedProps {}

export const NavigationMenuItem = React.forwardRef<HTMLDivElement, NavigationMenuItemProps>(
  ({ children, className, value, ...props }, ref) => (
    <NavigationMenuItemProvider value={{ value }}>
      <div ref={ref} className={cn("contents", className)} {...props}>
        {children}
      </div>
    </NavigationMenuItemProvider>
  ),
);

NavigationMenuItem.displayName = "NavigationMenuItem";

export const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, type = "button", ...props }, ref) => {
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const isActive = context.value === item.value;

  return (
    <button
      ref={ref}
      type={type}
      aria-expanded={isActive}
      className={cn(
        "inline-flex min-w-[7rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]",
        isActive
          ? "bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
          : "text-[color:var(--sx-color-foreground-muted)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]",
        className,
      )}
      onClick={(event) => {
        context.setValue(context.value === item.value ? "" : item.value);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "inline-flex min-w-[7rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

NavigationMenuLink.displayName = "NavigationMenuLink";

export const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const item = useNavigationMenuItemContext();
  const isActive = context.value === item.value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

NavigationMenuContent.displayName = "NavigationMenuContent";
