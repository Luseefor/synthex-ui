import * as React from "react";
import { useMobile } from "../hooks/useMobile.web";
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
    const { open, setOpen } = useSidebarContext();
    const isMobile = useMobile();

    if (isMobile) {
      return (
        <>
          <div
            aria-hidden={!open}
            className={cn(
              "fixed inset-0 z-40 bg-[rgba(15,23,42,0.42)] backdrop-blur-sm transition-opacity duration-200",
              open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={() => setOpen(false)}
          />
          <div
            ref={ref}
            data-slot="sidebar"
            data-state={open ? "open" : "closed"}
            className={cn(
              "bg-card border-border fixed inset-y-0 start-0 z-50 flex h-[100dvh] w-[min(18rem,calc(100vw-1.5rem))] flex-col border-e shadow-[0_20px_48px_rgba(15,23,42,0.28)] transition-transform duration-200",
              open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </>
      );
    }

    return (
      <aside
        ref={ref}
        data-slot="sidebar"
        className={cn(
          "bg-card border-border group/sidebar sticky top-0 z-10 flex h-svh flex-col border-e transition-[width] duration-200 ease-linear",
          open ? "w-[16rem]" : "w-[3rem]",
          className
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
        data-slot="sidebar-header"
        className={cn(
          "border-border border-b py-4 transition-[padding] duration-200",
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
        data-slot="sidebar-footer"
        className={cn(
          "border-border border-t py-4 transition-[padding] duration-200",
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
        data-slot="sidebar-content"
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto py-2 transition-[padding] duration-200",
          open ? "px-2" : "px-2",
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
    <div ref={ref} data-slot="sidebar-group" className={cn("mb-4 flex flex-col gap-2", className)} {...props} />
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
      data-slot="sidebar-group-label"
      className={cn(
        "text-muted-foreground text-[0.7rem] font-medium uppercase tracking-tight transition-[opacity,height,padding] duration-200",
        open ? "h-auto px-2 opacity-100" : "h-0 overflow-hidden px-0 opacity-0",
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
  <div ref={ref} data-slot="sidebar-group-content" className={cn("flex flex-col gap-1", className)} {...props} />
));

SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} data-slot="sidebar-menu" className={cn("flex list-none flex-col gap-1 p-0", className)} {...props} />
  ),
);

SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} data-slot="sidebar-menu-item" className={cn("list-none", className)} {...props} />,
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
        data-slot="sidebar-menu-button"
        aria-label={props["aria-label"] ?? (!open ? stringChildren ?? undefined : undefined)}
        className={cn(
          "flex min-h-8 w-full items-center gap-2 overflow-hidden rounded-md py-1.5 text-start text-sm transition-[background-color,color,padding] duration-200",
          active
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground font-normal hover:bg-accent hover:text-accent-foreground",
          open ? "px-2" : "justify-center px-0",
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
    <main
      ref={ref}
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex min-h-svh flex-1 flex-col",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  ),
);

SidebarInset.displayName = "SidebarInset";

export const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-rail"
      aria-hidden="true"
      className={cn("bg-border mx-auto h-10 w-1 rounded-full", className)}
      {...props}
    />
  ),
);

SidebarRail.displayName = "SidebarRail";

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const { toggle } = useSidebarContext();

    return (
      <button
        ref={ref}
        data-slot="sidebar-trigger"
        aria-label="Toggle Sidebar"
        data-sidebar="trigger"
        className={cn(
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2",
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
        type="button"
        {...props}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
        </svg>
      </button>
    );
  }
);

SidebarTrigger.displayName = "SidebarTrigger";
