# Native slider

Scope: `ace/native-slider`, stacked on OPEN PR #126 (`ace/native-otp`). These changes are implemented in source and await a package release.

```tsx
import * as React from "react";
import { Slider } from "synthex-ui/slider";

export function Volume() {
  const [value, setValue] = React.useState([50]);
  return <Slider value={value} onValueChange={setValue} />;
}
```

Metro selects the native implementation through the package's `react-native` condition. The root is a `Pressable` track; thumbs are absolute `View`s. The root keeps its ref and tap callbacks; a parent `PanResponder` takes over only for single-finger axis-intent drags past a 4pt threshold, so taps keep Pressability behavior.

Values are a non-empty array of finite numbers, sorted and bounded to `[min, max]`. Steps snap relative to `min` with decimal-correct rounding; `min === max` is stable at `min`. Invalid `min`/`max`/`step` throw `RangeError`. There is no `minStepsBetweenThumbs` prop.

| Input | Normalized result |
| --- | --- |
| Unsorted or out-of-range entries | Sorted and clamped into `[min, max]` |
| Non-finite entry; empty array | Each non-finite entry becomes `min`; an empty array becomes `[min]` |
| Fractional `step` (for example `0.1`) | Decimal-correct snap relative to `min` |
| `min === max` | Fixed at `min`; taps, drags, and actions report no change |
| `min > max`, non-finite bounds, non-positive `step` | `RangeError` |

```tsx
// Non-zero offset: steps snap at 5, 7, 9, … relative to min.
<Slider defaultValue={[6]} min={5} max={25} step={2} />
```

```tsx
// Range with per-thumb labels; length matches the value count.
<Slider
  defaultValue={[20, 80]}
  thumbLabels={["Lower bound", "Upper bound"]}
/>
```

```tsx
// Commit observer for analytics or persistence.
<Slider
  defaultValue={[40]}
  onValueChange={(next) => console.log("live", next)}
  onValueCommit={(next) => console.log("committed", next)}
/>
```

## Gestures and values

Taps and drags both set values. The gesture picks the nearest thumb at press time and keeps that thumb for the whole gesture; thumbs cannot cross neighbors and clamp instead. Drag position maps through the track's measured frame paired with the responder's page coordinates.

| Gesture | Result |
| --- | --- |
| Tap the track | Nearest thumb jumps to the tapped value; commit fires once when changed |
| Drag past the 4pt axis threshold | Active thumb follows the axis; other thumbs stay fixed |
| Drag beyond the track ends | Active thumb clamps to `min`/`max` or its neighbor |
| Release after a change | Single `onValueCommit` with the final value |
| Cancel, disable mid-gesture, or config change | Gesture clears without a commit |
| Second finger during a drag | Ignored; the active thumb does not switch |

Use `defaultValue` for uncontrolled use, or `value` with `onValueChange` for controlled use. Controlled sliders render props with no optimistic value. `onValueChange` fires only when the snapped value changes; `onValueCommit` fires once per changed tap, drag release, or accessibility action. Cancel, disable, or config change clears the gesture without a commit; values already reported are not rolled back.

Direction follows the shared native direction context or an explicit `dir`; `inverted` flips the axis. Vertical sliders place `min` at the bottom by default.

```tsx
<Slider defaultValue={[30]} orientation="vertical" />
<Slider defaultValue={[30]} inverted />
<Slider defaultValue={[30]} dir="rtl" />
```

## Keyboard and accessibility

The root is `accessible={false}` so each thumb is exposed. New prop `thumbLabels: readonly string[]` supplies per-thumb labels.

| Thumb prop | Behavior |
| --- | --- |
| `thumbLabels[i]` | Accessible label for thumb `i`; falls back to the caller's `accessibilityLabel` (with a one-based index for ranges), then `Value i+1` |
| `accessibilityValue` | Thumb's own value with the global `min`/`max` |
| Increment / decrement actions | Move to the next/previous step stop without crossing neighbors; clamp at endpoints |
| Caller `onAccessibilityAction` | Runs first when enabled; `preventDefault()` cancels the built-in action |
| Caller `disabled` / `busy` | Disabled blocks input; busy metadata is retained on each thumb |
| Root `accessible={false}` | Keeps the track from grouping the adjustable thumbs into one accessible element |

Each thumb uses an adjustable role; increment and decrement move to the next or previous step stop without crossing. Caller busy metadata and custom accessibility actions are retained. Native announcements still require device validation.

## Verification

The source suites exercise normalization, stepping, thumb identity, no-cross clamping, direction resolution, and mocked tap/drag/accessibility/ref contracts. `native:check` compiles the packaged component and a CLI-owned copy against the Expo consumer's React Native types, then exports iOS and Android bundles.

```sh
bun --filter synthex-ui typecheck
bun --filter synthex-ui test
bun --filter synthex-ui build
bun --filter '@luseefor/synthex-cli' build
bun run native:check
```

The packaged fixture includes `slider-single`, `slider-single-value`, `slider-single-commit`, `slider-range`, `slider-range-value`, `slider-range-commit`, `slider-vertical`, `slider-vertical-value`, `slider-disabled-toggle`, and `slider-inverted-toggle`; thumb IDs derive as `<root>-thumb-<i>`. The owned fixture includes `owned-slider` and `owned-slider-value`. See [device validation](./native-device-validation.md) for the pending checks. Track-frame pairing with page coordinates is covered in source; device frames and `ScrollView` negotiation still require device validation, and no device gesture or announcement pass is claimed.
