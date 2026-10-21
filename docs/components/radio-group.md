# Radio group

Renders a set of exclusive choice options.

## Import

```tsx
import { RadioGroup, RadioGroupItem } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <RadioGroup defaultValue="one">
      <RadioGroupItem value="one">One</RadioGroupItem>
      <RadioGroupItem value="two">Two</RadioGroupItem>
    </RadioGroup>
  );
}
```

## Props

Radio group supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |

## Accessibility

Radio group follows Radix behavior. Arrows move between items, Space selects, and the group uses `role="radiogroup"` with labeled items. Keep options visible and grouped under one label.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `radio-group` and `radio-group-item`. Pass `testID` only when a test needs a custom query value.
