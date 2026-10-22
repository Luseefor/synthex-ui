# Native resizable

Scope: `synthex-ui` 2.0, included in the v1.2 milestone.

```tsx
import { Text } from "react-native";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "synthex-ui/resizable";

export function Split() {
  return (
    <ResizablePanelGroup direction="horizontal" defaultSizes={[30, 40, 30]}>
      <ResizablePanel minSize={15} maxSize={70}><Text>First</Text></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={15} maxSize={70}><Text>Middle</Text></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={15} maxSize={70}><Text>Last</Text></ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

Metro selects the native implementation through the package's `react-native` condition. The group is a `View`; panels are flex-ratio `View`s; each handle is a `Pressable` inside a gesture wrapper. A parent responder takes over only for single-finger single-axis drags past a 4pt threshold, so taps keep Pressable behavior, callbacks, and refs.

Group props are `sizes` (controlled) or `defaultSizes` (uncontrolled) as `readonly number[]`, plus `onSizesChange`/`onSizesCommit`, `dir`, `resizeStep` (default `5`, must be positive finite), and `disabled`. Direction defaults to the inherited `NativeDirectionContext`; an explicit `dir` overrides it. Finite sizes are normalized into bounded percentages summing to 100. Arrays must match the panel count; invalid numbers and impossible `minSize`/`maxSize` constraints throw `RangeError`. Invalid `resizeStep` throws `RangeError`.

Each panel accepts `defaultSize`, `minSize` (default `15`), `maxSize` (default `100`), and `onResize(size, prevSize)`. The first `onResize` call reports `prevSize` as `undefined`; later calls report the previous size, and fire only when that panel's size changes.

| Gesture | Result |
| --- | --- |
| Drag handle past the 4pt axis threshold | Leading/trailing pair resizes; pair total conserved, other panels unchanged |
| Drag beyond the pair bounds | Clamps to the feasible `minSize`/`maxSize` intersection |
| Release after a change | Single `onSizesCommit` with the final sizes |
| Cancel, disable mid-gesture, config change, or group extent change | Gesture clears without a commit |
| Second finger during a drag | Cancels without a commit, preventing centroid jumps |

Percentages resolve against available panel pixels excluding handle widths. Horizontal drags reverse under RTL; vertical drags stay physical. Use `defaultSizes` for uncontrolled use, or `sizes` with `onSizesChange` for controlled use. Controlled groups render props with no optimistic size. `onSizesChange` fires only when sizes change; `onSizesCommit` fires once per changed drag release or accessibility action. Cancel, disable, config, or group extent change clears the gesture without a commit; sizes already reported are not rolled back. A controlled parent correction that differs from both the starting layout and the last proposed layout also cancels the drag; accepting reported proposals keeps it active.

## Keyboard and accessibility

Each handle is `accessible` with an adjustable role for its leading panel. The accessible value spans the feasible pair bounds for that handle, not the global `0–100`.

| Handle prop | Behavior |
| --- | --- |
| `accessibilityLabel` | Label for the handle; falls back to `Resize panels N and N+1` (one-based panel indices) |
| `accessibilityValue` | Leading panel's size with that handle's feasible `min`/`max` |
| Increment / decrement actions | Move the pair by `resizeStep` inside feasible bounds |
| Caller `onAccessibilityAction` | Runs first when enabled; `preventDefault()` cancels the built-in action |
| Caller `disabled` / `busy` | Disabled blocks input; busy metadata is retained on each handle |

The group requires at least one panel. Direct children may be panels, handles or fragments of those components; stray text and unrelated components are rejected. A handle must sit between two panels. Keyed topology changes cancel a drag. Native announcements still require device validation.

There is no imperative panel API, no collapse, and no layout autosave. This contract does not claim universal web/native parity.

## Verification

The source suites exercise normalization, pair clamping, direction resolution, and mocked drag/accessibility/ref contracts. `native:check` compiles the packaged component and a CLI-owned copy against the Expo consumer's React Native types, then exports iOS and Android bundles.

```sh
bun --filter synthex-ui typecheck
bun --filter synthex-ui test
bun --filter synthex-ui build
bun --filter '@luseefor/synthex-cli' build
bun run native:check
```

The packaged fixture uses a three-panel horizontal group (controlled initial sizes `[30, 40, 30]`, `minSize={15}`, `maxSize={70}`) and a two-panel vertical group (controlled initial sizes `[50, 50]`): `resizable-horizontal`, `resizable-horizontal-sizes`, `resizable-horizontal-commit`, `resizable-horizontal-handle-0`, the `resizable-vertical` counterparts, and `resizable-disabled-toggle`. The owned fixture includes `owned-resizable`, `owned-resizable-sizes`, and `owned-resizable-handle-0`. See [device validation](./native-device-validation.md) for the pending checks. Measured panel spans and responder deltas are covered in source; device layout and `ScrollView` negotiation still require device validation, and no device gesture or announcement pass is claimed.
