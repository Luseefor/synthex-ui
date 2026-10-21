import type { OverlayAlign, OverlaySide } from "./positioning";

export type { OverlayAlign, OverlaySide };

export interface NativeOverlayAnchor {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface NativeOverlayContentSize {
  readonly width: number;
  readonly height: number;
}

export interface NativeOverlayViewport {
  readonly width: number;
  readonly height: number;
}

export interface ResolveNativeOverlayPositionOptions {
  readonly anchor: NativeOverlayAnchor;
  readonly content: NativeOverlayContentSize;
  readonly viewport: NativeOverlayViewport;
  readonly side?: OverlaySide;
  readonly align?: OverlayAlign;
  readonly sideOffset?: number;
  readonly alignOffset?: number;
  readonly collisionPadding?: number;
  readonly dir?: "ltr" | "rtl";
}

export interface ResolvedNativeOverlayPosition {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly maxHeight: number;
  readonly side: OverlaySide;
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nonNegativeSize(value: unknown, fallback: number): number {
  const n = finiteOr(value, fallback);
  return n < 0 || !Number.isFinite(n) ? fallback < 0 ? 0 : fallback : n;
}

function oppositeSide(side: OverlaySide): OverlaySide {
  if (side === "top") return "bottom";
  if (side === "bottom") return "top";
  if (side === "left") return "right";
  return "left";
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function resolveNativeOverlayPosition(
  options: ResolveNativeOverlayPositionOptions,
): ResolvedNativeOverlayPosition {
  const rawSide = options.side;
  const rawAlign = options.align;
  const side: OverlaySide =
    rawSide === "top" || rawSide === "right" || rawSide === "bottom" || rawSide === "left"
      ? rawSide
      : "bottom";
  const align: OverlayAlign =
    rawAlign === "start" || rawAlign === "center" || rawAlign === "end" ? rawAlign : "start";
  const dir = options.dir === "rtl" ? "rtl" : "ltr";

  const sideOffset = finiteOr(options.sideOffset, 8);
  const alignOffset = finiteOr(options.alignOffset, 0);

  const anchor = options.anchor ?? { x: 0, y: 0, width: 0, height: 0 };
  const content = options.content ?? { width: 0, height: 0 };
  const viewport = options.viewport ?? { width: 0, height: 0 };

  const ax = finiteOr(anchor.x, 0);
  const ay = finiteOr(anchor.y, 0);
  const aw = nonNegativeSize(anchor.width, 0);
  const ah = nonNegativeSize(anchor.height, 0);

  // Preferred width + natural unclipped height. Keep the natural height for
  // flip decisions so a ScrollView parent cannot cause flip oscillation.
  const contentW = nonNegativeSize(content.width, 0);
  const contentH = nonNegativeSize(content.height, 0);

  const vw = nonNegativeSize(viewport.width, 0);
  const vh = nonNegativeSize(viewport.height, 0);

  const rawPadding = finiteOr(options.collisionPadding, 8);
  const maxPad = Math.min(vw, vh) / 2;
  const pad = vw <= 0 || vh <= 0 ? 0 : clamp(rawPadding < 0 ? 0 : rawPadding, 0, maxPad);

  const usableW = Math.max(0, vw - pad * 2);
  const usableH = Math.max(0, vh - pad * 2);

  // Space available on each side, measured from the anchor edge (plus
  // sideOffset) to the padded viewport edge. May be negative when the anchor
  // is offscreen or overlaps the edge; kept raw for flip comparison.
  const spaceBottom = vh - pad - (ay + ah + sideOffset);
  const spaceTop = ay - sideOffset - pad;
  const spaceRight = vw - pad - (ax + aw + sideOffset);
  const spaceLeft = ax - sideOffset - pad;

  const spaceFor = (s: OverlaySide): number => {
    if (s === "bottom") return spaceBottom;
    if (s === "top") return spaceTop;
    if (s === "right") return spaceRight;
    return spaceLeft;
  };

  // Flip only when the requested side cannot fit the natural main-axis size
  // and the opposite side offers strictly more space.
  const opposite = oppositeSide(side);
  const needsMainAxis = side === "top" || side === "bottom" ? contentH : contentW;
  const requestedSpace = spaceFor(side);
  const oppositeSpace = spaceFor(opposite);
  const finalSide =
    requestedSpace < needsMainAxis && oppositeSpace > requestedSpace ? opposite : side;

  const selectedSpace = Math.max(0, spaceFor(finalSide));
  const isVertical = finalSide === "top" || finalSide === "bottom";

  // Top/bottom width bounded by the viewport; left/right width bounded by the
  // selected-side space. Top/bottom maxHeight bounded by the selected-side
  // space; left/right maxHeight bounded by the viewport. Both dimensions are
  // additionally clamped to the usable viewport so the rendered box always
  // fits the padded viewport.
  const width = isVertical
    ? Math.min(contentW, usableW)
    : Math.min(contentW, usableW, selectedSpace);
  const maxHeight = isVertical
    ? Math.min(contentH, usableH, selectedSpace)
    : Math.min(contentH, usableH);

  const safeWidth = Number.isFinite(width) && width >= 0 ? width : 0;
  const safeMaxHeight = Number.isFinite(maxHeight) && maxHeight >= 0 ? maxHeight : 0;
  const renderedW = safeWidth;
  const renderedH = safeMaxHeight;

  let left: number;
  let top: number;

  if (isVertical) {
    top = finalSide === "bottom" ? ay + ah + sideOffset : ay - sideOffset - renderedH;
    const isRtl = dir === "rtl";
    if (align === "center") {
      left = ax + aw / 2 - renderedW / 2 + alignOffset;
    } else if (align === "end") {
      left = (isRtl ? ax + alignOffset : ax + aw - renderedW + alignOffset);
    } else {
      left = (isRtl ? ax + aw - renderedW + alignOffset : ax + alignOffset);
    }
  } else {
    left = finalSide === "right" ? ax + aw + sideOffset : ax - sideOffset - renderedW;
    if (align === "center") {
      top = ay + ah / 2 - renderedH / 2 + alignOffset;
    } else if (align === "end") {
      top = ay + ah - renderedH + alignOffset;
    } else {
      top = ay + alignOffset;
    }
  }

  if (!Number.isFinite(left)) left = pad;
  if (!Number.isFinite(top)) top = pad;

  const leftMin = pad;
  const leftMax = Math.max(pad, vw - pad - renderedW);
  const topMin = pad;
  const topMax = Math.max(pad, vh - pad - renderedH);
  const clampedLeft = clamp(left, leftMin, leftMax);
  const clampedTop = clamp(top, topMin, topMax);

  return {
    left: clampedLeft,
    top: clampedTop,
    width: safeWidth,
    maxHeight: safeMaxHeight,
    side: finalSide,
  };
}
