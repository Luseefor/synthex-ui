import { useSidebar } from "synthex-ui/components";
import type { PreviewAccentName } from "../../app/previewAccents";
import { ThemeCustomizer } from "../ThemeCustomizer";

interface SidebarThemeControlProps {
  readonly mode: "light" | "dark";
  readonly setMode: (mode: "light" | "dark") => void;
  readonly accentPreset: PreviewAccentName;
  readonly setAccentPreset: (preset: PreviewAccentName) => void;
}

export function SidebarThemeControl(props: SidebarThemeControlProps) {
  const { open } = useSidebar();

  return (
    <div className={open ? "flex items-center justify-between gap-3 p-3" : "flex justify-center p-2"}>
      {open && <div className="text-xs text-[color:var(--sx-color-foreground-muted)]">Theme</div>}
      <ThemeCustomizer {...props} compact={!open} />
    </div>
  );
}
