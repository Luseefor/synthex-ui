export interface NativePanelConstraint {
  readonly defaultSize?: number;
  readonly minSize?: number;
  readonly maxSize?: number;
}

const EPSILON = 1e-9;
const SIZE_TOLERANCE = 1e-6;

function fail(message: string): never {
  throw new RangeError(`Resizable: ${message}`);
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function resolveBounds(panels: readonly NativePanelConstraint[]) {
  if (!Array.isArray(panels)) fail("panels must be an array.");
  const bounds = Array.from(panels, (panel, index) => {
    if (panel === null || typeof panel !== "object") fail(`panel ${index} must be an object.`);
    const min = panel.minSize === undefined ? 15 : panel.minSize;
    const max = panel.maxSize === undefined ? 100 : panel.maxSize;
    if (!finite(min) || !finite(max) || min < 0 || max > 100 || max < min) {
      fail(`panel ${index} requires finite 0 <= minSize <= maxSize <= 100.`);
    }
    if (panel.defaultSize !== undefined && !finite(panel.defaultSize)) fail(`panel ${index} defaultSize must be finite.`);
    return { min, max };
  });
  if (bounds.length > 0 && (
    bounds.reduce((sum, bound) => sum + bound.min, 0) > 100 + EPSILON ||
    bounds.reduce((sum, bound) => sum + bound.max, 0) < 100 - EPSILON
  )) fail("panel min/max bounds must allow a total of 100.");
  return bounds;
}

export function resolvePanelSizes(panels: readonly NativePanelConstraint[], preferred?: readonly number[]): number[] {
  const bounds = resolveBounds(panels);
  if (preferred !== undefined && (
    !Array.isArray(preferred) || preferred.length !== panels.length || Array.from(preferred).some(entry => !finite(entry))
  )) fail("preferred sizes must be finite and match the panel count.");
  if (panels.length === 0) return [];
  // Keep accepted controlled layouts byte-for-byte stable across renders.
  // Reweighting a valid fractional layout can introduce rounding drift.
  if (preferred !== undefined &&
    preferred.every((entry, index) => entry >= bounds[index]!.min && entry <= bounds[index]!.max) &&
    Math.abs(100 - preferred.reduce((sum, entry) => sum + entry, 0)) <= EPSILON
  ) return [...preferred];
  const explicitTotal = panels.reduce((sum, panel) => sum + Math.max(0, panel.defaultSize ?? 0), 0);
  const unspecified = panels.filter(panel => panel.defaultSize === undefined).length;
  const fallback = unspecified > 0 ? Math.max(0, 100 - explicitTotal) / unspecified : 0;
  const weights = Array.from(preferred ?? panels.map(panel => panel.defaultSize ?? fallback), entry => Math.max(0, entry));
  // Scale before summing so several finite MAX_VALUE preferences cannot overflow.
  const largest = weights.reduce((max, entry) => Math.max(max, entry), 0);
  const scaled = weights.map(entry => largest > 0 ? entry / largest : 1);
  const total = scaled.reduce((sum, entry) => sum + entry, 0);
  const result = scaled.map((entry, index) => {
    const bound = bounds[index]!;
    return Math.min(bound.max, Math.max(bound.min, entry / total * 100));
  });
  // Each non-final redistribution saturates at least one panel.
  for (let pass = 0; pass <= panels.length; pass += 1) {
    const difference = 100 - result.reduce((sum, entry) => sum + entry, 0);
    if (Math.abs(difference) <= EPSILON) return result;
    const available = bounds.flatMap((bound, index) => {
      const capacity = difference > 0 ? bound.max - result[index]! : result[index]! - bound.min;
      return capacity > 0 ? [index] : [];
    });
    if (available.length === 0) break;
    const share = difference / available.length;
    for (const index of available) {
      const bound = bounds[index]!;
      result[index] = Math.min(bound.max, Math.max(bound.min, result[index]! + share));
    }
  }
  if (Math.abs(100 - result.reduce((sum, entry) => sum + entry, 0)) > SIZE_TOLERANCE) fail("panel sizes cannot satisfy their bounds with total 100.");
  return result;
}

function validSizes(sizes: readonly number[], bounds: readonly { min: number; max: number }[]): boolean {
  return Array.isArray(sizes) && sizes.length === bounds.length &&
    Array.from(sizes).every((entry, index) => finite(entry) && entry >= bounds[index]!.min - SIZE_TOLERANCE && entry <= bounds[index]!.max + SIZE_TOLERANCE) &&
    Math.abs(100 - sizes.reduce((sum, entry) => sum + entry, 0)) <= SIZE_TOLERANCE;
}

export function getPanelPairBounds(sizes: readonly number[], index: number, panels: readonly NativePanelConstraint[]): { min: number; max: number; now: number } | null {
  if (!Array.isArray(sizes) || !Number.isInteger(index) || index < 0 || index >= sizes.length - 1) return null;
  const bounds = resolveBounds(panels);
  if (!validSizes(sizes, bounds)) return null;
  const pairTotal = sizes[index]! + sizes[index + 1]!;
  return {
    min: Math.max(bounds[index]!.min, pairTotal - bounds[index + 1]!.max),
    max: Math.min(bounds[index]!.max, pairTotal - bounds[index + 1]!.min),
    now: sizes[index]!,
  };
}

export function resizePanelPair(sizes: readonly number[], index: number, delta: number, panels: readonly NativePanelConstraint[]): number[] {
  const bounds = resolveBounds(panels);
  if (!Array.isArray(sizes) || sizes.length !== bounds.length) fail("sizes must match the panel count.");
  if (sizes.length === 0) return [];
  if (!validSizes(sizes, bounds)) fail("sizes must satisfy bounds and sum to 100.");
  const result = [...sizes];
  if (!finite(delta) || !Number.isInteger(index) || index < 0 || index >= sizes.length - 1) return result;
  const pairTotal = sizes[index]! + sizes[index + 1]!;
  const min = Math.max(bounds[index]!.min, pairTotal - bounds[index + 1]!.max);
  const max = Math.min(bounds[index]!.max, pairTotal - bounds[index + 1]!.min);
  const next = Math.min(max, Math.max(min, sizes[index]! + delta));
  result[index] = next;
  result[index + 1] = pairTotal - next;
  return result;
}
