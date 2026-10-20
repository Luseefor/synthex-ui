# Checkbox

Renders a tri state check control with shared variants.

## Import

```tsx
import { Checkbox } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Checkbox
      defaultChecked={false}
      onCheckedChange={() => {}}
    />
  );
}
```

## Props

Checkbox supports controlled and uncontrolled use. Pass `checked` with `onCheckedChange` for controlled state, or `defaultChecked` for uncontrolled state. `checked` also accepts `indeterminate` for mixed parent rows.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `checked` | `boolean, indeterminate` | None |
| `defaultChecked` | `boolean, indeterminate` | None |
| `onCheckedChange` | `(checked: boolean) => void` | None |
| `disabled` | `boolean` | `false` |

## Accessibility

Checkbox follows Radix behavior. Tab reaches the control and Space toggles it. The control exposes `role="checkbox"` with `aria-checked` set to true, false or mixed. Pair it with a visible label.

## Native support

On native the checkbox accepts `testID` with the same value as its web `data-slot`, such as `checkbox`. Pass `testID` only when a test needs a custom query value.
