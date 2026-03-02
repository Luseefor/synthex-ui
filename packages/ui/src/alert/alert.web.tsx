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
      "relative w-full rounded-[var(--sx-radius-lg)] border p-4 [&>svg~*]:pl-8 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[color:var(--sx-color-foreground)]",
    title:
      "mb-1 text-sm font-semibold leading-none tracking-[-0.01em]",
    description:
      "text-sm leading-relaxed text-[color:var(--sx-color-foreground-muted)] [&_p]:leading-relaxed",
  },
  variants: {
    variant: {
      default: {
        root: "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)]",
        title: "text-[color:var(--sx-color-foreground)]",
      },
      destructive: {
        root:
          "border-[color:var(--sx-color-destructive)]/50 bg-[color:var(--sx-color-destructive-muted)] text-[color:var(--sx-color-destructive)] [&>svg]:text-[color:var(--sx-color-destructive)]",
        title: "text-[color:var(--sx-color-destructive)]",
        description: "text-[color:var(--sx-color-destructive)]/80",
      },
      success: {
        root:
          "border-emerald-500/50 bg-emerald-50 text-emerald-700 [&>svg]:text-emerald-600",
        title: "text-emerald-800",
        description: "text-emerald-700/80",
      },
      warning: {
        root:
          "border-amber-500/50 bg-amber-50 text-amber-700 [&>svg]:text-amber-600",
        title: "text-amber-800",
        description: "text-amber-700/80",
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
  AlertSharedProps { }

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
