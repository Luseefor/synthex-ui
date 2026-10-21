# Hooks

Provides shared state helpers for controlled components.

## Import

```tsx
import { useDisclosure } from "synthex-ui/hooks";
```

## Example

```tsx
function Demo() {
  const { isOpen, onToggle } = useDisclosure();
  return (
    <div>
      <button onClick={onToggle}>Toggle</button>
      <span>{isOpen ? "Open" : "Closed"}</span>
    </div>
  );
}
```

## Props

Hooks support controlled and uncontrolled use. Pass `defaultOpen` with `onOpenChange` for uncontrolled state with change notice, or drive `isOpen` from parent state for full control.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Hooks add no markup. Keep the trigger a real button so Enter and Space work, and expose `aria-expanded` from `isOpen`. Pair state text with visible labels.

## Native support

On native hooks accept `testID` on the host element that renders the state, such as a pressable trigger. Pass `testID` only when a test needs a custom query value.
