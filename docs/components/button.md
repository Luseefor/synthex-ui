# Button

Renders a pressable control with shared variant styles for web and native.

## Import

```tsx
import { Button } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Button variant="default" size="md">
      Click me
    </Button>
  );
}
```

The snippet above is 7 lines and uses only `Button` from the button index.

## Props

Button is uncontrolled. It forwards native button props and accepts `variant` and `size` resolved by `buttonVariants`. Use `onPress` on native and `onClick` on web. There is no open or checked state to control.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `variant` | `default, destructive, outline, secondary, ghost, link` | `default` |
| `size` | `sm, md, lg, icon` | `md` |
| `disabled` | `boolean` | `false` |

## Accessibility

On web the control renders a native `button` element, so Tab reaches it and Enter or Space activates it. Keep the label visible or add an `aria-label` for icon only buttons. Do not nest interactive elements inside the label.

## Native support

On native the same `Button` maps `data-slot="button"` to `testID="button"`. Pass `testID` only when a test needs a custom query value.
