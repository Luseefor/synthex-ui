# Dialog

Renders a modal window with trigger, content, header and close parts.

## Import

```tsx
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

## Props

Dialog supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |
| `modal` | `boolean` | `true` |

## Accessibility

Dialog follows Radix behavior. Escape closes the content, focus moves into the content on open and returns to the trigger on close, and Tab cycles inside modal content. Keep `DialogTitle` and `DialogDescription` present so screen readers announce the purpose.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `dialog-trigger`, `dialog-content` and `dialog-close`. Pass `testID` only when a test needs a custom query value.
