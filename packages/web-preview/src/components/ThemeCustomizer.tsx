import * as React from "react";
import { createPortal } from "react-dom";
import { MoonIcon, PaletteIcon, SunIcon } from "synthex-ui/icons";

type ThemeAccentName = "steel" | "stone" | "bronze" | "mulberry";

const THEME_ACCENTS: Record<ThemeAccentName, { label: string; swatch: string }> = {
  steel: { label: "Steel", swatch: "#93a8bf" },
  stone: { label: "Stone", swatch: "#adb9a3" },
  bronze: { label: "Bronze", swatch: "#bc9972" },
  mulberry: { label: "Mulberry", swatch: "#ab91b4" },
};

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
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState({ left: 12, top: 12, maxHeight: 360 });
  const [isPositioned, setIsPositioned] = React.useState(false);

  const accents = React.useMemo(() => Object.keys(THEME_ACCENTS) as ThemeAccentName[], []);
  const selected = THEME_ACCENTS[accentPreset] ?? THEME_ACCENTS.steel;

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover || typeof window === "undefined") {
      return;
    }

    const spacing = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const triggerRect = trigger.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const panelWidth = Math.min(popRect.width || 320, viewportWidth - spacing * 2);
    const panelHeight = Math.min(popRect.height || 300, viewportHeight - spacing * 2);
    const spaceBelow = viewportHeight - triggerRect.bottom - spacing;
    const spaceAbove = triggerRect.top - spacing;

    const clamp = (value: number, min: number, max: number) => {
      if (max <= min) {
        return min;
      }
      return Math.min(Math.max(value, min), max);
    };

    let top: number;
    let maxHeight: number;
    const canOpenBelow = spaceBelow >= Math.min(220, panelHeight);
    const canOpenAbove = spaceAbove >= Math.min(220, panelHeight);

    if (compact && canOpenAbove) {
      top = triggerRect.top - panelHeight - spacing;
      maxHeight = Math.max(180, spaceAbove);
    } else if (canOpenBelow) {
      top = triggerRect.bottom + spacing;
      maxHeight = Math.max(180, spaceBelow);
    } else if (canOpenAbove) {
      top = triggerRect.top - panelHeight - spacing;
      maxHeight = Math.max(180, spaceAbove);
    } else {
      const preferAbove = spaceAbove > spaceBelow;
      top = preferAbove
        ? triggerRect.top - panelHeight - spacing
        : triggerRect.bottom + spacing;
      maxHeight = Math.max(180, preferAbove ? spaceAbove : spaceBelow);
    }

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const leftCandidate = triggerCenterX - panelWidth / 2;
    const left = clamp(leftCandidate, spacing, viewportWidth - panelWidth - spacing);
    top = clamp(top, spacing, viewportHeight - panelHeight - spacing);

    setPosition({ left, top, maxHeight });
    setIsPositioned(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }

    setIsPositioned(false);
    updatePosition();
    const raf = window.requestAnimationFrame(updatePosition);

    const handleResizeOrScroll = () => updatePosition();
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, updatePosition]);

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label="Theme switcher"
        className={`preview-theme-trigger${compact ? " preview-theme-trigger-compact" : ""}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="preview-theme-swatch" style={{ backgroundColor: selected.swatch }} />
        {!compact ? <span className="preview-theme-trigger-text">{selected.label}</span> : null}
        <span className="preview-theme-trigger-icon">
          <PaletteIcon size={compact ? 13 : 14} />
        </span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              className="preview-theme-popover preview-theme-popover-floating"
              style={{
                left: position.left,
                maxHeight: position.maxHeight,
                opacity: isPositioned ? 1 : 0,
                top: position.top,
                transform: isPositioned ? "translateY(0)" : "translateY(4px)",
                visibility: isPositioned ? "visible" : "hidden",
              }}
            >
              <div className="preview-theme-card">
                <div className="preview-theme-section">
                  <span className="preview-theme-label">Appearance</span>
                  <div className="preview-theme-appearance preview-theme-appearance-pill">
                    <button
                      type="button"
                      className={`preview-theme-mode${mode === "light" ? " is-active" : ""}`}
                      aria-pressed={mode === "light"}
                      onClick={() => setMode("light")}
                    >
                      <SunIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className={`preview-theme-mode${mode === "dark" ? " is-active" : ""}`}
                      aria-pressed={mode === "dark"}
                      onClick={() => setMode("dark")}
                    >
                      <MoonIcon size={13} />
                    </button>
                  </div>
                </div>
                <div className="preview-theme-section preview-theme-section-stack">
                  <span className="preview-theme-label">Accent</span>
                  <div className="preview-theme-accent-row">
                    {accents.map((accent) => {
                      const preset = THEME_ACCENTS[accent];
                      const isActive = accent === accentPreset;

                      return (
                        <button
                          key={accent}
                          type="button"
                          className={`preview-theme-accent${isActive ? " is-active" : ""}`}
                          aria-label={preset.label}
                          onClick={() => setAccentPreset(accent)}
                        >
                          <span
                            className="preview-theme-accent-dot"
                            style={{ ["--preview-accent-swatch" as string]: preset.swatch }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
