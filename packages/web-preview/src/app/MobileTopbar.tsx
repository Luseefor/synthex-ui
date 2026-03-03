import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "synthex-ui/components";
import { NAV_ITEMS } from "./nav";

export function MobileTopbar() {
  const location = useLocation();
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)?.label ?? "Overview";

  return (
    <div className="preview-mobile-topbar md:hidden">
      <SidebarTrigger />
      <div className="preview-mobile-brand">
        <img src="/logo.png" alt="Synthex UI" className="preview-mobile-logo" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[color:var(--sx-color-foreground)]">
            Synthex UI
          </div>
          <div className="truncate text-[10px] uppercase tracking-[0.16em] text-[color:var(--sx-color-foreground-muted)]">
            Preview
          </div>
        </div>
      </div>
      <span className="preview-mobile-breadcrumb">{current}</span>
    </div>
  );
}
