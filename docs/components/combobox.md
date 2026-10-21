# Combobox

Renders a searchable picker built on command parts.

## Import

```tsx
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Combobox defaultValue="apple">
      <ComboboxTrigger>Pick fruit</ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search" />
        <ComboboxItem value="apple">Apple</ComboboxItem>
      </ComboboxContent>
    </Combobox>
  );
}
```

## Props

Combobox supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Use `open` with `onOpenChange` to control the list.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |

## Accessibility

Combobox moves focus into the input when opened, filters items as the user types, and announces matches. Escape closes without a change. Keep item labels unique.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `combobox-trigger` and `combobox-content`. Pass `testID` only when a test needs a custom query value.
