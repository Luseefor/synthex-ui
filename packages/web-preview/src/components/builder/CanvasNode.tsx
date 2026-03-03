import { Content } from "./Content";
import { DIRECT_EDIT_TYPES, EXPANDED_CANVAS_TYPES } from "./presets";
import type { BuilderNode } from "./types";

export function CanvasNode({ n, isSel, pv, onSel, onDrag, onResize }: {
  n: BuilderNode;
  isSel: boolean;
  pv: boolean;
  onSel: () => void;
  onDrag: (ox: number, oy: number) => void;
  onResize: (sx: number, sy: number) => void;
}) {
  const allowDirectEdit = pv || DIRECT_EDIT_TYPES.has(n.type);
  const allowOverflow = pv || EXPANDED_CANVAS_TYPES.has(n.type);

  return (
    <div
      style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: n.type === "Separator" ? 4 : n.h, boxShadow: isSel ? "0 0 0 2px var(--sx-color-primary), 0 0 0 4px rgba(59,130,246,0.12)" : "none", borderRadius: "var(--sx-radius-md)", cursor: pv ? "default" : allowDirectEdit ? "default" : isSel ? "default" : "move", zIndex: isSel ? 10 : 1, overflow: allowOverflow ? "visible" : "hidden" }}
      onPointerDownCapture={() => { if (!pv && !isSel && allowDirectEdit) onSel(); }}
      onClick={(e) => { if (!pv) e.stopPropagation(); }}
      onPointerDown={(e) => { if (pv || e.target !== e.currentTarget) return; e.stopPropagation(); onSel(); const r = e.currentTarget.getBoundingClientRect(); onDrag(e.clientX - r.left, e.clientY - r.top); }}
    >
      <div style={{ width: "100%", height: "100%", pointerEvents: allowDirectEdit ? "auto" : "none" }}><Content n={n} pv={pv} isSel={isSel} /></div>
      {isSel && !pv && <><button type="button" className="bld-mv" onPointerDown={(e) => { e.stopPropagation(); onDrag(e.clientX - 14, e.clientY - 14); }}>Move</button><div className="bld-rz" onPointerDown={(e) => { e.stopPropagation(); onResize(e.clientX, e.clientY); }} /></>}
    </div>
  );
}
