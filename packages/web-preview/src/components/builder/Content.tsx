import type { CSSProperties } from "react";
import type { BuilderNode } from "./types";
import { renderBasic } from "./renderers/basic";
import { renderData } from "./renderers/data";
import { renderForms } from "./renderers/forms";
import { renderNavigation } from "./renderers/navigation";
import { renderOverlays } from "./renderers/overlays";

export function Content({ n, pv, isSel }: { n: BuilderNode; pv: boolean; isSel: boolean }) {
  const f: CSSProperties = { width: "100%", height: "100%" };
  const showEditExpanded = !pv && !isSel;

  return renderBasic(n, f)
    ?? renderForms(n, f, showEditExpanded)
    ?? renderData(n, f)
    ?? renderNavigation(n, f, showEditExpanded)
    ?? renderOverlays(n, f, showEditExpanded)
    ?? <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 12 }}>{n.type}</div>;
}
