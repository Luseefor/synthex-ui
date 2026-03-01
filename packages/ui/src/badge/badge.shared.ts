import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const badgeVariants = defineVariants({
  variants: {
    variant: ["default", "secondary", "destructive", "outline"] as const,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export interface BadgeSharedProps extends BadgeVariantProps {}

export function resolveBadgeVariants(props?: BadgeVariantProps) {
  return resolveVariants(badgeVariants, props);
}
