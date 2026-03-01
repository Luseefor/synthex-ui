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
      "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none rounded-[var(--sx-radius-md)] border border-transparent font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--sx-motion-fast)] ease-[var(--sx-easing-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]",
  },
  variants: {
    variant: {
      default:
      {
        root:
          "bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[0_1px_2px_rgba(15,23,42,0.18)] hover:bg-[color:var(--sx-color-primary-hover)]",
      },
      secondary: {
        root:
          "bg-[color:var(--sx-color-secondary-muted)] text-[color:var(--sx-color-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:bg-[color:var(--sx-color-secondary)]",
      },
      destructive: {
        root:
          "bg-[color:var(--sx-color-destructive)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[0_1px_2px_rgba(127,29,29,0.18)] hover:bg-[color:var(--sx-color-destructive-hover)]",
      },
      ghost: {
        root:
          "text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-background-subtle)] hover:text-[color:var(--sx-color-foreground)]",
      },
      outline: {
        root:
          "border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-[color:var(--sx-color-surface-muted)]",
      },
      link: {
        root:
          "h-auto rounded-none px-0 py-0 text-[color:var(--sx-color-primary)] shadow-none hover:text-[color:var(--sx-color-primary-hover)] hover:underline",
      },
    },
    size: {
      sm: {
        root: "h-9 px-3.5 text-[13px]",
      },
      md: {
        root: "h-10 px-4 text-sm",
      },
      lg: {
        root: "h-11 px-5 text-[15px]",
      },
      icon: {
        root: "h-10 w-10 p-0 text-sm",
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
