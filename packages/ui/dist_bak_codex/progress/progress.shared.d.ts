import { type VariantProps } from "../_shared/variants";
export declare const progressVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
}>;
export type ProgressVariantProps = VariantProps<typeof progressVariants>;
export interface ProgressSharedProps extends ProgressVariantProps {
    readonly max?: number;
    readonly value?: number;
}
export declare function resolveProgressVariants(props?: ProgressVariantProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
}>>;
//# sourceMappingURL=progress.shared.d.ts.map