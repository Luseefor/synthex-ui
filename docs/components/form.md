# Form

Connects labels, inputs and messages through shared field context.

## Import

```tsx
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Form>
      <FormField name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl />
        </FormItem>
      </FormField>
    </Form>
  );
}
```

## Props

Form itself is uncontrolled and forwards form element props. Control lives in `FormField`, which takes a field `name` and integrates with the form library value for that name. Use `defaultValue` on the field for an initial value and read changes through the form library.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `name` | `string` | Required |
| `defaultValue` | `unknown` | None |

## Accessibility

Form parts link labels and messages by id. `FormLabel` targets the control, `FormMessage` uses an alert region for errors, and `FormControl` passes through `aria-invalid` and `aria-describedby`. Keep one message per field so errors stay clear.

## Native support

On native form parts accept `testID` with the same value as their web `data-slot`, such as `form-item` and `form-message`. Pass `testID` only when a test needs a custom query value.
