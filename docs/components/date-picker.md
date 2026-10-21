# Date picker

Renders a calendar popup for picking a single date.

## Import

```tsx
import { DatePicker } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <DatePicker
      placeholder="Pick a date"
      onValueChange={() => {}}
    />
  );
}
```

## Props

Date picker supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Use `placeholder` for the empty label.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `Date` | None |
| `defaultValue` | `Date` | None |
| `onValueChange` | `(value: Date) => void` | None |
| `placeholder` | `string` | `Pick a date` |

## Accessibility

Date picker opens with Enter or Space, arrows move by day, and Escape closes without a change. The trigger keeps an accessible label tied to the calendar. Provide a text input fallback for manual entry.

## Native support

On native `DatePicker` accepts `testID` with the same value as its web `data-slot`, such as `date-picker`. Pass `testID` only when a test needs a custom query value.
