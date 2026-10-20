# Toast

Renders transient messages through a provider and a viewport.

## Import

```tsx
import { Toaster, useToast } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  const { toast } = useToast();
  return (
    <>
      <Toaster />
      <button onClick={() => toast({ title: "Saved" })}>
        Save
      </button>
    </>
  );
}
```

## Props

Toast state is uncontrolled from the caller view. Render `Toaster` once, then call `toast` or `useSonner` to push and dismiss messages. Pass `open` with `onOpenChange` only when rendering a standalone `Toast` with local control.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `title` | `string` | None |
| `description` | `string` | None |
| `action` | `ReactNode` | None |

## Accessibility

Toasts use a live region so screen readers announce new messages. Action buttons stay keyboard reachable, Escape dismisses the focused toast, and swipe direction is configurable on web. Keep messages short and avoid stacking critical errors only in toasts.

## Native support

On native toast parts accept `testID` with the same value as their web `data-slot`, such as `toast-viewport` and `toast-title`. Pass `testID` only when a test needs a custom query value.
