import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function defineVariants(definition) {
    return definition;
}
export function resolveVariants(definition, props) {
    const resolved = {};
    for (const key of Object.keys(definition.variants)) {
        const values = definition.variants[key] ?? [];
        const incoming = props?.[key];
        const fallback = definition.defaultVariants?.[key];
        const value = (incoming ?? fallback ?? values[0]);
        if (!value) {
            throw new Error(`No variant value could be resolved for "${key}".`);
        }
        resolved[key] = value;
    }
    return resolved;
}
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function resolveVariantStyles(variants, definition, props) {
    const resolved = resolveVariants(variants, props);
    const collected = definition.slots.reduce((accumulator, slot) => {
        accumulator[slot] = [];
        return accumulator;
    }, {});
    appendSlotStyles(collected, definition.base);
    const variantKeys = Object.keys(resolved);
    for (const key of variantKeys) {
        const value = resolved[key];
        const slotStyles = definition.variants?.[key]?.[value];
        appendSlotStyles(collected, slotStyles);
    }
    for (const compound of definition.compoundVariants ?? []) {
        if (matchesCompoundVariant(compound.when, resolved)) {
            appendSlotStyles(collected, compound.styles);
        }
    }
    return collected;
}
function appendSlotStyles(target, styles) {
    if (!styles) {
        return;
    }
    for (const key of Object.keys(styles)) {
        const value = styles[key];
        if (value !== undefined) {
            target[key].push(value);
        }
    }
}
function matchesCompoundVariant(expected, actual) {
    for (const key of Object.keys(expected)) {
        if (expected[key] !== actual[key]) {
            return false;
        }
    }
    return true;
}
