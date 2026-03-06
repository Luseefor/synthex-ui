import { type VariantProps } from "../_shared/variants";
export declare const textareaVariants: import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
    readonly tone: readonly ["default", "invalid"];
}>;
export type TextareaVariantProps = VariantProps<typeof textareaVariants>;
export interface TextareaSharedProps {
    readonly invalid?: boolean;
    readonly uiSize?: TextareaVariantProps["size"];
}
export declare function resolveTextareaVariants(props?: TextareaSharedProps): import("..").ResolvedVariants<import("..").VariantDefinition<{
    readonly size: readonly ["sm", "md", "lg"];
    readonly tone: readonly ["default", "invalid"];
}>>;
//# sourceMappingURL=textarea.shared.d.ts.map