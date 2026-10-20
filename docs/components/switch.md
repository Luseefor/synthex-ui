# Switch

Renders an on off toggle with shared size variants.

## Import

```tsx
import { Switch } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Switch
      defaultChecked={false}
      onCheckedChange={() => {}}
    />
  );
}
```

## Props

Switch supports controlled and uncontrolled use. Pass `checked` with `onCheckedChange` for controlled state, or `defaultChecked` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `checked` | `boolean` | None |
| `defaultChecked` | `boolean` | None |
| `onCheckedChange` | `(checked: boolean) => void` | None |
| `disabled` | `boolean` | `false` |

## Accessibility

Switch follows Radix behavior. Tab reaches the control and Space toggles it. It exposes `role="switch"` with `aria-checked`. Keep the visible label next to the control so the purpose stays clear.

## Native support

On native the switch accepts `testID` with the same value as its web `data-slot`, such as `switch`. Pass `testID` only when a test needs a custom query value.
