# Utilities

Provides field, input group and status helper parts.

## Import

```tsx
import { Field, FieldDescription, FieldLabel } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Field>
      <FieldLabel htmlFor="city">City</FieldLabel>
      <input id="city" placeholder="Paris" />
      <FieldDescription>Use your billing city.</FieldDescription>
    </Field>
  );
}
```

## Props

Utilities are uncontrolled. They need no controlled value and compose labels with hints and errors. Use `FieldError` to show validation text.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `children` | `ReactNode` | Required |

## Accessibility

Field parts link labels and hints by id so screen readers announce them together. Keep one label per control and expose errors through `FieldError`. Spinner parts use `role="status"` for loading.

## Native support

On native field parts accept `testID` with the same value as their web `data-slot`, such as `field-label` and `field-description`. Pass `testID` only when a test needs a custom query value.
