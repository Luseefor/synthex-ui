import { type VariantProps } from "../_shared/variants";
export declare const skeletonVariants: import("..").VariantDefinition<{
    readonly variant: readonly ["default", "soft"];
}>;
export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;
export interface SkeletonSharedProps extends SkeletonVariantProps {
}
export declare function resolveSkeletonVariants(props?: SkeletonSharedProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly variant: readonly ["default", "soft"];
}>>;
//# sourceMappingURL=skeleton.shared.d.ts.map