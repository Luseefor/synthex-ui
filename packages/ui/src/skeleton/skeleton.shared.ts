import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const skeletonVariants = defineVariants({
  variants: {
    variant: ["default", "soft"] as const,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;

export interface SkeletonSharedProps extends SkeletonVariantProps {}

export function resolveSkeletonVariants(props?: SkeletonSharedProps) {
  return resolveVariants(skeletonVariants, props);
}
