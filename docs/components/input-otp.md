# Input otp

Renders a segmented one time code input with slot parts.

## Import

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
    </InputOTP>
  );
}
```

## Props

Input OTP supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Use `maxLength` to set the code length.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |
| `maxLength` | `number` | Required |

## Accessibility

Input OTP moves focus across slots as the user types, Backspace moves to the previous slot, and paste fills from the focused slot. The hidden input keeps a single label, so add an `aria-label` like code. Keep slot count matched to `maxLength`.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `input-otp` and `input-otp-slot`. Pass `testID` only when a test needs a custom query value.
