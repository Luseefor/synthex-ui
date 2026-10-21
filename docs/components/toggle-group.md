# Toggle group

Renders a set of toggle buttons with single or multi select.

## Import

```tsx
import { ToggleGroup, ToggleGroupItem } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
}
```

## Props

Toggle group supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Use `type` to pick single or multiple selection.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `type` | `single, multiple` | Required |
| `value` | `string, string[]` | None |
| `defaultValue` | `string, string[]` | None |

## Accessibility

Toggle group follows Radix behavior. Tab reaches the group, arrows move between items, and Space toggles the focused item. Items expose `aria-pressed` for their state.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `toggle-group` and `toggle-group-item`. Pass `testID` only when a test needs a custom query value.
