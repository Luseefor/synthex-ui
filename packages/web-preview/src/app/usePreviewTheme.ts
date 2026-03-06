import { useEffect, useMemo, useState } from "react";
import {
  defaultThemeAccent,
  resolveThemeAccentTheme,
  themeAccentPresets,
  type ThemeAccentName,
} from "synthex-ui/components";

const DEFAULT_ACCENT: ThemeAccentName = defaultThemeAccent;

export function usePreviewTheme() {
  const [mode, setMode] = useState<"light" | "dark">(
    () => window.localStorage.getItem("synthex-preview-mode") === "dark" ? "dark" : "light",
  );
  const [accentPreset, setAccentPreset] = useState<ThemeAccentName>(() => {
    const stored = window.localStorage.getItem("synthex-preview-accent");
    return stored && stored in themeAccentPresets ? stored as ThemeAccentName : DEFAULT_ACCENT;
  });
  const [radius, setRadius] = useState<number>(() => {
    const stored = window.localStorage.getItem("synthex-preview-radius");
    return stored ? parseFloat(stored) : 1;
  });

  useEffect(() => window.localStorage.setItem("synthex-preview-mode", mode), [mode]);
  useEffect(() => window.localStorage.setItem("synthex-preview-accent", accentPreset), [accentPreset]);
  useEffect(() => window.localStorage.setItem("synthex-preview-radius", String(radius)), [radius]);

  const themeOverrides = useMemo(() => {
    const accentTheme = resolveThemeAccentTheme(accentPreset, mode);

    return {
      ...accentTheme,
      radius: {
        sm: Math.round(6 * radius),
        md: Math.round(8 * radius),
        lg: Math.round(12 * radius),
        xl: Math.round(16 * radius),
        pill: 999,
      },
    };
  }, [accentPreset, mode, radius]);

  return {
    accentPreset,
    mode,
    radius,
    setAccentPreset,
    setMode,
    setRadius,
    themeOverrides,
  };
}

export type PreviewThemeState = ReturnType<typeof usePreviewTheme>;
