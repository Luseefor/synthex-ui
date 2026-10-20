# Slider

Renders a multi thumb range control for numeric values.

## Import

```tsx
import { Slider } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Slider
      defaultValue={[50]}
      min={0}
      max={100}
    />
  );
}
```

## Props

Slider supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Use `onValueCommit` when the app should react only after the pointer releases.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `number[]` | None |
| `defaultValue` | `number[]` | None |
| `onValueChange` | `(value: number[]) => void` | None |
| `min`, `max` | `number` | `0, 100` |

## Accessibility

Slider follows Radix behavior. Tab reaches each thumb, arrows move by one step, PageUp and PageDown move by larger steps, and Home and End jump to range edges. Each thumb exposes `role="slider"` with value limits.

## Native support

On native the slider accepts `testID` with the same value as its web `data-slot`, such as `slider`. Pass `testID` only when a test needs a custom query value.
