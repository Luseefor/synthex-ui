# Badge

Renders a small count or status label.

## Import

```tsx
import { Badge } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <div>
      <span>Inbox</span>
      <Badge variant="secondary">4 new</Badge>
    </div>
  );
}
```

## Props

Badge is uncontrolled. It needs no controlled value and renders inline content with variant styles. Use `asChild` to merge styles onto a link.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `variant` | `default, secondary, destructive, outline` | `default` |
| `asChild` | `boolean` | `false` |

## Accessibility

Badge adds no semantics. Keep text short and avoid color alone for meaning. When the count updates, put the live text in the parent label.

## Native support

On native `Badge` maps `data-slot="badge"` to `testID="badge"`. Pass `testID` only when a test needs a custom query value.
