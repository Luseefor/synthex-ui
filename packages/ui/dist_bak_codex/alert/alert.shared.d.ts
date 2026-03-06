import { type VariantProps } from "../_shared/variants";
export declare const alertVariants: import("..").VariantDefinition<{
    readonly variant: readonly ["default", "destructive", "success", "warning"];
}>;
export type AlertVariantProps = VariantProps<typeof alertVariants>;
export interface AlertSharedProps extends AlertVariantProps {
}
export declare function resolveAlertVariants(props?: AlertSharedProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly variant: readonly ["default", "destructive", "success", "warning"];
}>>;
//# sourceMappingURL=alert.shared.d.ts.map