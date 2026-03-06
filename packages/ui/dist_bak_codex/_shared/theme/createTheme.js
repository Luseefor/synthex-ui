import { colors } from "../tokens/colors";
import { motion } from "../tokens/motion";
import { radius } from "../tokens/radius";
import { shadows } from "../tokens/shadows";
import { space } from "../tokens/space";
import { typography } from "../tokens/typography";
export const lightTheme = {
    mode: "light",
    colors,
    shadows,
    radius,
    space,
    typography,
    motion,
};
/**
 * Dark theme — Zinc-neutral foundation.
 * Inspired by shadcn's dark Zinc palette:
 *   bg ≈ zinc-950, surface ≈ zinc-900, border ≈ white/10%
 */
export const darkTheme = {
    mode: "dark",
    colors: {
        ...colors,
        // ── Surfaces ──────────────────────────────────────────
        background: "#09090b", // zinc-950
        backgroundSubtle: "#18181b", // zinc-900
        surface: "#18181b", // zinc-900
        surfaceMuted: "#09090b", // zinc-950
        surfaceRaised: "#27272a", // zinc-800
        // ── Text ──────────────────────────────────────────────
        foreground: "#fafafa", // zinc-50
        foregroundMuted: "#a1a1aa", // zinc-400
        foregroundOnBrand: "#fafafa", // zinc-50
        // ── Borders ───────────────────────────────────────────
        border: "#27272a", // zinc-800
        borderStrong: "#3f3f46", // zinc-700
        // ── Primary ─────────────────────────────────────────
        primary: "#3b82f6", // blue-500 (brighter for dark bg)
        primaryHover: "#60a5fa", // blue-400
        primaryMuted: "rgba(59, 130, 246, 0.15)",
        // ── Secondary ────────────────────────────────────────
        secondary: "#27272a", // zinc-800
        secondaryHover: "#3f3f46", // zinc-700
        secondaryMuted: "#18181b", // zinc-900
        // ── Destructive (bold red, not pastel) ───────────────
        destructive: "#ef4444", // red-500
        destructiveHover: "#f87171", // red-400
        destructiveMuted: "rgba(239, 68, 68, 0.15)",
        // ── Accent ──────────────────────────────────────────
        accent: "#27272a", // zinc-800
        accentMuted: "#18181b", // zinc-900
        // ── Focus ring ──────────────────────────────────────
        ring: "#3b82f6", // blue-500 (solid)
    },
    shadows: {
        ...shadows,
        xs: "0 1px 2px rgba(0, 0, 0, 0.4)",
        sm: "0 4px 16px rgba(0, 0, 0, 0.3)",
        md: "0 8px 32px rgba(0, 0, 0, 0.4)",
        lg: "0 16px 48px rgba(0, 0, 0, 0.5)",
        inset: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
    },
    radius,
    space,
    typography,
    motion,
};
export const themePresets = {
    light: lightTheme,
    dark: darkTheme,
};
export const defaultTheme = lightTheme;
export const accentPresets = {
    blue: {
        label: "Blue",
        swatch: "#2563eb",
        theme: {},
    },
    emerald: {
        label: "Emerald",
        swatch: "#10b981",
        theme: {
            colors: {
                primary: "#10b981", // emerald-500
                primaryHover: "#059669", // emerald-600
                primaryMuted: "#ecfdf5", // emerald-50
                ring: "#10b981",
            },
        },
    },
    violet: {
        label: "Violet",
        swatch: "#8b5cf6",
        theme: {
            colors: {
                primary: "#8b5cf6", // violet-500
                primaryHover: "#7c3aed", // violet-600
                primaryMuted: "#f5f3ff", // violet-50
                ring: "#8b5cf6",
            },
        },
    },
    amber: {
        label: "Amber",
        swatch: "#f59e0b",
        theme: {
            colors: {
                primary: "#f59e0b", // amber-500
                primaryHover: "#d97706", // amber-600
                primaryMuted: "#fffbeb", // amber-50
                ring: "#f59e0b",
            },
        },
    },
    rose: {
        label: "Rose",
        swatch: "#f43f5e",
        theme: {
            colors: {
                primary: "#f43f5e", // rose-500
                primaryHover: "#e11d48", // rose-600
                primaryMuted: "#fff1f2", // rose-50
                ring: "#f43f5e",
            },
        },
    },
};
export function resolveAccentPreset(accentPreset) {
    if (!accentPreset) {
        return undefined;
    }
    return accentPresets[accentPreset]?.theme;
}
export function createTheme(overrides, options) {
    const baseTheme = themePresets[options?.mode ?? "light"];
    const accentTheme = resolveAccentPreset(options?.accentPreset);
    if (!accentTheme && !overrides) {
        return baseTheme;
    }
    const themedBase = accentTheme ? mergeTheme(baseTheme, accentTheme) : baseTheme;
    if (!overrides) {
        return themedBase;
    }
    return mergeTheme(themedBase, overrides);
}
export function themeToCssVariables(theme) {
    return {
        "--sx-theme-mode": theme.mode,
        // Colors
        "--sx-color-background": theme.colors.background,
        "--sx-color-background-subtle": theme.colors.backgroundSubtle,
        "--sx-color-surface": theme.colors.surface,
        "--sx-color-surface-muted": theme.colors.surfaceMuted,
        "--sx-color-surface-raised": theme.colors.surfaceRaised,
        "--sx-color-foreground": theme.colors.foreground,
        "--sx-color-foreground-muted": theme.colors.foregroundMuted,
        "--sx-color-foreground-on-brand": theme.colors.foregroundOnBrand,
        "--sx-color-border": theme.colors.border,
        "--sx-color-border-strong": theme.colors.borderStrong,
        "--sx-color-primary": theme.colors.primary,
        "--sx-color-primary-hover": theme.colors.primaryHover,
        "--sx-color-primary-muted": theme.colors.primaryMuted,
        "--sx-color-secondary": theme.colors.secondary,
        "--sx-color-secondary-hover": theme.colors.secondaryHover,
        "--sx-color-secondary-muted": theme.colors.secondaryMuted,
        "--sx-color-destructive": theme.colors.destructive,
        "--sx-color-destructive-hover": theme.colors.destructiveHover,
        "--sx-color-destructive-muted": theme.colors.destructiveMuted,
        "--sx-color-accent": theme.colors.accent,
        "--sx-color-accent-muted": theme.colors.accentMuted,
        "--sx-color-ring": theme.colors.ring,
        // Shadows
        "--sx-shadow-xs": theme.shadows.xs,
        "--sx-shadow-sm": theme.shadows.sm,
        "--sx-shadow-md": theme.shadows.md,
        "--sx-shadow-lg": theme.shadows.lg,
        "--sx-shadow-inset": theme.shadows.inset,
        // Radius
        "--sx-radius-sm": `${theme.radius.sm}px`,
        "--sx-radius-md": `${theme.radius.md}px`,
        "--sx-radius-lg": `${theme.radius.lg}px`,
        "--sx-radius-xl": `${theme.radius.xl}px`,
        "--sx-radius-pill": `${theme.radius.pill}px`,
        // Space
        "--sx-space-xs": `${theme.space.xs}px`,
        "--sx-space-sm": `${theme.space.sm}px`,
        "--sx-space-md": `${theme.space.md}px`,
        "--sx-space-lg": `${theme.space.lg}px`,
        "--sx-space-xl": `${theme.space.xl}px`,
        "--sx-space-2xl": `${theme.space["2xl"]}px`,
        // Typography — families
        "--sx-font-family-sans": theme.typography.family.sans,
        "--sx-font-family-mono": theme.typography.family.mono,
        // Typography — sizes (px → rem for accessibility)
        "--sx-font-size-xs": `${theme.typography.size.xs / 16}rem`,
        "--sx-font-size-sm": `${theme.typography.size.sm / 16}rem`,
        "--sx-font-size-md": `${theme.typography.size.md / 16}rem`,
        "--sx-font-size-lg": `${theme.typography.size.lg / 16}rem`,
        "--sx-font-size-xl": `${theme.typography.size.xl / 16}rem`,
        "--sx-font-size-2xl": `${theme.typography.size["2xl"] / 16}rem`,
        "--sx-font-size-3xl": `${theme.typography.size["3xl"] / 16}rem`,
        "--sx-font-size-4xl": `${theme.typography.size["4xl"] / 16}rem`,
        // Typography — line heights
        "--sx-line-height-tight": `${theme.typography.lineHeight.tight}`,
        "--sx-line-height-normal": `${theme.typography.lineHeight.normal}`,
        "--sx-line-height-relaxed": `${theme.typography.lineHeight.relaxed}`,
        // Typography — weights
        "--sx-font-weight-medium": theme.typography.weight.medium,
        "--sx-font-weight-semibold": theme.typography.weight.semibold,
        "--sx-font-weight-bold": theme.typography.weight.bold,
        // Motion
        "--sx-motion-fast": `${theme.motion.fast}ms`,
        "--sx-motion-normal": `${theme.motion.normal}ms`,
        "--sx-motion-slow": `${theme.motion.slow}ms`,
        "--sx-easing-emphasized": theme.motion.easingEmphasized,
        "--sx-easing-standard": theme.motion.easingStandard,
    };
}
function mergeTheme(base, overrides) {
    return {
        mode: overrides.mode ?? base.mode,
        colors: { ...base.colors, ...overrides.colors },
        shadows: { ...base.shadows, ...overrides.shadows },
        radius: { ...base.radius, ...overrides.radius },
        space: { ...base.space, ...overrides.space },
        typography: {
            family: { ...base.typography.family, ...overrides.typography?.family },
            size: { ...base.typography.size, ...overrides.typography?.size },
            lineHeight: { ...base.typography.lineHeight, ...overrides.typography?.lineHeight },
            weight: { ...base.typography.weight, ...overrides.typography?.weight },
        },
        motion: { ...base.motion, ...overrides.motion },
    };
}
