import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const checkboxVariants = defineVariants({
  variants: {
    size: ["sm", "md"] as const,
    tone: ["default", "invalid"] as const,
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>;

export interface CheckboxSharedProps {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly invalid?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly uiSize?: CheckboxVariantProps["size"];
}

export function resolveCheckboxVariants(
  props?: Pick<CheckboxSharedProps, "invalid" | "uiSize">,
) {
  return resolveVariants(checkboxVariants, {
    size: props?.uiSize,
    tone: props?.invalid ? "invalid" : "default",
  });
}
