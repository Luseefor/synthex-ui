import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const cardVariants = defineVariants({
  variants: {
    variant: ["default", "elevated", "interactive", "muted", "accent"] as const,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type CardVariantProps = VariantProps<typeof cardVariants>;

export function resolveCardVariants(props?: CardVariantProps) {
  return resolveVariants(cardVariants, props);
}
