import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import {
  separatorVariants,
  type SeparatorVariantProps,
} from "./separator.shared";

const separatorClassStyles = {
  slots: ["root"] as const,
  base: {
    root: "shrink-0 bg-[color:var(--sx-color-border)]",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "h-px w-full",
      },
      vertical: {
        root: "h-full w-px",
      },
    },
  },
} satisfies VariantStyleDefinition<typeof separatorVariants.variants, "root", string>;

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    SeparatorVariantProps {}

export function Separator({ className, orientation, ...props }: SeparatorProps) {
  const slots = resolveVariantStyles(separatorVariants, separatorClassStyles, {
    orientation,
  });

  return (
    <div
      role="separator"
      aria-orientation={orientation ?? "horizontal"}
      className={cn(...slots.root, className)}
      {...props}
    />
  );
}
