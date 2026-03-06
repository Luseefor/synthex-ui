import { type VariantProps } from "../_shared/variants";
export declare const badgeVariants: import("..").VariantDefinition<{
    readonly variant: readonly ["default", "secondary", "destructive", "outline"];
}>;
export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
export interface BadgeSharedProps extends BadgeVariantProps {
}
export declare function resolveBadgeVariants(props?: BadgeVariantProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly variant: readonly ["default", "secondary", "destructive", "outline"];
}>>;
//# sourceMappingURL=badge.shared.d.ts.map