# Sheet

Renders a side anchored dialog with shared trigger and content parts.

## Import

```tsx
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side="right">
        <SheetTitle>Panel</SheetTitle>
      </SheetContent>
    </Sheet>
  );
}
```

## Props

Sheet supports controlled and uncontrolled use through the same dialog controller. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Use `side` to pick left, right, top or bottom placement.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Sheet follows Radix dialog behavior. Escape closes the panel, focus moves into the panel on open and returns to the trigger on close, and Tab cycles inside while modal. Keep `SheetTitle` present for screen reader naming.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `sheet-trigger` and `sheet-content`. Pass `testID` only when a test needs a custom query value.
