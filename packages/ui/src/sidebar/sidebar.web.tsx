import * as React from "react";
import { Sheet, SheetClose } from "../sheet/sheet.web";
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
        <Sheet open={open} onOpenChange={setOpen}>
          <div
            ref={ref}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[18rem] flex-col border-r border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-lg transition-transform",
              open ? "translate-x-0" : "-translate-x-full",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </Sheet>
      );
    }

    return (
      <aside
        ref={ref}
        className={cn(
          "group/sidebar sticky top-0 z-10 flex h-svh flex-col border-r border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] transition-[width] duration-200 ease-linear",
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
        "text-[0.7rem] font-medium uppercase tracking-tight text-[color:var(--sx-color-foreground-muted)] transition-[opacity,height,padding] duration-200",
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
          "flex min-h-8 w-full items-center gap-2 overflow-hidden rounded-[var(--sx-radius-md)] py-1.5 text-left text-sm transition-[background-color,color,padding] duration-200",
          active
            ? "bg-[color:var(--sx-color-accent)] text-[color:var(--sx-color-foreground)] font-medium"
            : "text-[color:var(--sx-color-foreground-muted)] font-normal hover:bg-[color:var(--sx-color-accent)] hover:text-[color:var(--sx-color-foreground)]",
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
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-[color:var(--sx-color-background)]",
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
      aria-hidden="true"
      className={cn("mx-auto h-10 w-1 rounded-full bg-[color:var(--sx-color-border)]", className)}
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
        aria-label="Toggle Sidebar"
        data-sidebar="trigger"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[var(--sx-radius-md)] text-[color:var(--sx-color-foreground-muted)] transition-colors hover:bg-[color:var(--sx-color-accent)] hover:text-[color:var(--sx-color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]",
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
