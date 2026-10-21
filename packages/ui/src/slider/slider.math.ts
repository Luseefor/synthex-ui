export interface NativeSliderConfig {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly orientation: "horizontal" | "vertical";
  readonly dir: "ltr" | "rtl";
  readonly inverted: boolean;
}

function decimalPlaces(value: number): number {
  if (!Number.isFinite(value) || Number.isInteger(value)) {
    return 0;
  }
  const text = value.toString().toLowerCase();
  const eIndex = text.indexOf("e");
  if (eIndex !== -1) {
    const mantissa = text.slice(0, eIndex);
    const exponent = Number(text.slice(eIndex + 1));
    const dotIndex = mantissa.indexOf(".");
    const mantissaDecimals = dotIndex === -1 ? 0 : mantissa.length - dotIndex - 1;
    return Math.max(0, mantissaDecimals - exponent);
  }
  const dotIndex = text.indexOf(".");
  if (dotIndex === -1) {
    return 0;
  }
  return text.length - dotIndex - 1;
}

function snapToStepGrid(value: number, config: NativeSliderConfig): number {
  const { min, max, step } = config;
  if (min === max) {
    return min;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return min;
  }
  // Clamp before quantize so out-of-range (including +/-Infinity) saturates
  // to the endpoint without overflowing the step arithmetic.
  if (value <= min) {
    return min === 0 ? 0 : min;
  }
  if (value >= max) {
    return max === 0 ? 0 : max;
  }
  const steps = Math.round((value - min) / step);
  if (!Number.isFinite(steps)) {
    return value < min ? min : max;
  }
  const raw = min + steps * step;
  if (!Number.isFinite(raw)) {
    return value < min ? min : max;
  }
  const required = Math.max(decimalPlaces(step), decimalPlaces(min));
  let normalized: number;
  if (required > 100) {
    // Tiny grids need more than 100 decimal places; any fixed or
    // significant-digit rounding can collapse distinct grid points
    // (e.g. min 1e-300 with step 1e-313). Use the raw grid value as-is.
    normalized = raw;
  } else {
    const fixed = Number(raw.toFixed(required));
    normalized = Number.isNaN(fixed) ? raw : fixed;
  }
  const clamped = Math.min(max, Math.max(min, normalized));
  return clamped === 0 ? 0 : clamped;
}

function toPhysicalRatio(logical: number, config: NativeSliderConfig): number {
  let physical: number;
  if (config.orientation === "vertical") {
    physical = 1 - logical;
  } else {
    physical = config.dir === "rtl" ? 1 - logical : logical;
  }
  if (config.inverted) {
    physical = 1 - physical;
  }
  return Math.min(1, Math.max(0, physical));
}

function toLogicalRatio(physical: number, config: NativeSliderConfig): number {
  // The orientation/dir/inverted mapping is its own inverse (1 - x applied
  // symmetrically), so the same transform converts both directions.
  return toPhysicalRatio(physical, config);
}

export function normalizeSliderConfig(
  options?: Partial<NativeSliderConfig>,
): NativeSliderConfig {
  const min = options?.min ?? 0;
  const max = options?.max ?? 100;
  const step = options?.step ?? 1;
  const rawOrientation = options?.orientation;
  const rawDir = options?.dir;
  const orientation: NativeSliderConfig["orientation"] =
    rawOrientation === "vertical" ? "vertical" : "horizontal";
  const dir: NativeSliderConfig["dir"] = rawDir === "rtl" ? "rtl" : "ltr";
  const inverted = Boolean(options?.inverted ?? false);

  if (typeof min !== "number" || !Number.isFinite(min)) {
    throw new RangeError("NativeSliderConfig: min must be a finite number.");
  }
  if (typeof max !== "number" || !Number.isFinite(max)) {
    throw new RangeError("NativeSliderConfig: max must be a finite number.");
  }
  if (max < min) {
    throw new RangeError("NativeSliderConfig: max must be >= min.");
  }
  if (typeof step !== "number" || !Number.isFinite(step) || step <= 0) {
    throw new RangeError("NativeSliderConfig: step must be a finite number > 0.");
  }

  const span = max - min;
  if (!Number.isFinite(span)) {
    throw new RangeError(
      "NativeSliderConfig: min/max span is unrepresentable (overflow).",
    );
  }
  const stepCount = span === 0 ? 0 : span / step;
  if (!Number.isFinite(stepCount)) {
    throw new RangeError(
      "NativeSliderConfig: min/max/step range is unrepresentable (step count overflow).",
    );
  }
  if (stepCount > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(
      "NativeSliderConfig: min/max/step range is unrepresentable (too many steps).",
    );
  }

  return { min, max, step, orientation, dir, inverted };
}

export function normalizeSliderValues(
  values: readonly number[] | undefined,
  config: NativeSliderConfig,
): number[] {
  if (values === undefined || values.length === 0) {
    return [config.min];
  }
  const snapped = values.map((entry) => {
    if (typeof entry !== "number" || !Number.isFinite(entry)) {
      return config.min;
    }
    return snapToStepGrid(entry, config);
  });
  snapped.sort((a, b) => a - b);
  return snapped;
}

export function sliderValueFromOffset(
  offset: number,
  size: number,
  config: NativeSliderConfig,
): number | null {
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return null;
  }
  if (typeof offset !== "number" || Number.isNaN(offset)) {
    return null;
  }
  const clampedOffset = Math.min(size, Math.max(0, offset));
  const physical = clampedOffset / size;
  const logical = toLogicalRatio(
    Math.min(1, Math.max(0, physical)),
    config,
  );
  const { min, max } = config;
  if (min === max) {
    return min;
  }
  const raw = min + logical * (max - min);
  if (!Number.isFinite(raw)) {
    return Math.min(max, Math.max(min, logical <= 0 ? min : max));
  }
  return snapToStepGrid(raw, config);
}

export function sliderRatioForValue(
  value: number,
  config: NativeSliderConfig,
): number {
  const { min, max } = config;
  if (min === max) {
    return 0;
  }
  const clamped =
    typeof value !== "number" || !Number.isFinite(value)
      ? min
      : Math.min(max, Math.max(min, value));
  const logical = (clamped - min) / (max - min);
  return toPhysicalRatio(Math.min(1, Math.max(0, logical)), config);
}

export function nearestSliderThumb(
  values: readonly number[],
  target: number,
  preferHigher = false,
): number {
  if (values.length === 0) {
    return 0;
  }
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < values.length; index += 1) {
    const entry = values[index] as number;
    const distance = Math.abs(entry - target);
    if (Number.isNaN(distance)) {
      continue;
    }
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    } else if (distance === bestDistance && preferHigher) {
      bestIndex = index;
    }
  }
  return bestIndex;
}

export function updateSliderThumb(
  values: readonly number[],
  index: number,
  target: number,
  config: NativeSliderConfig,
): number[] {
  const next = [...values];
  if (!Number.isInteger(index) || index < 0 || index >= next.length) {
    return next;
  }
  let rawTarget: number;
  if (typeof target !== "number" || Number.isNaN(target)) {
    rawTarget = config.min;
  } else if (target === Number.POSITIVE_INFINITY) {
    rawTarget = config.max;
  } else if (target === Number.NEGATIVE_INFINITY) {
    rawTarget = config.min;
  } else {
    rawTarget = target;
  }
  const snapped = snapToStepGrid(rawTarget, config);
  const lowerRaw = index > 0 ? next[index - 1] : config.min;
  const upperRaw =
    index < next.length - 1 ? next[index + 1] : config.max;
  const lower =
    typeof lowerRaw === "number" && Number.isFinite(lowerRaw)
      ? (lowerRaw as number)
      : config.min;
  const upper =
    typeof upperRaw === "number" && Number.isFinite(upperRaw)
      ? (upperRaw as number)
      : config.max;
  const clamped = Math.min(upper, Math.max(lower, snapped));
  next[index] = clamped === 0 ? 0 : clamped;
  return next;
}

export function stepSliderThumb(
  values: readonly number[],
  index: number,
  direction: 1 | -1,
  config: NativeSliderConfig,
): number[] {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    return [...values];
  }
  if (direction !== 1 && direction !== -1) {
    return [...values];
  }
  const { min, max, step } = config;
  if (min === max) {
    return [...values];
  }
  const rawCurrent = values[index] as number;
  const current =
    typeof rawCurrent === "number" && Number.isFinite(rawCurrent)
      ? Math.min(max, Math.max(min, rawCurrent))
      : min;
  const q = (current - min) / step;
  if (!Number.isFinite(q)) {
    return [...values];
  }
  // Normalize near-integer quotients caused by float division (e.g. 0.3/0.1
  // yields 2.9999999999999996 instead of 3) using a relative ULP tolerance.
  const nearest = Math.round(q);
  const tolerance = Number.EPSILON * 8 * Math.max(1, Math.abs(q));
  const normalizedQ =
    Math.abs(q - nearest) <= tolerance ? nearest : q;
  const stop =
    direction === 1 ? Math.floor(normalizedQ) + 1 : Math.ceil(normalizedQ) - 1;
  if (!Number.isFinite(stop)) {
    return [...values];
  }
  const raw = min + stop * step;
  const target = Number.isFinite(raw)
    ? Math.min(max, Math.max(min, raw))
    : direction === 1
      ? max
      : min;
  return updateSliderThumb(values, index, target, config);
}
