# Calendar

Renders a month grid for single, multiple and range date selection.

## Import

```tsx
import { Calendar } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Calendar
      mode="single"
      selected={new Date()}
      onValueChange={() => {}}
    />
  );
}
```

## Props

Calendar supports controlled and uncontrolled use. Pass `selected` with `onValueChange` for controlled state, or `defaultSelected` for uncontrolled state. Use `mode` to pick single, multiple or range behavior.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `mode` | `single, multiple, range` | `single` |
| `selected` | `Date, Date[], CalendarDateRange` | None |
| `defaultSelected` | `Date, Date[], CalendarDateRange` | None |
| `onValueChange` | `(value?: Date) => void` | None |

## Accessibility

Calendar follows grid keyboard behavior. Arrows move by day, PageUp and PageDown move by month, and Home and End move to week edges. Keep the selected day exposed with `aria-selected` and keep month navigation reachable by keyboard.

## Native support

On native the calendar accepts `testID` with the same value as its web `data-slot`, such as `calendar`. Pass `testID` only when a test needs a custom query value.
