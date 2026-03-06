import { type VariantProps } from "../_shared/variants";
export declare const toggleVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
    readonly variant: readonly ["default", "outline"];
}>;
export type ToggleVariantProps = VariantProps<typeof toggleVariants>;
export interface ToggleSharedProps extends ToggleVariantProps {
    readonly defaultPressed?: boolean;
    readonly onPressedChange?: (pressed: boolean) => void;
    readonly pressed?: boolean;
}
export declare function resolveToggleVariants(props?: ToggleVariantProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
    readonly variant: readonly ["default", "outline"];
}>>;
//# sourceMappingURL=toggle.shared.d.ts.map