import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type VariantOptions = Record<string, readonly string[]>;
type VariantSelection<TVariants extends VariantOptions> = Partial<{
  readonly [K in keyof TVariants]: TVariants[K][number];
}>;

export interface VariantDefinition<TVariants extends VariantOptions> {
  readonly variants: TVariants;
  readonly defaultVariants?: VariantSelection<TVariants>;
}

export type VariantProps<TDefinition extends VariantDefinition<VariantOptions>> =
  VariantSelection<TDefinition["variants"]>;

export type ResolvedVariants<TDefinition extends VariantDefinition<VariantOptions>> = {
  readonly [K in keyof TDefinition["variants"]]: TDefinition["variants"][K][number];
};

export type SlotStyles<TSlots extends string, TValue> = Partial<Record<TSlots, TValue>>;

export interface CompoundVariant<
  TVariants extends VariantOptions,
  TSlots extends string,
  TValue,
> {
  readonly when: VariantSelection<TVariants>;
  readonly styles: SlotStyles<TSlots, TValue>;
}

export interface VariantStyleDefinition<
  TVariants extends VariantOptions,
  TSlots extends string,
  TValue,
> {
  readonly slots: readonly TSlots[];
  readonly base?: SlotStyles<TSlots, TValue>;
  readonly variants?: Partial<{
    readonly [K in keyof TVariants]: Partial<
      Record<TVariants[K][number], SlotStyles<TSlots, TValue>>
    >;
  }>;
  readonly compoundVariants?: readonly CompoundVariant<TVariants, TSlots, TValue>[];
}

export type ResolvedSlotStyles<TSlots extends string, TValue> = {
  readonly [K in TSlots]: readonly TValue[];
};

export function defineVariants<const TVariants extends VariantOptions>(
  definition: VariantDefinition<TVariants>,
): VariantDefinition<TVariants> {
  return definition;
}

export function resolveVariants<const TDefinition extends VariantDefinition<VariantOptions>>(
  definition: TDefinition,
  props?: VariantProps<TDefinition>,
): ResolvedVariants<TDefinition> {
  const resolved: Record<string, string> = {};

  for (const key of Object.keys(definition.variants)) {
    const values = definition.variants[key] ?? [];
    const incoming = props?.[key as keyof VariantProps<TDefinition>];
    const fallback = definition.defaultVariants?.[key as keyof typeof definition.defaultVariants];
    const value = (incoming ?? fallback ?? values[0]) as string | undefined;

    if (!value) {
      throw new Error(`No variant value could be resolved for "${key}".`);
    }

    resolved[key] = value;
  }

  return resolved as ResolvedVariants<TDefinition>;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function resolveVariantStyles<
  const TVariants extends VariantOptions,
  const TSlots extends string,
  TValue,
>(
  variants: VariantDefinition<TVariants>,
  definition: VariantStyleDefinition<TVariants, TSlots, TValue>,
  props?: VariantSelection<TVariants>,
): ResolvedSlotStyles<TSlots, TValue> {
  const resolved = resolveVariants(variants, props);
  const collected = definition.slots.reduce(
    (accumulator, slot) => {
      accumulator[slot] = [];
      return accumulator;
    },
    {} as Record<TSlots, TValue[]>,
  );

  appendSlotStyles(collected, definition.base);

  const variantKeys = Object.keys(resolved) as Array<keyof typeof resolved>;

  for (const key of variantKeys) {
    const value = resolved[key];
    const slotStyles = definition.variants?.[key as keyof typeof definition.variants]?.[
      value
    ] as SlotStyles<TSlots, TValue> | undefined;

    appendSlotStyles(collected, slotStyles);
  }

  for (const compound of definition.compoundVariants ?? []) {
    if (matchesCompoundVariant(compound.when, resolved)) {
      appendSlotStyles(collected, compound.styles);
    }
  }

  return collected as ResolvedSlotStyles<TSlots, TValue>;
}

function appendSlotStyles<TSlots extends string, TValue>(
  target: Record<TSlots, TValue[]>,
  styles?: SlotStyles<TSlots, TValue>,
): void {
  if (!styles) {
    return;
  }

  for (const key of Object.keys(styles) as TSlots[]) {
    const value = styles[key];

    if (value !== undefined) {
      target[key].push(value);
    }
  }
}

function matchesCompoundVariant<TVariants extends VariantOptions>(
  expected: VariantSelection<TVariants>,
  actual: VariantSelection<TVariants>,
): boolean {
  for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
    if (expected[key] !== actual[key]) {
      return false;
    }
  }

  return true;
}
