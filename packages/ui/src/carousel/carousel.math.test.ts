import { describe, expect, it } from "vitest";
import {
  carouselIndexForOffset,
  carouselOffsetForIndex,
  normalizeCarouselIndex,
} from "./carousel.math";

describe("normalizeCarouselIndex", () => {
  it("returns 0 for empty or invalid counts", () => {
    expect(normalizeCarouselIndex(0, 0)).toBe(0);
    expect(normalizeCarouselIndex(2, 0)).toBe(0);
    expect(normalizeCarouselIndex(0, -3)).toBe(0);
    expect(normalizeCarouselIndex(1, Number.NaN)).toBe(0);
    expect(normalizeCarouselIndex(1, Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeCarouselIndex(1, Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it("floors fractional counts", () => {
    expect(normalizeCarouselIndex(2, 3.9)).toBe(2);
    expect(normalizeCarouselIndex(5, 3.9)).toBe(2);
    expect(normalizeCarouselIndex(0, 0.9)).toBe(0);
  });

  it("always returns 0 for a single page", () => {
    expect(normalizeCarouselIndex(0, 1)).toBe(0);
    expect(normalizeCarouselIndex(99, 1)).toBe(0);
    expect(normalizeCarouselIndex(-99, 1)).toBe(0);
  });

  it("returns 0 for non-finite indices", () => {
    expect(normalizeCarouselIndex(Number.NaN, 3)).toBe(0);
    expect(normalizeCarouselIndex(Number.POSITIVE_INFINITY, 3)).toBe(0);
    expect(normalizeCarouselIndex(Number.NEGATIVE_INFINITY, 3)).toBe(0);
  });

  it("truncates fractional indices toward zero then clamps", () => {
    expect(normalizeCarouselIndex(1.9, 3)).toBe(1);
    expect(normalizeCarouselIndex(2.9, 3)).toBe(2);
    expect(normalizeCarouselIndex(-1.9, 3)).toBe(0);
    expect(normalizeCarouselIndex(-0.5, 3)).toBe(0);
  });

  it("clamps out-of-range indices", () => {
    expect(normalizeCarouselIndex(-1, 3)).toBe(0);
    expect(normalizeCarouselIndex(-100, 3)).toBe(0);
    expect(normalizeCarouselIndex(3, 3)).toBe(2);
    expect(normalizeCarouselIndex(100, 3)).toBe(2);
  });

  it("clamps a previously valid index when the count shrinks", () => {
    expect(normalizeCarouselIndex(4, 5)).toBe(4);
    expect(normalizeCarouselIndex(4, 3)).toBe(2);
    expect(normalizeCarouselIndex(2, 3)).toBe(2);
    expect(normalizeCarouselIndex(2, 1)).toBe(0);
  });

  it("never returns -0", () => {
    expect(Object.is(normalizeCarouselIndex(-0, 3), -0)).toBe(false);
    expect(Object.is(normalizeCarouselIndex(-0.5, 3), -0)).toBe(false);
    expect(normalizeCarouselIndex(-0, 3)).toBe(0);
  });

  it("does not mutate numeric inputs", () => {
    const index = 1.9;
    const count = 3.9;
    normalizeCarouselIndex(index, count);
    expect(index).toBe(1.9);
    expect(count).toBe(3.9);
  });
});

describe("carouselOffsetForIndex", () => {
  it("maps LTR indices to extent multiples", () => {
    expect(carouselOffsetForIndex(0, 3, 100)).toBe(0);
    expect(carouselOffsetForIndex(1, 3, 100)).toBe(100);
    expect(carouselOffsetForIndex(2, 3, 100)).toBe(200);
  });

  it("clamps out-of-range and fractional indices", () => {
    expect(carouselOffsetForIndex(10, 3, 100)).toBe(200);
    expect(carouselOffsetForIndex(-5, 3, 100)).toBe(0);
    expect(carouselOffsetForIndex(1.9, 3, 100)).toBe(100);
    expect(carouselOffsetForIndex(Number.NaN, 3, 100)).toBe(0);
    expect(carouselOffsetForIndex(Number.POSITIVE_INFINITY, 3, 100)).toBe(0);
  });

  it("maps reversed (RTL) indices from the far edge", () => {
    expect(carouselOffsetForIndex(0, 3, 100, true)).toBe(200);
    expect(carouselOffsetForIndex(1, 3, 100, true)).toBe(100);
    expect(carouselOffsetForIndex(2, 3, 100, true)).toBe(0);
    expect(carouselOffsetForIndex(10, 3, 100, true)).toBe(0);
    expect(carouselOffsetForIndex(-5, 3, 100, true)).toBe(200);
  });

  it("returns null for invalid or empty counts", () => {
    expect(carouselOffsetForIndex(0, 0, 100)).toBeNull();
    expect(carouselOffsetForIndex(0, -2, 100)).toBeNull();
    expect(carouselOffsetForIndex(0, Number.NaN, 100)).toBeNull();
    expect(carouselOffsetForIndex(0, Number.POSITIVE_INFINITY, 100)).toBeNull();
  });

  it("returns null for invalid layouts", () => {
    expect(carouselOffsetForIndex(0, 3, 0)).toBeNull();
    expect(carouselOffsetForIndex(0, 3, -100)).toBeNull();
    expect(carouselOffsetForIndex(0, 3, Number.NaN)).toBeNull();
    expect(carouselOffsetForIndex(0, 3, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("returns null on product overflow and unrepresentable offsets", () => {
    expect(carouselOffsetForIndex(1, 3, Number.MAX_VALUE)).toBeNull();
    expect(carouselOffsetForIndex(2, 3, Number.MAX_SAFE_INTEGER)).toBeNull();
    // First page stays representable even with a huge extent.
    expect(carouselOffsetForIndex(0, 3, Number.MAX_SAFE_INTEGER)).toBe(0);
  });

  it("never returns -0", () => {
    expect(Object.is(carouselOffsetForIndex(0, 3, 100), -0)).toBe(false);
    expect(Object.is(carouselOffsetForIndex(2, 3, 100, true), -0)).toBe(false);
  });
});

describe("carouselIndexForOffset", () => {
  it("maps LTR offsets to the nearest page", () => {
    expect(carouselIndexForOffset(0, 3, 100)).toBe(0);
    expect(carouselIndexForOffset(100, 3, 100)).toBe(1);
    expect(carouselIndexForOffset(200, 3, 100)).toBe(2);
  });

  it("rounds half pages up", () => {
    expect(carouselIndexForOffset(50, 3, 100)).toBe(1);
    expect(carouselIndexForOffset(150, 3, 100)).toBe(2);
    expect(carouselIndexForOffset(49, 3, 100)).toBe(0);
    expect(carouselIndexForOffset(51, 3, 100)).toBe(1);
  });

  it("clamps out-of-range offsets", () => {
    expect(carouselIndexForOffset(-10, 3, 100)).toBe(0);
    expect(carouselIndexForOffset(-1e9, 3, 100)).toBe(0);
    expect(carouselIndexForOffset(201, 3, 100)).toBe(2);
    expect(carouselIndexForOffset(1e9, 3, 100)).toBe(2);
  });

  it("maps reversed (RTL) offsets from the far edge", () => {
    expect(carouselIndexForOffset(0, 3, 100, true)).toBe(2);
    expect(carouselIndexForOffset(100, 3, 100, true)).toBe(1);
    expect(carouselIndexForOffset(200, 3, 100, true)).toBe(0);
    expect(carouselIndexForOffset(-10, 3, 100, true)).toBe(2);
    expect(carouselIndexForOffset(1e9, 3, 100, true)).toBe(0);
    expect(carouselIndexForOffset(50, 3, 100, true)).toBe(1);
  });

  it("returns 0 for any offset with a single page", () => {
    expect(carouselIndexForOffset(0, 1, 100)).toBe(0);
    expect(carouselIndexForOffset(50, 1, 100)).toBe(0);
    expect(carouselIndexForOffset(1e9, 1, 100)).toBe(0);
  });

  it("returns null for non-finite offsets", () => {
    expect(carouselIndexForOffset(Number.NaN, 3, 100)).toBeNull();
    expect(carouselIndexForOffset(Number.POSITIVE_INFINITY, 3, 100)).toBeNull();
    expect(carouselIndexForOffset(Number.NEGATIVE_INFINITY, 3, 100)).toBeNull();
  });

  it("returns null for invalid counts and layouts", () => {
    expect(carouselIndexForOffset(0, 0, 100)).toBeNull();
    expect(carouselIndexForOffset(0, -1, 100)).toBeNull();
    expect(carouselIndexForOffset(0, Number.NaN, 100)).toBeNull();
    expect(carouselIndexForOffset(0, 3, 0)).toBeNull();
    expect(carouselIndexForOffset(0, 3, -5)).toBeNull();
    expect(carouselIndexForOffset(0, 3, Number.NaN)).toBeNull();
    expect(carouselIndexForOffset(0, 3, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("rejects unrepresentable offsets and layouts", () => {
    expect(
      carouselIndexForOffset(Number.MAX_SAFE_INTEGER + 1, 3, 100),
    ).toBeNull();
    expect(carouselIndexForOffset(0, 3, Number.MAX_VALUE)).toBeNull();
    expect(
      carouselIndexForOffset(0, Number.MAX_SAFE_INTEGER, 100),
    ).toBeNull();
  });

  it("treats -0 offset as 0", () => {
    expect(carouselIndexForOffset(-0, 3, 100)).toBe(0);
    expect(carouselIndexForOffset(-0, 3, 100, true)).toBe(2);
  });
});

describe("roundtrip", () => {
  const counts = [1, 2, 3, 5];
  const extents = [1, 100, 320.5];

  for (const reversed of [false, true]) {
    it(`roundtrips every index (reversed=${reversed})`, () => {
      for (const count of counts) {
        for (const extent of extents) {
          for (let index = 0; index < count; index += 1) {
            const offset = carouselOffsetForIndex(index, count, extent, reversed);
            expect(offset).not.toBeNull();
            expect(Number.isFinite(offset!)).toBe(true);
            expect(Object.is(offset, -0)).toBe(false);
            expect(carouselIndexForOffset(offset!, count, extent, reversed)).toBe(
              index,
            );
          }
        }
      }
    });
  }
});

describe("grid invariants", () => {
  it("holds deterministic invariants across count/extent/index grid", () => {
    const counts = [0, 1, 2, 3, 5, 3.9, Number.NaN, Number.POSITIVE_INFINITY];
    const extents = [0, -10, 50, 100, 200.5, Number.NaN, Number.POSITIVE_INFINITY];
    const indices = [-2, -1, -0.5, 0, 1, 1.9, 2, 4, 100, Number.NaN];
    const offsets = [
      -100, -0, 0, 25, 50, 75, 100, 150, 200, 400, Number.NaN,
      Number.POSITIVE_INFINITY,
    ];

    for (const count of counts) {
      for (const index of indices) {
        const normalized = normalizeCarouselIndex(index, count);
        expect(Number.isInteger(normalized)).toBe(true);
        expect(Object.is(normalized, -0)).toBe(false);
        if (!Number.isFinite(count) || Math.floor(count) <= 0) {
          expect(normalized).toBe(0);
        } else {
          const total = Math.floor(count);
          expect(normalized).toBeGreaterThanOrEqual(0);
          expect(normalized).toBeLessThanOrEqual(total - 1);
        }
      }

      for (const extent of extents) {
        const extentValid =
          Number.isFinite(extent) && (extent as number) > 0;
        for (const index of indices) {
          for (const reversed of [false, true]) {
            const offset = carouselOffsetForIndex(index, count, extent, reversed);
            if (
              !Number.isFinite(count) ||
              Math.floor(count) <= 0 ||
              !extentValid
            ) {
              expect(offset).toBeNull();
            } else if (offset !== null) {
              expect(Number.isFinite(offset)).toBe(true);
              expect(Object.is(offset, -0)).toBe(false);
              const total = Math.floor(count);
              expect(offset).toBeGreaterThanOrEqual(0);
              expect(offset).toBeLessThanOrEqual(
                (total - 1) * (extent as number),
              );
              // Clamped index roundtrips through the offset.
              const logical = normalizeCarouselIndex(index, count);
              expect(
                carouselIndexForOffset(offset, count, extent, reversed),
              ).toBe(logical);
            }
          }
        }

        for (const offset of offsets) {
          for (const reversed of [false, true]) {
            const resolved = carouselIndexForOffset(offset, count, extent, reversed);
            if (
              !Number.isFinite(offset) ||
              !Number.isFinite(count) ||
              Math.floor(count) <= 0 ||
              !extentValid
            ) {
              // NaN/Infinity offsets always null; other invalid layouts null.
              // (Infinity offsets are non-finite and rejected.)
              if (!Number.isFinite(offset)) {
                expect(resolved).toBeNull();
              } else {
                expect(resolved).toBeNull();
              }
            } else if (resolved !== null) {
              const total = Math.floor(count);
              expect(Number.isInteger(resolved)).toBe(true);
              expect(resolved).toBeGreaterThanOrEqual(0);
              expect(resolved).toBeLessThanOrEqual(total - 1);
            }
          }
        }
      }
    }
  });
});
