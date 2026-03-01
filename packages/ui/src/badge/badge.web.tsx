import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { badgeVariants, type BadgeSharedProps } from "./badge.shared";

const badgeClassStyles = {
  slots: ["root"] as const,
  base: {
    root:
      "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
  },
  variants: {
    variant: {
      default: {
        root:
          "border-transparent bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-primary)]",
      },
      secondary: {
        root:
          "border-transparent bg-[color:var(--sx-color-secondary-muted)] text-[color:var(--sx-color-foreground)]",
      },
      destructive: {
        root:
          "border-transparent bg-[color:var(--sx-color-destructive-muted)] text-[color:var(--sx-color-destructive)]",
      },
      outline: {
        root:
          "border-[color:var(--sx-color-border-strong)] bg-transparent text-[color:var(--sx-color-foreground)]",
      },
    },
  },
} satisfies VariantStyleDefinition<typeof badgeVariants.variants, "root", string>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BadgeSharedProps {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  const slots = resolveVariantStyles(badgeVariants, badgeClassStyles, { variant });

  return <div className={cn(...slots.root, className)} {...props} />;
}
