import { useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./nav";

export function MobileTopbar() {
  const location = useLocation();
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)?.label ?? "Overview";

  return (
    <div className="preview-mobile-topbar md:hidden">
      <span className="preview-mobile-breadcrumb">{current}</span>
    </div>
  );
}
