# Alert

Renders a status message with title and description parts.

## Import

```tsx
import { Alert, AlertDescription, AlertTitle } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Alert>
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>Changes are live.</AlertDescription>
    </Alert>
  );
}
```

## Props

Alert is uncontrolled. It needs no controlled value and renders static content with variant styles. Use `variant` to change tone.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `variant` | `default, destructive, success, warning` | `default` |

## Accessibility

Alert uses `role="alert"` so screen readers announce it. Keep titles short and pair them with one description. Do not nest interactive controls inside the message.

## Native support

On native `Alert` maps `data-slot="alert"` to `testID="alert"`. Title and description accept `testID` with matching slot values. Pass `testID` only when a test needs a custom query value.
