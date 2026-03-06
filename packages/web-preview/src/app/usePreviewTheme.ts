import { useEffect, useMemo, useState } from "react";
import { previewAccentPresets, type PreviewAccentName } from "./previewAccents";

const DEFAULT_ACCENT: PreviewAccentName = "steel";

export function usePreviewTheme() {
  const [mode, setMode] = useState<"light" | "dark">(
    () => window.localStorage.getItem("synthex-preview-mode") === "dark" ? "dark" : "light",
  );
  const [accentPreset, setAccentPreset] = useState<PreviewAccentName>(() => {
    const stored = window.localStorage.getItem("synthex-preview-accent");
    return stored && stored in previewAccentPresets ? stored as PreviewAccentName : DEFAULT_ACCENT;
  });
  const [radius, setRadius] = useState<number>(() => {
    const stored = window.localStorage.getItem("synthex-preview-radius");
    return stored ? parseFloat(stored) : 1;
  });

  useEffect(() => window.localStorage.setItem("synthex-preview-mode", mode), [mode]);
  useEffect(() => window.localStorage.setItem("synthex-preview-accent", accentPreset), [accentPreset]);
  useEffect(() => window.localStorage.setItem("synthex-preview-radius", String(radius)), [radius]);

  const themeOverrides = useMemo(() => {
    const accent = previewAccentPresets[accentPreset];
    const accentTheme = mode === "dark" ? accent.dark : accent.light;

    return {
      colors: {
        primary: accentTheme.primary,
        primaryHover: accentTheme.primaryHover,
        primaryMuted: accentTheme.primaryMuted,
        ring: accentTheme.ring,
        accent: accentTheme.accent,
        accentMuted: accentTheme.accentMuted,
      },
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
