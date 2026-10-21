# Progress

Renders a bar that shows task completion.

## Import

```tsx
import { Progress } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Progress
      value={40}
      max={100}
    />
  );
}
```

## Props

Progress is controlled by value. Pass `value` with `max` for controlled progress, and leave it uncontrolled only for static display. The bar clamps values to the range.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `number` | `0` |
| `max` | `number` | `100` |
| `size` | `sm, md, lg` | `md` |

## Accessibility

Progress uses `role="progressbar"` with value, min and max so screen readers announce percent complete. Provide a text label nearby for sighted context. Avoid animating values too fast.

## Native support

On native `Progress` accepts `testID` with the same value as its web `data-slot`, such as `progress`. Pass `testID` only when a test needs a custom query value.
