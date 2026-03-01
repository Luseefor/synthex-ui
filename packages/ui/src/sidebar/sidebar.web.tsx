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

export interface SidebarProviderProps extends SidebarProviderSharedProps { }
export interface SidebarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
  SidebarSharedProps { }
export interface SidebarInsetProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
  SidebarSharedProps { }
export interface SidebarMenuButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
  SidebarMenuButtonSharedProps { }
export interface SidebarTriggerProps extends SidebarTriggerSharedProps { }

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
          "flex h-full shrink-0 flex-col overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] transition-[width] duration-200",
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
  ({ className, ...props }, ref) => {
    const { open } = useSidebarContext();

    return (
      <div
        ref={ref}
        className={cn(
          "border-b border-[color:var(--sx-color-border)] py-4 transition-[padding] duration-200",
          open ? "px-4" : "px-2",
          className,
        )}
        {...props}
      />
    );
  },
);

SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open } = useSidebarContext();

    return (
      <div
        ref={ref}
        className={cn(
          "border-t border-[color:var(--sx-color-border)] py-4 transition-[padding] duration-200",
          open ? "px-4" : "px-2",
          className,
        )}
        {...props}
      />
    );
  },
);

SidebarFooter.displayName = "SidebarFooter";

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open } = useSidebarContext();

    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto py-4 transition-[padding] duration-200",
          open ? "px-3" : "px-2",
          className,
        )}
        {...props}
      />
    );
  },
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
>(({ className, ...props }, ref) => {
  const { open } = useSidebarContext();

  return (
    <div
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)] transition-[opacity,height,padding] duration-200",
        open ? "h-auto px-3 opacity-100" : "h-0 overflow-hidden px-0 opacity-0",
        className,
      )}
      {...props}
    />
  );
});

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
    const stringChildren = typeof children === "string" ? children : null;
    const collapsedGlyph = stringChildren?.trim().charAt(0).toUpperCase() ?? null;

    return (
      <button
        ref={ref}
        aria-label={props["aria-label"] ?? (!open ? stringChildren ?? undefined : undefined)}
        className={cn(
          "flex min-h-10 w-full items-center gap-3 overflow-hidden rounded-[var(--sx-radius-md)] py-2.5 text-left text-sm font-medium transition-[background-color,color,padding] duration-200",
          active
            ? "bg-[color:var(--sx-color-accent)] text-[color:var(--sx-color-foreground)] font-semibold"
            : "text-[color:var(--sx-color-foreground-muted)] hover:bg-[color:var(--sx-color-accent)] hover:text-[color:var(--sx-color-foreground)]",
          open ? "px-3" : "justify-center px-0",
          className,
        )}
        title={props.title ?? (!open ? stringChildren ?? undefined : undefined)}
        type="button"
        {...props}
      >
        {stringChildren ? (
          <>
            <span
              aria-hidden={open}
              className={cn(
                "inline-flex h-7 shrink-0 items-center justify-center rounded-[var(--sx-radius-sm)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-xs font-semibold uppercase tracking-[0.06em] transition-[opacity,transform,width,border-color] duration-200",
                open ? "w-0 scale-95 overflow-hidden border-transparent opacity-0" : "w-7 scale-100 opacity-100",
              )}
            >
              {collapsedGlyph}
            </span>
            <span
              className={cn(
                "truncate transition-[width,opacity] duration-200",
                open ? "w-auto opacity-100" : "w-0 opacity-0",
              )}
            >
              {stringChildren}
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-w-0 flex-1 rounded-[calc(var(--sx-radius-lg)+2px)] bg-[color:var(--sx-color-background-subtle)]",
        className,
      )}
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
    const { open, toggle } = useSidebarContext();
    const stringChildren = typeof children === "string" ? children : null;

    return (
      <button
        ref={ref}
        aria-label={props["aria-label"] ?? (open ? stringChildren ?? undefined : "Expand sidebar")}
        className={cn(
          "inline-flex min-h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-sm font-medium text-[color:var(--sx-color-foreground)] transition-[padding,width] duration-200",
          open ? "w-full px-3 py-2" : "w-full px-0 py-2",
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
        {open ? children : <span aria-hidden="true">{stringChildren ? stringChildren.charAt(0).toUpperCase() : "≡"}</span>}
      </button>
    );
  },
);

SidebarTrigger.displayName = "SidebarTrigger";
