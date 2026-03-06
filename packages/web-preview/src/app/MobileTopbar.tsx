import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "synthex-ui/components";
import { PanelLeftIcon } from "synthex-ui/icons";
import type { PreviewAccentName } from "./previewAccents";
import { ThemeCustomizer } from "../components/ThemeCustomizer";
import { ReleaseNotesTrigger } from "../components/sidebar/ReleaseNotesTrigger";
import { NAV_ITEMS } from "./nav";

interface MobileTopbarProps {
  readonly mode: "light" | "dark";
  readonly setMode: (mode: "light" | "dark") => void;
  readonly accentPreset: PreviewAccentName;
  readonly setAccentPreset: (preset: PreviewAccentName) => void;
}

export function MobileTopbar({ mode, setMode, accentPreset, setAccentPreset }: MobileTopbarProps) {
  const location = useLocation();
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)?.label ?? "Overview";

  return (
    <div className="preview-mobile-topbar md:hidden">
      <SidebarTrigger className="preview-mobile-trigger" aria-label="Open navigation">
        <PanelLeftIcon size={18} />
      </SidebarTrigger>
      <div className="preview-mobile-branding">
        <span className="preview-mobile-breadcrumb">{current}</span>
        <div className="preview-mobile-actions">
          <ThemeCustomizer
            mode={mode}
            setMode={setMode}
            accentPreset={accentPreset}
            setAccentPreset={setAccentPreset}
            compact
          />
          <ReleaseNotesTrigger compact />
        </div>
      </div>
    </div>
  );
}
