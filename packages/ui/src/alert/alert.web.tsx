import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { alertVariants, type AlertSharedProps } from "./alert.shared";

const alertClassStyles = {
  slots: ["root", "title", "description"] as const,
  base: {
    root:
      "relative w-full rounded-[calc(var(--sx-radius-lg)+2px)] border px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]",
    title:
      "text-sm font-semibold tracking-[-0.02em] text-[color:var(--sx-color-foreground)]",
    description:
      "text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]",
  },
  variants: {
    variant: {
      default: {
        root: "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]",
      },
      destructive: {
        root:
          "border-[color:var(--sx-color-destructive)] bg-[color:var(--sx-color-destructive-muted)]",
        title: "text-[color:var(--sx-color-destructive)]",
      },
      success: {
        root:
          "border-[color:var(--sx-color-accent)] bg-[color:var(--sx-color-accent-muted)]",
        title: "text-[color:var(--sx-color-accent)]",
      },
      warning: {
        root:
          "border-[color:#d97706] bg-[color:rgba(245,158,11,0.14)]",
        title: "text-[color:#b45309]",
      },
    },
  },
} satisfies VariantStyleDefinition<
  typeof alertVariants.variants,
  "root" | "title" | "description",
  string
>;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    AlertSharedProps {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => {
    const slots = resolveVariantStyles(alertVariants, alertClassStyles, { variant });

    return <div ref={ref} role="alert" className={cn(...slots.root, className)} {...props} />;
  },
);

Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & AlertSharedProps
>(({ className, variant, ...props }, ref) => {
  const slots = resolveVariantStyles(alertVariants, alertClassStyles, { variant });

  return <h5 ref={ref} className={cn(...slots.title, className)} {...props} />;
});

AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & AlertSharedProps
>(({ className, variant, ...props }, ref) => {
  const slots = resolveVariantStyles(alertVariants, alertClassStyles, { variant });

  return <p ref={ref} className={cn(...slots.description, className)} {...props} />;
});

AlertDescription.displayName = "AlertDescription";
