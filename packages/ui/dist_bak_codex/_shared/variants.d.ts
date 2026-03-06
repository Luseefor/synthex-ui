import { type ClassValue } from "clsx";
type VariantOptions = Record<string, readonly string[]>;
type VariantSelection<TVariants extends VariantOptions> = Partial<{
    readonly [K in keyof TVariants]: TVariants[K][number];
}>;
export interface VariantDefinition<TVariants extends VariantOptions> {
    readonly variants: TVariants;
    readonly defaultVariants?: VariantSelection<TVariants>;
}
export type VariantProps<TDefinition extends VariantDefinition<VariantOptions>> = VariantSelection<TDefinition["variants"]>;
export type ResolvedVariants<TDefinition extends VariantDefinition<VariantOptions>> = {
    readonly [K in keyof TDefinition["variants"]]: TDefinition["variants"][K][number];
};
export type SlotStyles<TSlots extends string, TValue> = Partial<Record<TSlots, TValue>>;
export interface CompoundVariant<TVariants extends VariantOptions, TSlots extends string, TValue> {
    readonly when: VariantSelection<TVariants>;
    readonly styles: SlotStyles<TSlots, TValue>;
}
export interface VariantStyleDefinition<TVariants extends VariantOptions, TSlots extends string, TValue> {
    readonly slots: readonly TSlots[];
    readonly base?: SlotStyles<TSlots, TValue>;
    readonly variants?: Partial<{
        readonly [K in keyof TVariants]: Partial<Record<TVariants[K][number], SlotStyles<TSlots, TValue>>>;
    }>;
    readonly compoundVariants?: readonly CompoundVariant<TVariants, TSlots, TValue>[];
}
export type ResolvedSlotStyles<TSlots extends string, TValue> = {
    readonly [K in TSlots]: readonly TValue[];
};
export declare function defineVariants<const TVariants extends VariantOptions>(definition: VariantDefinition<TVariants>): VariantDefinition<TVariants>;
export declare function resolveVariants<const TDefinition extends VariantDefinition<VariantOptions>>(definition: TDefinition, props?: VariantProps<TDefinition>): ResolvedVariants<TDefinition>;
export declare function cn(...inputs: ClassValue[]): string;
export declare function resolveVariantStyles<const TVariants extends VariantOptions, const TSlots extends string, TValue>(variants: VariantDefinition<TVariants>, definition: VariantStyleDefinition<TVariants, TSlots, TValue>, props?: VariantSelection<TVariants>): ResolvedSlotStyles<TSlots, TValue>;
export {};
//# sourceMappingURL=variants.d.ts.map