# Separator

Renders a thin divider between content groups.

## Import

```tsx
import { Separator } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <div>
      <p>Above</p>
      <Separator orientation="horizontal" />
      <p>Below</p>
    </div>
  );
}
```

## Props

Separator is uncontrolled. It needs no controlled value and renders a static rule with variant styles. Use `orientation` to set the line axis.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `orientation` | `horizontal, vertical` | `horizontal` |

## Accessibility

Separator uses `role="separator"` so screen readers announce the group break. Keep it decorative between related groups and avoid stacking many rules in a row.

## Native support

On native `Separator` maps `data-slot="separator"` to `testID="separator"`. Pass `testID` only when a test needs a custom query value.
