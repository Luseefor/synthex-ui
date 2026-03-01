import * as React from "react";
import { cn } from "../_shared/variants";
import type {
  SidebarContextValue,
  SidebarMenuButtonSharedProps,
  SidebarProviderSharedProps,
  SidebarSharedProps,
  SidebarTriggerSharedProps,
} from "./sidebar.shared";

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be wrapped in SidebarProvider.");
  }

  return context;
}

export interface SidebarProviderProps extends SidebarProviderSharedProps {}
export interface SidebarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    SidebarSharedProps {}
export interface SidebarInsetProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    SidebarSharedProps {}
export interface SidebarMenuButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    SidebarMenuButtonSharedProps {}
export interface SidebarTriggerProps extends SidebarTriggerSharedProps {}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((current) => !current),
    }),
    [open],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useSidebarContext();
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, className, ...props }, ref) => {
    const { open } = useSidebarContext();

    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-full flex-col rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] transition-[width] duration-200",
          open ? "w-72" : "w-20",
          className,
        )}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </aside>
    );
  },
);

Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b border-[color:var(--sx-color-border)] px-4 py-4", className)}
      {...props}
    />
  ),
);

SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-t border-[color:var(--sx-color-border)] px-4 py-4", className)}
      {...props}
    />
  ),
);

SidebarFooter.displayName = "SidebarFooter";

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto px-3 py-4", className)} {...props} />
  ),
);

SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4 flex flex-col gap-2", className)} {...props} />
  ),
);

SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
));

SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex list-none flex-col gap-1 p-0", className)} {...props} />
  ),
);

SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("list-none", className)} {...props} />,
);

SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ active, children, className, ...props }, ref) => {
    const { open } = useSidebarContext();

    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm font-medium transition-colors",
          active
            ? "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-foreground)]"
            : "text-[color:var(--sx-color-foreground-muted)] hover:bg-[color:var(--sx-color-surface-muted)] hover:text-[color:var(--sx-color-foreground)]",
          !open && "justify-center px-0",
          className,
        )}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  },
);

SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("min-w-0 flex-1 rounded-[calc(var(--sx-radius-lg)+2px)] bg-[color:var(--sx-color-surface-muted)]", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

SidebarInset.displayName = "SidebarInset";

export const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("mx-auto h-10 w-1 rounded-full bg-[color:var(--sx-color-border)]", className)}
      {...props}
    />
  ),
);

SidebarRail.displayName = "SidebarRail";

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ children = "Toggle sidebar", className, ...props }, ref) => {
    const { toggle } = useSidebarContext();

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground)]",
          className,
        )}
        onClick={(event) => {
          props.onClick?.(event);

          if (!event.defaultPrevented) {
            toggle();
          }
        }}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  },
);

SidebarTrigger.displayName = "SidebarTrigger";
