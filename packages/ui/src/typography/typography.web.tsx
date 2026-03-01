import * as React from "react";
import { cn } from "../_shared/variants";

export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "text-4xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground)] md:text-5xl",
        className,
      )}
      {...props}
    />
  ),
);

H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-3xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);

H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold tracking-[-0.025em] text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);

H3.displayName = "H3";

export const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-lg leading-8 text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

Lead.displayName = "Lead";

export const Muted = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  />
));

Muted.displayName = "Muted";

export const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref as React.Ref<HTMLElement>}
      className={cn(
        "text-xs font-medium leading-none text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  ),
);

Small.displayName = "Small";
