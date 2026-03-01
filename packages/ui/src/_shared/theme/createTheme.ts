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
    background: "#090c11",
    backgroundSubtle: "#0d1117",
    surface: "#11161f",
    surfaceMuted: "#0d1219",
    surfaceRaised: "#171d27",
    foreground: "#e6edf3",
    foregroundMuted: "#97a6b5",
    foregroundOnBrand: "#f8fbff",
    border: "rgba(148, 163, 184, 0.16)",
    borderStrong: "rgba(148, 163, 184, 0.28)",
    primary: "#5b8cff",
    primaryHover: "#7aa2ff",
    primaryMuted: "rgba(91, 140, 255, 0.18)",
    secondary: "#202733",
    secondaryHover: "#2b3544",
    secondaryMuted: "#161c25",
    destructive: "#f87171",
    destructiveHover: "#ef4444",
    destructiveMuted: "rgba(248, 113, 113, 0.18)",
    accent: "#56b6ff",
    accentMuted: "rgba(86, 182, 255, 0.16)",
    ring: "rgba(91, 140, 255, 0.34)",
  },
  shadows: {
    ...shadows,
    xs: "0 1px 1px rgba(3, 6, 12, 0.48)",
    sm: "0 12px 28px rgba(3, 6, 12, 0.34)",
    md: "0 20px 44px rgba(3, 6, 12, 0.44)",
    lg: "0 30px 68px rgba(3, 6, 12, 0.52)",
    inset: "inset 0 1px 1px rgba(3, 6, 12, 0.42)",
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
