import {
  ThemeAccentSwitcher,
  type ThemeAccentName,
} from "synthex-ui/components";

interface ThemeCustomizerProps {
  readonly mode: "light" | "dark";
  readonly setMode: (mode: "light" | "dark") => void;
  readonly accentPreset: ThemeAccentName;
  readonly setAccentPreset: (preset: ThemeAccentName) => void;
  readonly compact?: boolean;
  readonly className?: string;
}

export function ThemeCustomizer({
  mode,
  setMode,
  accentPreset,
  setAccentPreset,
  compact = false,
  className,
}: ThemeCustomizerProps) {
  return (
    <ThemeAccentSwitcher
      mode={mode}
      onModeChange={setMode}
      accent={accentPreset}
      onAccentChange={setAccentPreset}
      compact={compact}
      className={className}
      title="Theme"
    />
  );
}
