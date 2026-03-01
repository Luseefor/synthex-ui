import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const alertVariants = defineVariants({
  variants: {
    variant: ["default", "destructive", "success", "warning"] as const,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type AlertVariantProps = VariantProps<typeof alertVariants>;

export interface AlertSharedProps extends AlertVariantProps {}

export function resolveAlertVariants(props?: AlertSharedProps) {
  return resolveVariants(alertVariants, props);
}
