# Select

Renders a value picker with trigger, content and item parts.

## Import

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Select defaultValue="apple">
      <SelectTrigger>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## Props

Select supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. The same pattern applies to `open` and `defaultOpen`.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | None |
| `open` | `boolean` | None |

## Accessibility

Select follows Radix behavior. Enter or Space opens the list, Up and Down move through items, Enter picks the active item, and Escape closes without a change. Screen readers announce the selected value through `SelectValue`.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `select-trigger` and `select-content`. Pass `testID` only when a test needs a custom query value.
