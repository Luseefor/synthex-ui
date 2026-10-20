import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const toggleVariants = defineVariants({
  variants: {
    // "default" is an alias of "md" (matches the web cva size scale).
    size: ["default", "sm", "md", "lg"] as const,
    variant: ["default", "outline"] as const,
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export type ToggleVariantProps = VariantProps<typeof toggleVariants>;

export interface ToggleSharedProps extends ToggleVariantProps {
  readonly defaultPressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly pressed?: boolean;
}

export function resolveToggleVariants(props?: ToggleVariantProps) {
  return resolveVariants(toggleVariants, props);
}
