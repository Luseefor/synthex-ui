import { type VariantProps } from "../_shared/variants";
export declare const switchVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md"];
}>;
export type SwitchVariantProps = VariantProps<typeof switchVariants>;
export interface SwitchSharedProps {
    readonly checked?: boolean;
    readonly defaultChecked?: boolean;
    readonly onCheckedChange?: (checked: boolean) => void;
    readonly uiSize?: SwitchVariantProps["size"];
}
export declare function resolveSwitchVariants(props?: Pick<SwitchSharedProps, "uiSize">): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md"];
}>>;
//# sourceMappingURL=switch.shared.d.ts.map