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

export type CheckboxCheckedState = boolean | "indeterminate";

export interface CheckboxSharedProps {
  readonly checked?: CheckboxCheckedState;
  readonly defaultChecked?: CheckboxCheckedState;
  readonly invalid?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly required?: boolean;
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
