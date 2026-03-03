import { useEffect, useMemo, useState } from "react";
import { accentPresets, type AccentPresetName } from "synthex-ui/theme";

const DEFAULT_ACCENT: AccentPresetName = "blue";

export function usePreviewTheme() {
  const [mode, setMode] = useState<"light" | "dark">(
    () => window.localStorage.getItem("synthex-preview-mode") === "dark" ? "dark" : "light",
  );
  const [accentPreset, setAccentPreset] = useState<AccentPresetName>(() => {
    const stored = window.localStorage.getItem("synthex-preview-accent");
    return stored && stored in accentPresets ? stored as AccentPresetName : DEFAULT_ACCENT;
  });
  const [radius, setRadius] = useState<number>(() => {
    const stored = window.localStorage.getItem("synthex-preview-radius");
    return stored ? parseFloat(stored) : 1;
  });

  useEffect(() => window.localStorage.setItem("synthex-preview-mode", mode), [mode]);
  useEffect(() => window.localStorage.setItem("synthex-preview-accent", accentPreset), [accentPreset]);
  useEffect(() => window.localStorage.setItem("synthex-preview-radius", String(radius)), [radius]);

  const themeOverrides = useMemo(() => ({
    radius: {
      sm: Math.round(6 * radius),
      md: Math.round(8 * radius),
      lg: Math.round(12 * radius),
      xl: Math.round(16 * radius),
      pill: 999,
    },
  }), [radius]);

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
