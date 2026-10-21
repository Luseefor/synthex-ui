# Input

Renders a single line text field with shared variants.

## Import

```tsx
import { Input } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Input
      placeholder="Name"
      defaultValue="Ada"
      onChange={() => {}}
    />
  );
}
```

## Props

Input supports controlled and uncontrolled use. Pass `value` with `onChange` for controlled state, or `defaultValue` for uncontrolled state. Use `invalid` to show error tone.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onChange` | `(event) => void` | None |

## Accessibility

Input uses a native `input` element so labels, focus and keyboard work by default. Link it with a `Label` or `aria-label` and expose errors through `aria-invalid` and described text.

## Native support

On native `Input` maps `data-slot="input"` to `testID="input"`. Pass `testID` only when a test needs a custom query value.
