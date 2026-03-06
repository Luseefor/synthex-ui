import * as React from "react";
import { CheckIcon, MoonIcon, PaletteIcon, SunIcon } from "synthex-ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "synthex-ui/components";
import { cn } from "synthex-ui";
import { previewAccentPresets, type PreviewAccentName } from "../app/previewAccents";

interface ThemeCustomizerProps {
  readonly mode: "light" | "dark";
  readonly setMode: (mode: "light" | "dark") => void;
  readonly accentPreset: PreviewAccentName;
  readonly setAccentPreset: (preset: PreviewAccentName) => void;
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
  const orderedAccents: PreviewAccentName[] = ["steel", "stone", "bronze", "mulberry"];
  const selected = previewAccentPresets[accentPreset];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "preview-theme-trigger",
            compact && "preview-theme-trigger-compact",
            className,
          )}
          aria-label="Customize theme"
        >
          <span className="preview-theme-swatch" style={{ backgroundColor: selected.swatch }} />
          {!compact ? <span className="preview-theme-trigger-text">{selected.label}</span> : null}
          <PaletteIcon size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="preview-theme-popover">
        <div className="preview-theme-card">
          <div className="preview-theme-section">
            <span className="preview-theme-label">Appearance</span>
            <div className="preview-theme-appearance">
              <button
                type="button"
                className={cn("preview-theme-mode", mode === "light" && "is-active")}
                onClick={() => setMode("light")}
                aria-label="Light mode"
              >
                <SunIcon size={14} />
              </button>
              <button
                type="button"
                className={cn("preview-theme-mode", mode === "dark" && "is-active")}
                onClick={() => setMode("dark")}
                aria-label="Dark mode"
              >
                <MoonIcon size={14} />
              </button>
            </div>
          </div>
          <div className="preview-theme-section preview-theme-section-stack">
            <span className="preview-theme-label">Accent</span>
            <div className="preview-theme-accent-row">
              {orderedAccents.map((accent) => {
                const preset = previewAccentPresets[accent];
                const isActive = accentPreset === accent;

                return (
                  <button
                    key={accent}
                    type="button"
                    className={cn("preview-theme-accent", isActive && "is-active")}
                    style={{ ["--preview-accent-swatch" as string]: preset.swatch } as React.CSSProperties}
                    onClick={() => setAccentPreset(accent)}
                    aria-label={preset.label}
                  >
                    <span className="preview-theme-accent-dot" />
                    {isActive ? <CheckIcon size={11} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
