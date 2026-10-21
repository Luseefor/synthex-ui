# Toggle

Renders a two state press button with variant styles.

## Import

```tsx
import { Toggle } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Toggle
      defaultPressed={false}
      onPressedChange={() => {}}
    >
      Bold
    </Toggle>
  );
}
```

## Props

Toggle supports controlled and uncontrolled use. Pass `pressed` with `onPressedChange` for controlled state, or `defaultPressed` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `pressed` | `boolean` | None |
| `defaultPressed` | `boolean` | `false` |
| `onPressedChange` | `(pressed: boolean) => void` | None |

## Accessibility

Toggle uses `aria-pressed` so screen readers announce the on and off state. Tab reaches the control and Space toggles it. Keep labels visible or add an `aria-label` for icon only toggles.

## Native support

On native `Toggle` maps `data-slot="toggle"` to `testID="toggle"`. Pass `testID` only when a test needs a custom query value.
