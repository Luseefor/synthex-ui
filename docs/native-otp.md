# Native OTP

Scope: `synthex-ui` 2.0, included in the v1.2 milestone.

```tsx
import * as React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "synthex-ui/input-otp";

export function CodeField() {
  const [code, setCode] = React.useState("");
  return (
    <InputOTP length={6} value={code} onValueChange={setCode}>
      <InputOTPGroup style={{ flexWrap: "wrap" }}>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
```

Metro selects the native implementation through the package's `react-native` condition. Render one slot for each index. `length` defaults to six and must be a positive integer; invalid lengths throw `RangeError`.

Use `defaultValue` for an uncontrolled field, or `value` and `onValueChange` for a controlled field. Controlled edits notify the caller and display the supplied value until the parent updates it. Overlong values display their first `length` Unicode codepoints; supplying or shortening a value does not itself fire `onValueChange` or move focus.

## Editing and focus

The value is a contiguous string. It has no empty positions between filled characters.

| Action | Result |
| --- | --- |
| Type one character | Overwrite that position and focus the next mounted editable slot |
| Paste a partial code | Overwrite from the focused index, preserving the remaining suffix and bounding the result to `length` |
| Paste at a position beyond the filled prefix | Append to the filled prefix without leaving gaps |
| Deliver a full code of at least `length` codepoints | Replace the whole code from index zero and focus the last editable position |
| Backspace a filled position | Remove that codepoint, shift the suffix left and move focus backward |
| Backspace an empty position | Remove the last filled codepoint before it and move focus backward |

For example, pasting `AB` at index two in `123456` produces `12AB56`. Backspace at index two produces `12456` and requests focus at index one. Length counts Unicode codepoints rather than UTF-16 units.

The native slot receives multi-character text before the controller distributes it. Leave its `maxLength` unset for complete paste/autofill delivery; the root bounds the stored code. `selectTextOnFocus` defaults to `true`, so typing replaces the focused cell.

Filled cells delete through `onChangeText`; Backspace key events handle cells that are already empty. A following empty text change on an empty cell is a no-op, so the pair cannot delete twice. `onChange` is an observer. A caller's `onKeyPress` runs first and can prevent the empty-cell Backspace action with `event.preventDefault()`; this does not cancel an OS text edit. Android can omit hardware-key events, so empty-cell backward navigation needs device verification; filled-cell text deletion works without a key event.

Missing, invalid and non-editable slots are skipped by automatic focus movement. An out-of-range slot is uneditable. The root's `disabled` flag blocks editing and automatic focus; a slot's `editable={false}` or `readOnly` also excludes it from editing and automatic focus. Deletion shifts the shared value, so a read-only cell can still display a programmatically changed value.

Slots forward their actual `TextInput` refs, including React 19 callback cleanup. To focus the first slot explicitly:

```tsx
const first = React.useRef<React.ElementRef<typeof InputOTPSlot>>(null);
// Pass ref={first} to index zero; call first.current?.focus() from an action.
```

## Keyboard and accessibility

Slots default to `keyboardType="number-pad"`, `autoComplete="one-time-code"` and `textContentType="oneTimeCode"`. These are keyboard/autofill hints; text is accepted without a digit filter. Callers can override the hints. The component does not retrieve SMS messages.

The default accessible label is `Code character N of length`; set `accessibilityLabel` to customize it. Caller accessibility metadata is preserved, and the root's disabled state is reflected on each slot. Native announcements, OS paste, autofill, keyboard event order and focus timing still require device validation.

## Verification

The source suites exercise pure edits and mocked native focus/handler/ref contracts. `native:check` compiles the packaged component and a CLI-owned copy against the Expo consumer's React Native types, then exports iOS and Android bundles.

```sh
bun --filter synthex-ui typecheck
bun --filter synthex-ui test
bun --filter synthex-ui build
bun --filter '@luseefor/synthex-cli' build
bun run native:check
```

The packaged fixture includes `otp-slot-0..5`, `otp-value`, `otp-fill`, `otp-clear`, `otp-disabled-toggle` and `otp-ref-focus`. The owned fixture includes `owned-otp-0..5` and `owned-otp-value`. See [device validation](./native-device-validation.md) for the pending checks. Device tools are disabled; no simulator, VoiceOver or TalkBack pass is claimed.
