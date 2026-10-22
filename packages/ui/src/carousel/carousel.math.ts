/**
 * Native carousel pager index math (pure, zero runtime imports).
 *
 * No React Native, hooks, gesture, or reader semantics here — only index <->
 * offset translation shared by the native pager.
 */

function effectiveCarouselCount(count: number): number {
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return 0;
  }
  const floored = Math.floor(count);
  if (!Number.isFinite(floored) || floored <= 0) {
    return 0;
  }
  return floored;
}

function isValidCarouselExtent(extent: number): boolean {
  return typeof extent === "number" && Number.isFinite(extent) && extent > 0;
}

/** Clamp a truncated index into `0..total - 1` (total >= 1). */
function clampCarouselIndex(truncated: number, total: number): number {
  const clamped = Math.min(total - 1, Math.max(0, truncated));
  return clamped === 0 ? 0 : clamped;
}

/**
 * Normalize a pager index into `0..count - 1`.
 *
 * Count is floored; non-finite/non-positive counts and empty lists yield 0.
 * Non-finite indices yield 0; fractional indices truncate toward zero.
 */
export function normalizeCarouselIndex(index: number, count: number): number {
  const total = effectiveCarouselCount(count);
  if (total <= 0) {
    return 0;
  }
  if (typeof index !== "number" || !Number.isFinite(index)) {
    return 0;
  }
  const truncated = Math.trunc(index);
  if (!Number.isFinite(truncated)) {
    return 0;
  }
  return clampCarouselIndex(truncated, total);
}

/**
 * Layout offset for a page index. `reversed` mirrors the pager (RTL):
 * physical page = `count - 1 - index`.
 *
 * Returns null for invalid/empty counts, non-finite/non-positive extents,
 * or unrepresentable (non-finite / beyond max-safe-integer) products.
 */
export function carouselOffsetForIndex(
  index: number,
  count: number,
  extent: number,
  reversed = false,
): number | null {
  const total = effectiveCarouselCount(count);
  if (total <= 0) {
    return null;
  }
  if (!isValidCarouselExtent(extent)) {
    return null;
  }
  const logical = normalizeCarouselIndex(index, total);
  const physical = reversed ? total - 1 - logical : logical;
  const offset = physical * extent;
  if (!Number.isFinite(offset)) {
    return null;
  }
  if (Math.abs(offset) > Number.MAX_SAFE_INTEGER) {
    return null;
  }
  return offset === 0 ? 0 : offset;
}

/**
 * Nearest page index for a layout offset. `reversed` mirrors the pager (RTL):
 * offset 0 is the last logical page.
 *
 * Returns null for non-finite offsets, invalid/empty counts, invalid
 * extents, or unrepresentable layouts/offsets.
 */
export function carouselIndexForOffset(
  offset: number,
  count: number,
  extent: number,
  reversed = false,
): number | null {
  const total = effectiveCarouselCount(count);
  if (total <= 0) {
    return null;
  }
  if (!isValidCarouselExtent(extent)) {
    return null;
  }
  if (typeof offset !== "number" || !Number.isFinite(offset)) {
    return null;
  }
  if (Math.abs(offset) > Number.MAX_SAFE_INTEGER) {
    return null;
  }
  const maxOffset = (total - 1) * extent;
  if (!Number.isFinite(maxOffset)) {
    return null;
  }
  if (maxOffset > Number.MAX_SAFE_INTEGER) {
    return null;
  }
  const clean = offset === 0 ? 0 : offset;
  const clamped = Math.min(maxOffset, Math.max(0, clean));
  const raw = clamped / extent;
  if (!Number.isFinite(raw)) {
    return null;
  }
  const physical = Math.round(raw);
  if (!Number.isFinite(physical)) {
    return null;
  }
  const clampedPhysical = clampCarouselIndex(physical, total);
  const logical = reversed ? total - 1 - clampedPhysical : clampedPhysical;
  return logical === 0 ? 0 : logical;
}
