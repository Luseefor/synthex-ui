import * as React from "react";
import { cn } from "../_shared/variants";
import type { BreadcrumbLinkSharedProps } from "./breadcrumb.shared";

export const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={cn("w-full", className)} {...props} aria-label={props["aria-label"] ?? "Breadcrumb"} />
  ),
);

Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-2 text-sm text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-2", className)} {...props} />
  ),
);

BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    BreadcrumbLinkSharedProps {}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, current = false, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={current ? "page" : undefined}
      className={cn(
        "transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-foreground)]",
        current && "font-medium text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);

BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn("font-medium text-[color:var(--sx-color-foreground)]", className)}
      {...props}
    />
  ),
);

BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children = "›", className, ...props }, ref) => (
    <span ref={ref} aria-hidden="true" className={cn("text-[color:var(--sx-color-foreground-muted)]", className)} {...props}>
      {children}
    </span>
  ),
);

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} aria-hidden="true" className={cn("font-medium text-[color:var(--sx-color-foreground-muted)]", className)} {...props}>
      …
    </span>
  ),
);

BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
