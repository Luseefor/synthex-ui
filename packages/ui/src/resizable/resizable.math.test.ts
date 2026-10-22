import { describe, expect, it } from "vitest";
import {
  getPanelPairBounds,
  resizePanelPair,
  resolvePanelSizes,
} from "./resizable.math";

function sum(values: readonly number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

describe("resolvePanelSizes", () => {
  it("preserves feasible fractional controlled sizes exactly on repeated normalization", () => {
    const panels = [{}, {}, {}];
    const sizes = [28.399999999999995, 41.60000000000001, 30];
    const normalized = resolvePanelSizes(panels, sizes);
    expect(normalized).toEqual(sizes);
    expect(normalized).not.toBe(sizes);
    expect(resolvePanelSizes(panels, normalized)).toEqual(sizes);
  });
  it("returns [] for zero panels", () => {
    expect(resolvePanelSizes([])).toEqual([]);
    expect(resolvePanelSizes([], [])).toEqual([]);
  });

  it("throws when preferred length mismatches", () => {
    expect(() => resolvePanelSizes([], [50])).toThrow(RangeError);
    expect(() => resolvePanelSizes([{}, {}], [50])).toThrow(RangeError);
    expect(() => resolvePanelSizes([{}], [10, 20])).toThrow(RangeError);
  });

  it("resolves a single panel to 100", () => {
    expect(resolvePanelSizes([{}])).toEqual([100]);
    expect(resolvePanelSizes([{ defaultSize: 30 }])).toEqual([100]);
  });

  it("splits two unconstrained panels equally", () => {
    const out = resolvePanelSizes([{}, {}]);
    expect(out).toHaveLength(2);
    expect(out[0]).toBeCloseTo(50, 9);
    expect(out[1]).toBeCloseTo(50, 9);
    expect(sum(out)).toBeCloseTo(100, 9);
  });

  it("shares remaining budget with unspecified panels (underspecified)", () => {
    expect(resolvePanelSizes([{ defaultSize: 30 }, {}])).toEqual([30, 70]);
    const three = resolvePanelSizes([{ defaultSize: 20 }, {}, {}]);
    expect(three[0]).toBeCloseTo(20, 9);
    expect(three[1]).toBeCloseTo(40, 9);
    expect(three[2]).toBeCloseTo(40, 9);
  });

  it("normalizes overspecified defaults", () => {
    const out = resolvePanelSizes([
      { defaultSize: 80 },
      { defaultSize: 80 },
    ]);
    expect(out[0]).toBeCloseTo(50, 9);
    expect(out[1]).toBeCloseTo(50, 9);
  });

  it("maps all-zero weights to equal shares", () => {
    const out = resolvePanelSizes([
      { defaultSize: 0 },
      { defaultSize: 0 },
    ]);
    expect(out[0]).toBeCloseTo(50, 9);
    expect(out[1]).toBeCloseTo(50, 9);
    const pref = resolvePanelSizes([{}, {}], [0, 0]);
    expect(pref[0]).toBeCloseTo(50, 9);
    expect(pref[1]).toBeCloseTo(50, 9);
  });

  it("uses preferred exact weights when provided", () => {
    const out = resolvePanelSizes([{}, {}], [80, 20]);
    expect(out[0]).toBeCloseTo(80, 9);
    expect(out[1]).toBeCloseTo(20, 9);
  });

  it("saturates min constraints with redistribution", () => {
    const out = resolvePanelSizes([{ minSize: 60 }, { minSize: 10 }]);
    expect(out[0]).toBeCloseTo(60, 9);
    expect(out[1]).toBeCloseTo(40, 9);
  });

  it("saturates max constraints with redistribution", () => {
    const out = resolvePanelSizes([{ maxSize: 30 }, {}]);
    expect(out[0]).toBeCloseTo(30, 9);
    expect(out[1]).toBeCloseTo(70, 9);
  });

  it("handles 3+ panels with mixed bounds", () => {
    const out = resolvePanelSizes([
      { minSize: 50 },
      { minSize: 30 },
      { minSize: 10 },
    ]);
    expect(out).toHaveLength(3);
    expect(sum(out)).toBeCloseTo(100, 6);
    expect(out[0] as number).toBeGreaterThanOrEqual(50 - 1e-9);
    expect(out[1] as number).toBeGreaterThanOrEqual(30 - 1e-9);
    expect(out[2] as number).toBeGreaterThanOrEqual(10 - 1e-9);
    expect(out[0]).toBeCloseTo(50, 6);
    expect(out[1]).toBeCloseTo(30, 6);
    expect(out[2]).toBeCloseTo(20, 6);
  });

  it("normalizes huge finite preferences without overflow", () => {
    const out = resolvePanelSizes(
      [
        { minSize: 0, maxSize: 100 },
        { minSize: 0, maxSize: 100 },
      ],
      [1e308, 1e308],
    );
    expect(out[0]).toBeCloseTo(50, 9);
    expect(out[1]).toBeCloseTo(50, 9);
    for (const v of out) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
    const skewed = resolvePanelSizes(
      [
        { minSize: 0, maxSize: 100 },
        { minSize: 0, maxSize: 100 },
      ],
      [1e308, 5e307],
    );
    expect(sum(skewed)).toBeCloseTo(100, 6);
    expect(skewed[0] as number).toBeGreaterThan(skewed[1] as number);
    expect(skewed[0]).toBeCloseTo(66.66666666666667, 6);
  });

  it("clamps finite out-of-range preferred/defaults instead of throwing", () => {
    const out = resolvePanelSizes(
      [
        { minSize: 0, maxSize: 100 },
        { minSize: 0, maxSize: 100 },
      ],
      [200, 0],
    );
    expect(out[0]).toBeCloseTo(100, 9);
    expect(out[1]).toBeCloseTo(0, 9);
    const neg = resolvePanelSizes(
      [
        { minSize: 0, maxSize: 100 },
        { minSize: 0, maxSize: 100 },
      ],
      [-10, 110],
    );
    expect(neg[0]).toBeCloseTo(0, 9);
    expect(neg[1]).toBeCloseTo(100, 9);
  });

  it("handles overflow of explicit defaults without leaving holes", () => {
    const out = resolvePanelSizes([
      { defaultSize: Number.MAX_VALUE, minSize: 0, maxSize: 100 },
      { defaultSize: Number.MAX_VALUE, minSize: 0, maxSize: 100 },
      { defaultSize: 30, minSize: 0, maxSize: 100 },
    ]);
    expect(out).toHaveLength(3);
    for (const v of out) {
      expect(Number.isFinite(v)).toBe(true);
      expect(Number.isNaN(v)).toBe(false);
      expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(sum(out)).toBeCloseTo(100, 6);
    expect(out[0]).toBeCloseTo(50, 6);
    expect(out[1]).toBeCloseTo(50, 6);
    expect(out[2]).toBeCloseTo(0, 6);
    const trailing = resolvePanelSizes([
      { defaultSize: Number.MAX_VALUE, minSize: 0, maxSize: 100 },
      { defaultSize: Number.MAX_VALUE, minSize: 0, maxSize: 100 },
      { minSize: 0, maxSize: 100 },
    ]);
    expect(trailing).toHaveLength(3);
    for (const v of trailing) {
      expect(Number.isFinite(v)).toBe(true);
      expect(Number.isNaN(v)).toBe(false);
    }
    expect(sum(trailing)).toBeCloseTo(100, 6);
    expect(trailing[0]).toBeCloseTo(50, 6);
    expect(trailing[1]).toBeCloseTo(50, 6);
    expect(trailing[2]).toBeCloseTo(0, 6);
  });

  it("rejects impossible and invalid bounds", () => {
    expect(() => resolvePanelSizes([{ minSize: 60 }, { minSize: 60 }])).toThrow(
      RangeError,
    );
    expect(() =>
      resolvePanelSizes([{ maxSize: 30 }, { maxSize: 30 }]),
    ).toThrow(RangeError);
    expect(() => resolvePanelSizes([{ minSize: 80, maxSize: 20 }])).toThrow(
      RangeError,
    );
    expect(() => resolvePanelSizes([{ minSize: -1 }])).toThrow(RangeError);
    expect(() => resolvePanelSizes([{ maxSize: -5 }])).toThrow(RangeError);
    expect(() => resolvePanelSizes([{ minSize: 101 }])).toThrow(RangeError);
    expect(() => resolvePanelSizes([{ maxSize: 101 }])).toThrow(RangeError);
    expect(() => resolvePanelSizes([{ minSize: Number.NaN }])).toThrow(
      RangeError,
    );
    expect(() =>
      resolvePanelSizes([{ maxSize: Number.POSITIVE_INFINITY }]),
    ).toThrow(RangeError);
    expect(() =>
      resolvePanelSizes([{ defaultSize: Number.NaN }]),
    ).toThrow(RangeError);
    expect(() =>
      resolvePanelSizes([{ defaultSize: Number.POSITIVE_INFINITY }]),
    ).toThrow(RangeError);
    expect(() => resolvePanelSizes([{}, {}], [50, Number.NaN])).toThrow(
      RangeError,
    );
    expect(() =>
      resolvePanelSizes([{}, {}], [50, Number.POSITIVE_INFINITY]),
    ).toThrow(RangeError);
  });

  it("keeps output feasible, finite, nonnegative and unmutated", () => {
    const panels = [{ defaultSize: 70, minSize: 20, maxSize: 80 }, {}] as const;
    const preferred = [90, 10] as const;
    const panelsCopy = JSON.parse(JSON.stringify(panels));
    const preferredCopy = [...preferred];
    const out = resolvePanelSizes(panels, preferred);
    expect(sum(out)).toBeCloseTo(100, 6);
    for (const v of out) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(v)).toBe(false);
    }
    expect(out[0] as number).toBeLessThanOrEqual(80 + 1e-9);
    expect(out[0] as number).toBeGreaterThanOrEqual(20 - 1e-9);
    expect(panels).toEqual(panelsCopy);
    expect([...preferred]).toEqual(preferredCopy);
  });
});

describe("resizePanelPair", () => {
  it("moves delta from trailing to leading and preserves others", () => {
    const panels = [{}, {}, {}];
    const sizes = [34, 33, 33];
    const total = sum(sizes);
    expect(Math.abs(total - 100) < 1e-6).toBe(true);
    const next = resizePanelPair(sizes, 0, 10, panels);
    expect(next[0]).toBeCloseTo(44, 9);
    expect(next[1]).toBeCloseTo(23, 9);
    expect(next[2]).toBeCloseTo(33, 9);
    expect(sum(next)).toBeCloseTo(100, 9);
    expect(sizes).toEqual([34, 33, 33]);
  });

  it("clamps to both min and max limits", () => {
    const panels = [{ minSize: 15, maxSize: 100 }, { minSize: 15, maxSize: 100 }];
    expect(resizePanelPair([50, 50], 0, 100, panels)).toEqual([85, 15]);
    expect(resizePanelPair([50, 50], 0, -100, panels)).toEqual([15, 85]);
  });

  it("clamps to maxSize on both sides", () => {
    const panels = [{ maxSize: 60 }, { maxSize: 60 }];
    const next = resizePanelPair([50, 50], 0, 20, panels);
    expect(next[0]).toBeCloseTo(60, 9);
    expect(next[1]).toBeCloseTo(40, 9);
    const prev = resizePanelPair([50, 50], 0, -20, panels);
    expect(prev[0]).toBeCloseTo(40, 9);
    expect(prev[1]).toBeCloseTo(60, 9);
  });

  it("returns a copy noop for invalid index or nonfinite delta", () => {
    const sizes = [50, 50];
    const panels = [{}, {}];
    const a = resizePanelPair(sizes, 5, 10, panels);
    expect(a).toEqual([50, 50]);
    expect(a).not.toBe(sizes);
    expect(resizePanelPair(sizes, -1, 10, panels)).toEqual([50, 50]);
    expect(resizePanelPair(sizes, 1, 10, panels)).toEqual([50, 50]);
    expect(resizePanelPair(sizes, 0, Number.NaN, panels)).toEqual([50, 50]);
    expect(resizePanelPair(sizes, 0, Number.POSITIVE_INFINITY, panels)).toEqual([
      50, 50,
    ]);
    expect(sizes).toEqual([50, 50]);
  });

  it("does not reset other panels on noop", () => {
    const sizes = [30, 40, 30];
    const panels = [{}, {}, {}];
    const next = resizePanelPair(sizes, 9, 10, panels);
    expect(next).toEqual([30, 40, 30]);
  });

  it("throws clearly for invalid sizes instead of lossy resize", () => {
    const panels = [{}, {}];
    expect(() => resizePanelPair([50, Number.NaN], 0, 5, panels)).toThrow(
      RangeError,
    );
    expect(() => resizePanelPair([50, 40], 0, 5, panels)).toThrow(RangeError);
    expect(() => resizePanelPair([50], 0, 5, panels)).toThrow(RangeError);
    expect(() => resizePanelPair([10, 90], 0, 5, [{ minSize: 15 }, {}])).toThrow(
      RangeError,
    );
  });

  it("handles zero/one panels as noop copies", () => {
    expect(resizePanelPair([], 0, 10, [])).toEqual([]);
    expect(resizePanelPair([100], 0, 10, [{}])).toEqual([100]);
  });
});

describe("getPanelPairBounds", () => {
  it("computes leading feasible bounds", () => {
    const bounds = getPanelPairBounds([50, 50], 0, [{}, {}]);
    expect(bounds).toEqual({ min: 15, max: 85, now: 50 });
  });

  it("accounts for custom min/max on both sides", () => {
    const bounds = getPanelPairBounds(
      [40, 60],
      0,
      [{ minSize: 20, maxSize: 70 }, { minSize: 30, maxSize: 80 }],
    );
    expect(bounds).toEqual({ min: 20, max: 70, now: 40 });
    const tight = getPanelPairBounds(
      [60, 40],
      0,
      [{ minSize: 10, maxSize: 100 }, { minSize: 10, maxSize: 50 }],
    );
    expect(tight).toEqual({ min: 50, max: 90, now: 60 });
  });

  it("returns null for invalid pairs", () => {
    expect(getPanelPairBounds([50, 50], 1, [{}, {}])).toBeNull();
    expect(getPanelPairBounds([50, 50], -1, [{}, {}])).toBeNull();
    expect(getPanelPairBounds([50, 50], 0.5, [{}, {}])).toBeNull();
    expect(getPanelPairBounds([50], 0, [{}])).toBeNull();
    expect(getPanelPairBounds([], 0, [])).toBeNull();
    expect(getPanelPairBounds([50, 50], 0, [{}])).toBeNull();
    expect(
      getPanelPairBounds([50, Number.NaN], 0, [{}, {}]),
    ).toBeNull();
    expect(getPanelPairBounds([50, 40], 0, [{}, {}])).toBeNull();
  });
});
