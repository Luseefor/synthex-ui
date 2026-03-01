import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const switchVariants = defineVariants({
  variants: {
    size: ["sm", "md"] as const,
  },
  defaultVariants: {
    size: "md",
  },
});

export type SwitchVariantProps = VariantProps<typeof switchVariants>;

export interface SwitchSharedProps {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly uiSize?: SwitchVariantProps["size"];
}

export function resolveSwitchVariants(props?: Pick<SwitchSharedProps, "uiSize">) {
  return resolveVariants(switchVariants, {
    size: props?.uiSize,
  });
}
