import type { AccentPresetName } from "synthex-ui/theme";
import { useSidebar } from "synthex-ui/components";
import { ThemeCustomizer } from "../ThemeCustomizer";

interface SidebarThemeControlProps {
  readonly mode: "light" | "dark";
  readonly setMode: (mode: "light" | "dark") => void;
  readonly accentPreset: AccentPresetName;
  readonly setAccentPreset: (preset: AccentPresetName) => void;
  readonly radius: number;
  readonly setRadius: (radius: number) => void;
}

export function SidebarThemeControl(props: SidebarThemeControlProps) {
  const { open } = useSidebar();

  return (
    <div className={open ? "flex items-center justify-between gap-3 p-3" : "flex justify-center p-2"}>
      {open && <div className="text-xs text-[color:var(--sx-color-foreground-muted)]">Theme</div>}
      <ThemeCustomizer {...props} />
    </div>
  );
}
