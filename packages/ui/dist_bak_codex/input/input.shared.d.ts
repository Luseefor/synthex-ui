import { type VariantProps } from "../_shared/variants";
export declare const inputVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
    readonly tone: readonly ["default", "invalid"];
}>;
export type InputVariantProps = VariantProps<typeof inputVariants>;
export interface InputSharedProps {
    readonly uiSize?: InputVariantProps["size"];
    readonly invalid?: boolean;
}
export declare function resolveInputVariants(props?: InputSharedProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
    readonly tone: readonly ["default", "invalid"];
}>>;
//# sourceMappingURL=input.shared.d.ts.map