import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const progressVariants = defineVariants({
  variants: {
    size: ["sm", "md", "lg"] as const,
  },
  defaultVariants: {
    size: "md",
  },
});

export type ProgressVariantProps = VariantProps<typeof progressVariants>;

export interface ProgressSharedProps extends ProgressVariantProps {
  readonly max?: number;
  readonly value?: number;
}

export function resolveProgressVariants(props?: ProgressVariantProps) {
  return resolveVariants(progressVariants, props);
}
