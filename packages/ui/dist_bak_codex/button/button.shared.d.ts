import { type VariantProps } from "../_shared/variants";
export declare const buttonVariants: import("..").VariantDefinition<{
    readonly variant: readonly ["default", "secondary", "destructive", "ghost", "outline", "link"];
    readonly size: readonly ["sm", "md", "lg", "icon"];
}>;
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export interface ButtonSharedProps extends ButtonVariantProps {
}
export declare function resolveButtonVariants(props?: ButtonVariantProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly variant: readonly ["default", "secondary", "destructive", "ghost", "outline", "link"];
    readonly size: readonly ["sm", "md", "lg", "icon"];
}>>;
//# sourceMappingURL=button.shared.d.ts.map