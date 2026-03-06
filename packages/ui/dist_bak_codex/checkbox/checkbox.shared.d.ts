import { type VariantProps } from "../_shared/variants";
export declare const checkboxVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md"];
    readonly tone: readonly ["default", "invalid"];
}>;
export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>;
export interface CheckboxSharedProps {
    readonly checked?: boolean;
    readonly defaultChecked?: boolean;
    readonly invalid?: boolean;
    readonly onCheckedChange?: (checked: boolean) => void;
    readonly uiSize?: CheckboxVariantProps["size"];
}
export declare function resolveCheckboxVariants(props?: Pick<CheckboxSharedProps, "invalid" | "uiSize">): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md"];
    readonly tone: readonly ["default", "invalid"];
}>>;
//# sourceMappingURL=checkbox.shared.d.ts.map