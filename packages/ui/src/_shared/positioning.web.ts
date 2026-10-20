import type * as React from "react";
import type { OverlayAlign, OverlayPositionProps, OverlaySide } from "./positioning";

export type { OverlayAlign, OverlayPositionProps, OverlaySide };

export function overlayPositionClasses(side: OverlaySide, align: OverlayAlign): string {
  const sideClass =
    side === "top"
      ? "bottom-[calc(100%+0.5rem)]"
      : side === "right"
        ? "left-[calc(100%+0.5rem)]"
        : side === "left"
          ? "right-[calc(100%+0.5rem)]"
          : "top-[calc(100%+0.5rem)]";

  if (side === "top" || side === "bottom") {
    if (align === "center") return `${sideClass} left-1/2 -translate-x-1/2`;
    if (align === "end") return `${sideClass} end-0`;
    return `${sideClass} start-0`;
  }

  if (align === "center") return `${sideClass} top-1/2 -translate-y-1/2`;
  if (align === "end") return `${sideClass} bottom-0`;
  return `${sideClass} top-0`;
}

export function overlayPositionStyle(
  side: OverlaySide,
  sideOffset = 0,
  alignOffset = 0,
): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (sideOffset !== 0) {
    if (side === "bottom") style.marginTop = sideOffset;
    else if (side === "top") style.marginBottom = sideOffset;
    else if (side === "right") style.marginLeft = sideOffset;
    else style.marginRight = sideOffset;
  }
  if (alignOffset !== 0) {
    if (side === "top" || side === "bottom") style.marginLeft = (style.marginLeft as number | undefined ?? 0) + alignOffset;
    else style.marginTop = (style.marginTop as number | undefined ?? 0) + alignOffset;
  }
  return style;
}
