# Label

Renders a text label bound to a form control.

## Import

```tsx
import { Label } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <div>
      <Label htmlFor="name">Name</Label>
      <input id="name" placeholder="Ada" />
    </div>
  );
}
```

## Props

Label is uncontrolled. It needs no controlled value and forwards label props to the host element. Use `htmlFor` to bind it to a control id.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `htmlFor` | `string` | None |

## Accessibility

Label gives the control an accessible name when `htmlFor` matches the control id. Keep text visible and concise. Do not wrap interactive content beyond the control.

## Native support

On native `Label` accepts `testID` with the same value as its web `data-slot`, such as `label`. Pass `testID` only when a test needs a custom query value.
