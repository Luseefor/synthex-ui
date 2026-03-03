import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "synthex-ui/components";
import { PanelLeftIcon } from "synthex-ui/icons";
import { NAV_ITEMS } from "./nav";

export function MobileTopbar() {
  const location = useLocation();
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)?.label ?? "Overview";

  return (
    <div className="preview-mobile-topbar md:hidden">
      <SidebarTrigger className="preview-mobile-trigger" aria-label="Open navigation">
        <PanelLeftIcon size={18} />
      </SidebarTrigger>
      <span className="preview-mobile-breadcrumb">{current}</span>
    </div>
  );
}
