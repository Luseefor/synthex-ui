import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { buttonVariants, type ButtonSharedProps } from "./button.shared";

const buttonClassStyles = {
  slots: ["root"] as const,
  base: {
    root:
      "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none rounded-[var(--sx-radius-md)] border border-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-50",
  },
  variants: {
    variant: {
      default:
      {
        root:
          "bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[var(--sx-shadow-sm)] hover:bg-[color:var(--sx-color-primary)]/90",
      },
      secondary: {
        root:
          "bg-[color:var(--sx-color-secondary)] text-[color:var(--sx-color-foreground)] shadow-[var(--sx-shadow-sm)] hover:bg-[color:var(--sx-color-secondary)]/80",
      },
      destructive: {
        root:
          "bg-[color:var(--sx-color-destructive)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[var(--sx-shadow-sm)] hover:bg-[color:var(--sx-color-destructive)]/90",
      },
      ghost: {
        root:
          "text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-accent)] hover:text-[color:var(--sx-color-foreground)]",
      },
      outline: {
        root:
          "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[var(--sx-shadow-sm)] hover:bg-[color:var(--sx-color-accent)] hover:text-[color:var(--sx-color-foreground)]",
      },
      link: {
        root:
          "h-auto rounded-none px-0 py-0 text-[color:var(--sx-color-primary)] shadow-none hover:text-[color:var(--sx-color-primary)]/90 hover:underline",
      },
    },
    size: {
      sm: {
        root: "h-8 px-3 text-xs",
      },
      md: {
        root: "h-9 px-4 py-2",
      },
      lg: {
        root: "h-10 px-8",
      },
      icon: {
        root: "h-9 w-9 p-0",
      },
    },
  },
  compoundVariants: [
    {
      when: { variant: "link" },
      styles: {
        root: "justify-start",
      },
    },
  ],
} satisfies VariantStyleDefinition<typeof buttonVariants.variants, "root", string>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  ButtonSharedProps { }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, type = "button", variant, ...props }, ref) => {
    const slots = resolveVariantStyles(buttonVariants, buttonClassStyles, {
      variant,
      size,
    });

    return (
      <button
        ref={ref}
        type={type}
        className={cn(...slots.root, className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
