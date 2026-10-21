import { describe, expect, it } from "vitest";
import { resolveNativeOverlayPosition } from "./positioning.native";

const VIEWPORT = { width: 390, height: 844 };
const PAD = 8;

function paddedBounds(result: { left: number; top: number; width: number; maxHeight: number }) {
  return {
    right: result.left + result.width,
    bottom: result.top + Math.min(result.maxHeight, result.maxHeight),
  };
}

describe("resolveNativeOverlayPosition", () => {
  it("places bottom/start by default with sideOffset 8", () => {
    const r = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 100, width: 120, height: 40 },
      content: { width: 200, height: 150 },
      viewport: VIEWPORT,
    });
    expect(r.side).toBe("bottom");
    expect(r.top).toBe(100 + 40 + 8);
    expect(r.left).toBe(50);
    expect(r.width).toBe(200);
    expect(r.maxHeight).toBe(150);
  });

  it("places all four sides", () => {
    const anchor = { x: 100, y: 300, width: 80, height: 40 };
    const content = { width: 160, height: 120 };
    const viewport = { width: 390, height: 844 };

    const bottom = resolveNativeOverlayPosition({ anchor, content, viewport, side: "bottom" });
    expect(bottom.side).toBe("bottom");
    expect(bottom.top).toBe(300 + 40 + 8);

    const top = resolveNativeOverlayPosition({ anchor, content, viewport, side: "top" });
    expect(top.side).toBe("top");
    expect(top.top).toBe(300 - 8 - top.maxHeight);
    expect(top.maxHeight).toBe(120);

    const right = resolveNativeOverlayPosition({ anchor, content, viewport, side: "right" });
    expect(right.side).toBe("right");
    expect(right.left).toBe(100 + 80 + 8);

    // Anchor shifted right so requested "left" (needing 160px) fits without flipping.
    const leftAnchor = { x: 200, y: 300, width: 80, height: 40 };
    const left = resolveNativeOverlayPosition({ anchor: leftAnchor, content, viewport, side: "left" });
    expect(left.side).toBe("left");
    expect(left.left).toBe(200 - 8 - left.width);
  });

  it("maps logical start/end on top/bottom under RTL", () => {
    const anchor = { x: 100, y: 200, width: 100, height: 40 };
    const content = { width: 160, height: 100 };

    const ltrStart = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, side: "bottom", align: "start",
    });
    const rtlStart = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, side: "bottom", align: "start", dir: "rtl",
    });
    const ltrEnd = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, side: "bottom", align: "end",
    });
    const rtlEnd = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, side: "bottom", align: "end", dir: "rtl",
    });

    expect(ltrStart.left).toBe(100);
    expect(rtlStart.left).toBe(100 + 100 - 160);
    expect(ltrEnd.left).toBe(100 + 100 - 160);
    expect(rtlEnd.left).toBe(100);
    // RTL start mirrors LTR end and vice versa.
    expect(rtlStart.left).toBe(ltrEnd.left);
    expect(rtlEnd.left).toBe(ltrStart.left);
  });

  it("centers on both axes", () => {
    const anchor = { x: 100, y: 200, width: 80, height: 40 };
    const content = { width: 160, height: 120 };
    const bottomCenter = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, side: "bottom", align: "center",
    });
    expect(bottomCenter.left).toBe(100 + 40 - 80);

    const rightCenter = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, side: "right", align: "center",
    });
    expect(rightCenter.top).toBe(200 + 20 - 60);
  });

  it("keeps left/right cross-axis alignment physical under RTL", () => {
    const anchor = { x: 100, y: 200, width: 80, height: 40 };
    const content = { width: 100, height: 120 };
    for (const align of ["start", "center", "end"] as const) {
      const ltr = resolveNativeOverlayPosition({
        anchor, content, viewport: VIEWPORT, side: "right", align,
      });
      const rtl = resolveNativeOverlayPosition({
        anchor, content, viewport: VIEWPORT, side: "right", align, dir: "rtl",
      });
      expect(rtl.top).toBe(ltr.top);
    }
  });

  it("honors sideOffset and alignOffset", () => {
    const anchor = { x: 50, y: 100, width: 120, height: 40 };
    const content = { width: 200, height: 150 };
    const base = resolveNativeOverlayPosition({ anchor, content, viewport: VIEWPORT });
    const offset = resolveNativeOverlayPosition({
      anchor, content, viewport: VIEWPORT, sideOffset: 20, alignOffset: 12,
    });
    expect(offset.top).toBe(base.top - 8 + 20);
    expect(offset.left).toBe(base.left + 12);

    const topAnchor = { x: 50, y: 300, width: 120, height: 40 };
    const topBase = resolveNativeOverlayPosition({ anchor: topAnchor, content, viewport: VIEWPORT, side: "top" });
    const topOffset = resolveNativeOverlayPosition({
      anchor: topAnchor, content, viewport: VIEWPORT, side: "top", sideOffset: 20,
    });
    expect(topOffset.top).toBe(topBase.top + 8 - 20);
  });

  it("flips bottom to top when bottom lacks room and top has more", () => {
    const r = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 700, width: 120, height: 40 },
      content: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: "bottom",
    });
    // spaceBottom = 844-8-(740+8) = 88 < 100; spaceTop = 700-16 = 684.
    expect(r.side).toBe("top");
    expect(r.maxHeight).toBe(100);
    expect(r.top).toBe(700 - 8 - 100);
  });

  it("flips top to bottom, right to left, and left to right", () => {
    const toBottom = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 20, width: 120, height: 40 },
      content: { width: 200, height: 100 },
      viewport: VIEWPORT,
      side: "top",
    });
    expect(toBottom.side).toBe("bottom");

    const viewport = { width: 390, height: 844 };
    const toLeft = resolveNativeOverlayPosition({
      anchor: { x: 250, y: 200, width: 60, height: 40 },
      content: { width: 120, height: 100 },
      viewport,
      side: "right",
    });
    // spaceRight = 390-8-(310+8) = 64 < 120; spaceLeft = 250-16 = 234.
    expect(toLeft.side).toBe("left");

    const toRight = resolveNativeOverlayPosition({
      anchor: { x: 20, y: 200, width: 60, height: 40 },
      content: { width: 120, height: 100 },
      viewport,
      side: "left",
    });
    // spaceLeft = 20-16 = 4 < 120; spaceRight large.
    expect(toRight.side).toBe("right");
  });

  it("uses natural unclipped height for flip decisions (no oscillation)", () => {
    // Both sides would fit the shrunk height, but natural height only fits top.
    const r = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 600, width: 120, height: 20 },
      content: { width: 200, height: 200 },
      viewport: { width: 390, height: 844 },
      side: "bottom",
    });
    // spaceBottom = 844-8-(620+8) = 208... recompute: ay+ah=620, +8=628, 836-628=208 >= 200 fits -> no flip.
    expect(r.side).toBe("bottom");

    const flipped = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 700, width: 120, height: 20 },
      content: { width: 200, height: 200 },
      viewport: { width: 390, height: 844 },
      side: "bottom",
    });
    // spaceBottom = 836-728 = 108 < 200; spaceTop = 700-16 = 684 -> flip.
    expect(flipped.side).toBe("top");
    expect(flipped.maxHeight).toBe(200);
  });

  it("does not flip when the opposite side has less room", () => {
    const r = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 400, width: 120, height: 40 },
      content: { width: 200, height: 500 },
      viewport: VIEWPORT,
      side: "bottom",
    });
    // spaceBottom = 836-448 = 388; spaceTop = 400-16 = 384; neither fits 500, opposite smaller -> stay.
    expect(r.side).toBe("bottom");
    expect(r.maxHeight).toBe(388);
  });

  it("shrinks width and maxHeight to usable viewport and side space", () => {
    // Top/bottom: width bounded by viewport, maxHeight by side space.
    const wide = resolveNativeOverlayPosition({
      anchor: { x: 50, y: 100, width: 120, height: 40 },
      content: { width: 1000, height: 50 },
      viewport: VIEWPORT,
      side: "bottom",
    });
    expect(wide.width).toBe(VIEWPORT.width - PAD * 2);
    expect(wide.maxHeight).toBe(50);

    // Left/right: width bounded by side space, maxHeight by viewport.
    const tall = resolveNativeOverlayPosition({
      anchor: { x: 100, y: 300, width: 80, height: 40 },
      content: { width: 60, height: 2000 },
      viewport: VIEWPORT,
      side: "right",
    });
    expect(tall.side).toBe("right");
    expect(tall.maxHeight).toBe(VIEWPORT.height - PAD * 2);
    expect(tall.width).toBe(60);
  });

  it("handles oversized content and tiny viewports without negative sizes", () => {
    const oversized = resolveNativeOverlayPosition({
      anchor: { x: 10, y: 10, width: 20, height: 20 },
      content: { width: 5000, height: 5000 },
      viewport: { width: 100, height: 100 },
      side: "bottom",
    });
    expect(oversized.width).toBeLessThanOrEqual(100 - PAD * 2);
    expect(oversized.maxHeight).toBeLessThanOrEqual(100 - PAD * 2);
    expect(oversized.width).toBeGreaterThanOrEqual(0);
    expect(oversized.maxHeight).toBeGreaterThanOrEqual(0);

    const tiny = resolveNativeOverlayPosition({
      anchor: { x: 5, y: 5, width: 5, height: 5 },
      content: { width: 50, height: 50 },
      viewport: { width: 20, height: 20 },
      side: "bottom",
    });
    for (const v of [tiny.left, tiny.top, tiny.width, tiny.maxHeight]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(tiny.left + tiny.width).toBeLessThanOrEqual(20 - PAD + 1e-9);
  });

  it("clamps offscreen anchors within the viewport", () => {
    const cases = [
      { x: -500, y: -500, width: 50, height: 20 },
      { x: 900, y: 1200, width: 50, height: 20 },
      { x: -100, y: 400, width: 30, height: 30 },
    ];
    for (const anchor of cases) {
      const r = resolveNativeOverlayPosition({
        anchor,
        content: { width: 150, height: 100 },
        viewport: VIEWPORT,
      });
      expect(Number.isFinite(r.left)).toBe(true);
      expect(Number.isFinite(r.top)).toBe(true);
      expect(r.width).toBeGreaterThanOrEqual(0);
      expect(r.maxHeight).toBeGreaterThanOrEqual(0);
      expect(r.left).toBeGreaterThanOrEqual(PAD - 1e-9);
      expect(r.top).toBeGreaterThanOrEqual(PAD - 1e-9);
      expect(r.left + r.width).toBeLessThanOrEqual(VIEWPORT.width - PAD + 1e-9);
      expect(r.top + Math.min(100, r.maxHeight)).toBeLessThanOrEqual(
        VIEWPORT.height - PAD + 1e-9,
      );
      void paddedBounds(r);
    }
  });

  it("normalizes NaN/Infinity/negative dimensions and huge padding", () => {
    const r = resolveNativeOverlayPosition({
      anchor: { x: NaN, y: Infinity, width: -50, height: NaN },
      content: { width: NaN, height: Infinity },
      viewport: { width: -100, height: NaN },
      sideOffset: NaN,
      alignOffset: Infinity,
      collisionPadding: 100000,
    });
    for (const v of [r.left, r.top, r.width, r.maxHeight]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }

    const hugePad = resolveNativeOverlayPosition({
      anchor: { x: 100, y: 300, width: 80, height: 40 },
      content: { width: 160, height: 120 },
      viewport: { width: 390, height: 844 },
      collisionPadding: 100000,
    });
    for (const v of [hugePad.left, hugePad.top, hugePad.width, hugePad.maxHeight]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(hugePad.width).toBe(0);
  });

  it("keeps the rendered box inside the padded viewport across a deterministic grid", () => {
    const viewports = [
      { width: 390, height: 844 },
      { width: 200, height: 200 },
      { width: 80, height: 60 },
    ];
    const anchors = [
      { x: 0, y: 0, width: 40, height: 20 },
      { x: 150, y: 400, width: 60, height: 30 },
      { x: -30, y: 100, width: 50, height: 50 },
      { x: 350, y: 800, width: 60, height: 60 },
      { x: 90, y: 90, width: 0, height: 0 },
    ];
    const sides = ["top", "right", "bottom", "left"] as const;
    const aligns = ["start", "center", "end"] as const;
    for (const viewport of viewports) {
      const pad = Math.min(PAD, Math.min(viewport.width, viewport.height) / 2);
      for (const anchor of anchors) {
        for (const side of sides) {
          for (const align of aligns) {
            for (const dir of ["ltr", "rtl"] as const) {
              const r = resolveNativeOverlayPosition({
                anchor,
                content: { width: 140, height: 160 },
                viewport,
                side,
                align,
                dir,
              });
              expect(Number.isFinite(r.left)).toBe(true);
              expect(Number.isFinite(r.top)).toBe(true);
              expect(r.width).toBeGreaterThanOrEqual(0);
              expect(r.maxHeight).toBeGreaterThanOrEqual(0);
              expect(r.left).toBeGreaterThanOrEqual(pad - 1e-9);
              expect(r.top).toBeGreaterThanOrEqual(pad - 1e-9);
              expect(r.left + r.width).toBeLessThanOrEqual(viewport.width - pad + 1e-9);
              expect(r.top + r.maxHeight).toBeLessThanOrEqual(viewport.height - pad + 1e-9);
              expect(["top", "right", "bottom", "left"]).toContain(r.side);
            }
          }
        }
      }
    }
  });
});
