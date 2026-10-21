import { describe, expect, it } from "vitest";
import {
  nearestSliderThumb,
  normalizeSliderConfig,
  normalizeSliderValues,
  sliderRatioForValue,
  sliderValueFromOffset,
  stepSliderThumb,
  updateSliderThumb,
} from "./slider.math";

describe("normalizeSliderConfig", () => {
  it("applies defaults for undefined options", () => {
    expect(normalizeSliderConfig()).toEqual({
      min: 0,
      max: 100,
      step: 1,
      orientation: "horizontal",
      dir: "ltr",
      inverted: false,
    });
  });

  it("applies partial defaults", () => {
    expect(normalizeSliderConfig({ min: 5 })).toEqual({
      min: 5,
      max: 100,
      step: 1,
      orientation: "horizontal",
      dir: "ltr",
      inverted: false,
    });
  });

  it("allows equal min and max", () => {
    expect(normalizeSliderConfig({ min: 42, max: 42 })).toMatchObject({
      min: 42,
      max: 42,
    });
  });

  it("rejects non-finite min/max", () => {
    expect(() => normalizeSliderConfig({ min: Number.NaN })).toThrow(RangeError);
    expect(() => normalizeSliderConfig({ max: Number.POSITIVE_INFINITY })).toThrow(
      RangeError,
    );
  });

  it("rejects max < min", () => {
    expect(() => normalizeSliderConfig({ min: 10, max: 5 })).toThrow(RangeError);
  });

  it("rejects non-positive or non-finite step", () => {
    expect(() => normalizeSliderConfig({ step: 0 })).toThrow(RangeError);
    expect(() => normalizeSliderConfig({ step: -1 })).toThrow(RangeError);
    expect(() => normalizeSliderConfig({ step: Number.NaN })).toThrow(RangeError);
    expect(() => normalizeSliderConfig({ step: Number.POSITIVE_INFINITY })).toThrow(
      RangeError,
    );
  });

  it("rejects unrepresentable span overflow", () => {
    expect(() =>
      normalizeSliderConfig({ min: -Number.MAX_VALUE, max: Number.MAX_VALUE }),
    ).toThrow(RangeError);
  });

  it("rejects unrepresentable step-count overflow", () => {
    expect(() =>
      normalizeSliderConfig({ min: 0, max: 100, step: 1e-20 }),
    ).toThrow(RangeError);
    expect(() =>
      normalizeSliderConfig({ min: 0, max: 1, step: Number.MIN_VALUE }),
    ).toThrow(RangeError);
  });
});

describe("normalizeSliderValues", () => {
  it("falls back to [min] for undefined or empty input", () => {
    const config = normalizeSliderConfig();
    expect(normalizeSliderValues(undefined, config)).toEqual([0]);
    expect(normalizeSliderValues([], config)).toEqual([0]);
    const custom = normalizeSliderConfig({ min: 7 });
    expect(normalizeSliderValues(undefined, custom)).toEqual([7]);
  });

  it("maps non-finite entries to min", () => {
    const config = normalizeSliderConfig();
    expect(
      normalizeSliderValues([Number.NaN, Number.POSITIVE_INFINITY, 50], config),
    ).toEqual([0, 0, 50]);
  });

  it("sorts ascending", () => {
    const config = normalizeSliderConfig();
    expect(normalizeSliderValues([80, 20, 50], config)).toEqual([20, 50, 80]);
  });

  it("snaps to the min-offset grid (not zero-based)", () => {
    const config = normalizeSliderConfig({ min: 5, max: 100, step: 10 });
    // Grid is 5, 15, 25, ...; 12 is closer to 15, 8 is closer to 5.
    expect(normalizeSliderValues([12], config)).toEqual([15]);
    expect(normalizeSliderValues([8], config)).toEqual([5]);
    // Zero-based snapping would keep 4 on 4; min-offset grid moves it to 5.
    const offset = normalizeSliderConfig({ min: 1, max: 10, step: 2 });
    expect(normalizeSliderValues([4], offset)).toEqual([5]);
  });

  it("avoids float artifacts for decimal steps", () => {
    const config = normalizeSliderConfig({ min: 0, max: 1, step: 0.1 });
    expect(normalizeSliderValues([0.30000000000000004], config)).toEqual([0.3]);
    expect(normalizeSliderValues([0.16], config)).toEqual([0.2]);
    expect(normalizeSliderValues([0.14], config)).toEqual([0.1]);
    expect(normalizeSliderValues([0.1 + 0.2], config)).toEqual([0.3]);
  });

  it("clamps out-of-range values to global endpoints", () => {
    const config = normalizeSliderConfig({ min: 0, max: 100, step: 1 });
    expect(normalizeSliderValues([-50, 500], config)).toEqual([0, 100]);
    expect(normalizeSliderValues([0, 100], config)).toEqual([0, 100]);
  });
});

describe("sliderValueFromOffset", () => {
  it("returns null for non-finite or non-positive size", () => {
    const config = normalizeSliderConfig();
    expect(sliderValueFromOffset(10, 0, config)).toBeNull();
    expect(sliderValueFromOffset(10, -50, config)).toBeNull();
    expect(sliderValueFromOffset(10, Number.NaN, config)).toBeNull();
    expect(sliderValueFromOffset(10, Number.POSITIVE_INFINITY, config)).toBeNull();
  });

  it("returns null for NaN offset", () => {
    const config = normalizeSliderConfig();
    expect(sliderValueFromOffset(Number.NaN, 100, config)).toBeNull();
  });

  it("clamps out-of-bounds offsets", () => {
    const config = normalizeSliderConfig();
    expect(sliderValueFromOffset(-20, 100, config)).toBe(0);
    expect(sliderValueFromOffset(500, 100, config)).toBe(100);
  });

  it("maps horizontal LTR with min on the left", () => {
    const config = normalizeSliderConfig();
    expect(sliderValueFromOffset(0, 100, config)).toBe(0);
    expect(sliderValueFromOffset(100, 100, config)).toBe(100);
    expect(sliderValueFromOffset(50, 100, config)).toBe(50);
  });

  it("reverses horizontal RTL", () => {
    const config = normalizeSliderConfig({ dir: "rtl" });
    expect(sliderValueFromOffset(0, 100, config)).toBe(100);
    expect(sliderValueFromOffset(100, 100, config)).toBe(0);
    expect(sliderValueFromOffset(25, 100, config)).toBe(75);
  });

  it("keeps vertical min at the bottom", () => {
    const config = normalizeSliderConfig({ orientation: "vertical" });
    expect(sliderValueFromOffset(0, 100, config)).toBe(100);
    expect(sliderValueFromOffset(100, 100, config)).toBe(0);
    expect(sliderValueFromOffset(25, 200, config)).toBe(88);
  });

  it("toggles mapping when inverted", () => {
    const base = normalizeSliderConfig();
    const inverted = normalizeSliderConfig({ inverted: true });
    expect(sliderValueFromOffset(0, 100, inverted)).toBe(100);
    expect(sliderValueFromOffset(100, 100, inverted)).toBe(0);
    expect(sliderValueFromOffset(0, 100, base)).toBe(0);
  });

  it("snaps decimal offsets without float artifacts", () => {
    const config = normalizeSliderConfig({ min: 0, max: 1, step: 0.1 });
    expect(sliderValueFromOffset(30, 100, config)).toBe(0.3);
  });

  it("clamps infinite offsets to endpoints", () => {
    const config = normalizeSliderConfig();
    expect(sliderValueFromOffset(Number.POSITIVE_INFINITY, 100, config)).toBe(
      100,
    );
    expect(sliderValueFromOffset(Number.NEGATIVE_INFINITY, 100, config)).toBe(
      0,
    );
  });
});

describe("sliderRatioForValue", () => {
  it("maps LTR values to physical left/top ratios", () => {
    const config = normalizeSliderConfig();
    expect(sliderRatioForValue(0, config)).toBe(0);
    expect(sliderRatioForValue(100, config)).toBe(1);
    expect(sliderRatioForValue(25, config)).toBe(0.25);
  });

  it("reverses RTL physical ratios", () => {
    const config = normalizeSliderConfig({ dir: "rtl" });
    expect(sliderRatioForValue(0, config)).toBe(1);
    expect(sliderRatioForValue(100, config)).toBe(0);
  });

  it("maps vertical min to bottom (physical 1)", () => {
    const config = normalizeSliderConfig({ orientation: "vertical" });
    expect(sliderRatioForValue(0, config)).toBe(1);
    expect(sliderRatioForValue(100, config)).toBe(0);
  });

  it("toggles physical ratio when inverted", () => {
    const base = normalizeSliderConfig();
    const inverted = normalizeSliderConfig({ inverted: true });
    expect(sliderRatioForValue(25, inverted)).toBe(
      1 - sliderRatioForValue(25, base),
    );
  });

  it("clamps out-of-range and non-finite values", () => {
    const config = normalizeSliderConfig();
    expect(sliderRatioForValue(-50, config)).toBe(0);
    expect(sliderRatioForValue(500, config)).toBe(1);
    expect(sliderRatioForValue(Number.NaN, config)).toBe(0);
  });

  it("returns a safe ratio for equal range", () => {
    const config = normalizeSliderConfig({ min: 5, max: 5 });
    expect(sliderRatioForValue(5, config)).toBe(0);
    expect(sliderRatioForValue(999, config)).toBe(0);
  });
});

describe("offset/ratio roundtrip", () => {
  const size = 200;
  const cases = [
    normalizeSliderConfig(),
    normalizeSliderConfig({ dir: "rtl" }),
    normalizeSliderConfig({ orientation: "vertical" }),
    normalizeSliderConfig({ orientation: "vertical", dir: "rtl" }),
    normalizeSliderConfig({ inverted: true }),
    normalizeSliderConfig({ dir: "rtl", inverted: true }),
    normalizeSliderConfig({ orientation: "vertical", inverted: true }),
  ];
  for (const config of cases) {
    it(`roundtrips on-grid values (${config.orientation}/${config.dir}${config.inverted ? "/inverted" : ""})`, () => {
      for (const value of [0, 25, 50, 75, 100]) {
        const ratio = sliderRatioForValue(value, config);
        expect(ratio).toBeGreaterThanOrEqual(0);
        expect(ratio).toBeLessThanOrEqual(1);
        const offset = ratio * size;
        expect(sliderValueFromOffset(offset, size, config)).toBe(value);
      }
    });
  }
});

describe("nearestSliderThumb", () => {
  it("returns 0 for empty input", () => {
    expect(nearestSliderThumb([], 50)).toBe(0);
  });

  it("picks the closest thumb with stable lowest-index ties", () => {
    expect(nearestSliderThumb([0, 10], 5)).toBe(0);
    expect(nearestSliderThumb([0, 100], 80)).toBe(1);
    expect(nearestSliderThumb([0, 50, 100], 49)).toBe(1);
  });

  it("prefers the higher index on ties when requested", () => {
    expect(nearestSliderThumb([0, 10], 5, true)).toBe(1);
    expect(nearestSliderThumb([0, 10], 5, false)).toBe(0);
  });

  it("handles duplicate thumbs deterministically", () => {
    expect(nearestSliderThumb([50, 50, 50], 0)).toBe(0);
    expect(nearestSliderThumb([50, 50, 50], 0, true)).toBe(2);
    expect(nearestSliderThumb([20, 20, 80], 20)).toBe(0);
    expect(nearestSliderThumb([20, 20, 80], 20, true)).toBe(1);
  });
});

describe("updateSliderThumb", () => {
  it("moves the selected thumb and leaves others unchanged", () => {
    const config = normalizeSliderConfig();
    const values = [0, 50, 100];
    const next = updateSliderThumb(values, 1, 80, config);
    expect(next).toEqual([0, 80, 100]);
    expect(values).toEqual([0, 50, 100]);
  });

  it("snaps the target to the min-offset grid", () => {
    const config = normalizeSliderConfig({ min: 5, max: 100, step: 10 });
    expect(updateSliderThumb([5, 50], 1, 12, config)).toEqual([5, 15]);
  });

  it("prevents crossing by clamping between neighbors (equality allowed)", () => {
    const config = normalizeSliderConfig();
    expect(updateSliderThumb([20, 80], 0, 90, config)).toEqual([80, 80]);
    expect(updateSliderThumb([20, 80], 1, 10, config)).toEqual([20, 20]);
    // Interior thumb clamped on both sides without reordering.
    expect(updateSliderThumb([0, 50, 100], 1, 500, config)).toEqual([
      0, 100, 100,
    ]);
    expect(updateSliderThumb([0, 50, 100], 1, -500, config)).toEqual([
      0, 0, 100,
    ]);
  });

  it("preserves index order for accessibility deltas", () => {
    const config = normalizeSliderConfig({ min: 0, max: 100, step: 1 });
    const values = [30, 31];
    // A +1 delta on the lower thumb would cross; it must stop at its neighbor.
    expect(updateSliderThumb(values, 0, 31 + 1, config)).toEqual([31, 31]);
    // A -1 delta on the upper thumb stops at the lower neighbor.
    expect(updateSliderThumb(values, 1, 30 - 1, config)).toEqual([30, 30]);
  });

  it("returns a copy for out-of-range indexes", () => {
    const config = normalizeSliderConfig();
    expect(updateSliderThumb([10, 20], 5, 50, config)).toEqual([10, 20]);
    expect(updateSliderThumb([10, 20], -1, 50, config)).toEqual([10, 20]);
  });

  it("supports equal range without crossing", () => {
    const config = normalizeSliderConfig({ min: 5, max: 5 });
    expect(updateSliderThumb([5, 5], 0, 999, config)).toEqual([5, 5]);
  });

  it("saturates non-finite targets instead of resetting", () => {
    const config = normalizeSliderConfig();
    expect(updateSliderThumb([50], 0, Number.POSITIVE_INFINITY, config)).toEqual([
      100,
    ]);
    expect(updateSliderThumb([50], 0, Number.NEGATIVE_INFINITY, config)).toEqual([
      0,
    ]);
    expect(updateSliderThumb([50], 0, Number.NaN, config)).toEqual([0]);
  });

  it("keeps a valid large-range endpoint on increment overflow", () => {
    const config = normalizeSliderConfig({ min: 0, max: 1e308, step: 1e308 });
    expect(updateSliderThumb([1e308], 0, 1e308 + 1e308, config)).toEqual([
      1e308,
    ]);
    expect(updateSliderThumb([1e308], 0, Number.POSITIVE_INFINITY, config)).toEqual(
      [1e308],
    );
    expect(updateSliderThumb([0], 0, 1e308, config)).toEqual([1e308]);
  });
});

describe("equal range", () => {
  it("normalizes every value to the single endpoint", () => {
    const config = normalizeSliderConfig({ min: 5, max: 5 });
    expect(normalizeSliderValues([1, 5, 999], config)).toEqual([5, 5, 5]);
    expect(sliderValueFromOffset(37, 100, config)).toBe(5);
    expect(sliderRatioForValue(5, config)).toBe(0);
  });
});

describe("tiny and large magnitudes", () => {
  it("preserves a valid tiny grid without rounding max to zero", () => {
    const config = normalizeSliderConfig({ min: 0, max: 1e-308, step: 1e-308 });
    expect(normalizeSliderValues([1e-308], config)).toEqual([1e-308]);
    expect(normalizeSliderValues([0], config)).toEqual([0]);
    expect(normalizeSliderValues([5e-309], config)).toEqual([1e-308]);
  });

  it("maps tiny-range offsets to endpoints without collapsing", () => {
    const config = normalizeSliderConfig({ min: 0, max: 1e-308, step: 1e-308 });
    expect(sliderValueFromOffset(0, 100, config)).toBe(0);
    expect(sliderValueFromOffset(100, 100, config)).toBe(1e-308);
    expect(sliderValueFromOffset(50, 100, config)).toBe(1e-308);
    expect(sliderRatioForValue(0, config)).toBe(0);
    expect(sliderRatioForValue(1e-308, config)).toBe(1);
  });

  it("maps large track sizes without overflow", () => {
    const config = normalizeSliderConfig();
    const size = 1_000_000;
    expect(sliderValueFromOffset(0, size, config)).toBe(0);
    expect(sliderValueFromOffset(size, size, config)).toBe(100);
    expect(sliderValueFromOffset(500_000, size, config)).toBe(50);
    expect(sliderValueFromOffset(250_000, size, config)).toBe(25);
  });

  it("keeps distinct tiny-offset grid points near a large base", () => {
    const min = 1e-300;
    const step = 1e-313;
    const config = normalizeSliderConfig({ min, max: min + 10 * step, step });
    const midpoint = min + 5 * step;
    expect(midpoint).not.toBe(min);
    expect(normalizeSliderValues([midpoint], config)).toEqual([midpoint]);
    expect(normalizeSliderValues([min], config)).toEqual([min]);
  });
});

describe("stepSliderThumb", () => {
  it("steps down from an unaligned max through grid stops (100 -> 90 -> 60)", () => {
    const config = normalizeSliderConfig({ min: 0, max: 100, step: 30 });
    expect(stepSliderThumb([100], 0, -1, config)).toEqual([90]);
    expect(stepSliderThumb([90], 0, -1, config)).toEqual([60]);
  });

  it("steps up to the unaligned max endpoint (90 -> 100)", () => {
    const config = normalizeSliderConfig({ min: 0, max: 100, step: 30 });
    expect(stepSliderThumb([90], 0, 1, config)).toEqual([100]);
  });

  it("is a noop at the ends", () => {
    const config = normalizeSliderConfig({ min: 0, max: 100, step: 30 });
    expect(stepSliderThumb([100], 0, 1, config)).toEqual([100]);
    expect(stepSliderThumb([0], 0, -1, config)).toEqual([0]);
  });

  it("supports nonzero min and decimal steps", () => {
    const offset = normalizeSliderConfig({ min: 5, max: 100, step: 10 });
    expect(stepSliderThumb([100], 0, -1, offset)).toEqual([95]);
    expect(stepSliderThumb([95], 0, 1, offset)).toEqual([100]);
    expect(stepSliderThumb([5], 0, -1, offset)).toEqual([5]);
    const decimal = normalizeSliderConfig({ min: 0, max: 1, step: 0.1 });
    expect(stepSliderThumb([0.3], 0, 1, decimal)).toEqual([0.4]);
    expect(stepSliderThumb([0.3], 0, -1, decimal)).toEqual([0.2]);
  });

  it("respects neighbor constraints", () => {
    const config = normalizeSliderConfig();
    expect(stepSliderThumb([50, 50], 0, 1, config)).toEqual([50, 50]);
    expect(stepSliderThumb([50, 50], 1, -1, config)).toEqual([50, 50]);
  });

  it("steps a tiny grid without collapsing", () => {
    const config = normalizeSliderConfig({ min: 0, max: 1e-308, step: 1e-308 });
    expect(stepSliderThumb([0], 0, 1, config)).toEqual([1e-308]);
    expect(stepSliderThumb([1e-308], 0, 1, config)).toEqual([1e-308]);
    expect(stepSliderThumb([1e-308], 0, -1, config)).toEqual([0]);
  });
});
