import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const separatorVariants = defineVariants({
  variants: {
    orientation: ["horizontal", "vertical"] as const,
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type SeparatorVariantProps = VariantProps<typeof separatorVariants>;

export function resolveSeparatorVariants(props?: SeparatorVariantProps) {
  return resolveVariants(separatorVariants, props);
}
