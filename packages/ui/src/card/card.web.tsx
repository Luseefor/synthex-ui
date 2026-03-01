import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { cardVariants, type CardVariantProps } from "./card.shared";

const cardClassStyles = {
  slots: ["root"] as const,
  base: {
    root:
      "rounded-[calc(var(--sx-radius-lg)+2px)] border text-[color:var(--sx-color-foreground)] transition-[background-color,border-color,box-shadow,transform] duration-150",
  },
  variants: {
    variant: {
      default: {
        root:
          "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_12px_32px_rgba(15,23,42,0.06)]",
      },
      elevated: {
        root:
          "border-transparent bg-[color:var(--sx-color-surface-raised)] shadow-[0_18px_44px_rgba(15,23,42,0.12)]",
      },
      interactive: {
        root:
          "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_10px_28px_rgba(15,23,42,0.06)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]",
      },
      muted: {
        root:
          "border-transparent bg-[color:var(--sx-color-surface-muted)] shadow-none",
      },
      accent: {
        root:
          "border-[color:var(--sx-color-accent)] bg-[color:var(--sx-color-accent-muted)] shadow-[0_14px_34px_rgba(15,118,110,0.12)]",
      },
    },
  },
} satisfies VariantStyleDefinition<typeof cardVariants.variants, "root", string>;

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardVariantProps {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    const slots = resolveVariantStyles(cardVariants, cardClassStyles, { variant });

    return (
      <div
        ref={ref}
        className={cn(...slots.root, className)}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 px-6 py-5", className)}
      {...props}
    />
  ),
);

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold tracking-[-0.02em] text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
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

CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  ),
);

CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 px-6 pb-6", className)}
      {...props}
    />
  ),
);

CardFooter.displayName = "CardFooter";
