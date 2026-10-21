# Card

Renders a content panel with header and footer parts.

## Import

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>8200 downloads</CardContent>
    </Card>
  );
}
```

## Props

Card is uncontrolled. It needs no controlled value and groups static content with variant styles. Use `variant` to change surface tone.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `variant` | `default, elevated, interactive, muted, accent` | `default` |

## Accessibility

Card adds no semantics. Use real heading levels inside `CardTitle` and keep actions keyboard reachable. Do not nest headings out of order.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `card-header` and `card-content`. Pass `testID` only when a test needs a custom query value.
