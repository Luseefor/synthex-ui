import * as React from "react";
import { cn } from "../_shared/variants";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
import type { PaginationLinkSharedProps } from "./pagination.shared";

export const Pagination = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Pagination"
      className={cn("flex w-full justify-center", className)}
      {...props}
    />
  ),
);

Pagination.displayName = "Pagination";

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-2", className)}
    {...props}
  />
));

PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
));

PaginationItem.displayName = "PaginationItem";

export interface PaginationLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    PaginationLinkSharedProps {}

export const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--sx-radius-md)] border px-3 text-sm font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]",
        isActive
          ? "border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[0_8px_20px_rgba(29,78,216,0.18)]"
          : "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] hover:border-[color:var(--sx-color-border-strong)] hover:bg-[color:var(--sx-color-surface-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children = "Previous", className, ...props }, ref) => (
  <PaginationLink ref={ref} className={cn("gap-2 pl-3.5 pr-4", className)} {...props}>
    <ChevronLeftIcon size={16} />
    {children}
  </PaginationLink>
));

PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children = "Next", className, ...props }, ref) => (
  <PaginationLink ref={ref} className={cn("gap-2 pl-4 pr-3.5", className)} {...props}>
    {children}
    <ChevronRightIcon size={16} />
  </PaginationLink>
));

PaginationNext.displayName = "PaginationNext";

export function PaginationEllipsis({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center text-sm text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    >
      ...
    </span>
  );
}
