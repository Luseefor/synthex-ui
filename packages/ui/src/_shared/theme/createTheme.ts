import { colors } from "../tokens/colors";
import { motion } from "../tokens/motion";
import { radius } from "../tokens/radius";
import { shadows } from "../tokens/shadows";
import { space } from "../tokens/space";
import { typography } from "../tokens/typography";
import type { DeepPartial, SynthexTheme, ThemeMode } from "../types";

export const lightTheme: SynthexTheme = {
  mode: "light",
  colors,
  shadows,
  radius,
  space,
  typography,
  motion,
};

export const darkTheme: SynthexTheme = {
  mode: "dark",
  colors: {
    ...colors,
    background: "#08111f",
    backgroundSubtle: "#0f172a",
    surface: "#111c2f",
    surfaceMuted: "#0c1526",
    surfaceRaised: "#162237",
    foreground: "#e2e8f0",
    foregroundMuted: "#94a3b8",
    foregroundOnBrand: "#eff6ff",
    border: "rgba(148, 163, 184, 0.22)",
    borderStrong: "rgba(148, 163, 184, 0.42)",
    primary: "#60a5fa",
    primaryHover: "#3b82f6",
    primaryMuted: "rgba(96, 165, 250, 0.18)",
    secondary: "#334155",
    secondaryHover: "#475569",
    secondaryMuted: "#1e293b",
    destructive: "#f87171",
    destructiveHover: "#ef4444",
    destructiveMuted: "rgba(248, 113, 113, 0.18)",
    accent: "#2dd4bf",
    accentMuted: "rgba(45, 212, 191, 0.18)",
    ring: "rgba(96, 165, 250, 0.38)",
  },
  shadows: {
    ...shadows,
    xs: "0 1px 1px rgba(2, 6, 23, 0.45)",
    sm: "0 12px 28px rgba(2, 6, 23, 0.28)",
    md: "0 18px 42px rgba(2, 6, 23, 0.4)",
    lg: "0 28px 64px rgba(2, 6, 23, 0.48)",
    inset: "inset 0 1px 1px rgba(2, 6, 23, 0.35)",
  },
  radius,
  space,
  typography,
  motion,
};

export const themePresets: Record<ThemeMode, SynthexTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export const defaultTheme = lightTheme;

export function createTheme(
  overrides?: DeepPartial<SynthexTheme>,
  options?: {
    readonly mode?: ThemeMode;
  },
): SynthexTheme {
  const baseTheme = themePresets[options?.mode ?? "light"];

  if (!overrides) {
    return baseTheme;
  }

  return mergeTheme(baseTheme, overrides);
}

export function themeToCssVariables(theme: SynthexTheme): Record<string, string> {
  return {
    "--sx-theme-mode": theme.mode,
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
    "--sx-shadow-xs": theme.shadows.xs,
    "--sx-shadow-sm": theme.shadows.sm,
    "--sx-shadow-md": theme.shadows.md,
    "--sx-shadow-lg": theme.shadows.lg,
    "--sx-shadow-inset": theme.shadows.inset,
    "--sx-radius-sm": `${theme.radius.sm}px`,
    "--sx-radius-md": `${theme.radius.md}px`,
    "--sx-radius-lg": `${theme.radius.lg}px`,
    "--sx-radius-xl": `${theme.radius.xl}px`,
    "--sx-radius-pill": `${theme.radius.pill}px`,
    "--sx-font-family-sans": theme.typography.family.sans,
    "--sx-font-family-mono": theme.typography.family.mono,
    "--sx-motion-fast": `${theme.motion.fast}ms`,
    "--sx-motion-normal": `${theme.motion.normal}ms`,
    "--sx-motion-slow": `${theme.motion.slow}ms`,
    "--sx-easing-emphasized": theme.motion.easingEmphasized,
    "--sx-easing-standard": theme.motion.easingStandard,
  };
}

function mergeTheme(base: SynthexTheme, overrides: DeepPartial<SynthexTheme>): SynthexTheme {
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
