# Textarea

Renders a multi line text field with shared variants.

## Import

```tsx
import { Textarea } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Textarea
      placeholder="Notes"
      defaultValue="Hello"
      onChange={() => {}}
    />
  );
}
```

## Props

Textarea supports controlled and uncontrolled use. Pass `value` with `onChange` for controlled state, or `defaultValue` for uncontrolled state. Use `invalid` to show error tone.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onChange` | `(event) => void` | None |

## Accessibility

Textarea uses a native `textarea` element so labels and keyboard work by default. Link it with a `Label` or `aria-label` and expose errors through `aria-invalid` and described text.

## Native support

On native `Textarea` maps `data-slot="textarea"` to `testID="textarea"`. Pass `testID` only when a test needs a custom query value.
