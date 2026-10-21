// Shared overlay positioning types (platform-agnostic).
// Web implements absolute placement via positioning.web.ts;
// native anchored overlays use positioning.native.ts. Other native families
// may still accept these props without implementing positioning.
export type OverlaySide = "top" | "right" | "bottom" | "left";
export type OverlayAlign = "start" | "center" | "end";

export interface OverlayPositionProps {
  readonly align?: OverlayAlign;
  readonly alignOffset?: number;
  readonly side?: OverlaySide;
  readonly sideOffset?: number;
}
