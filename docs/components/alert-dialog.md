# Alert dialog

Renders a blocking confirm window with action and cancel parts.

## Import

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Remove item</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Keep</AlertDialogCancel>
        <AlertDialogAction>Remove</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Props

Alert dialog supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Alert dialog follows Radix behavior. Focus moves into the content on open and returns to the trigger on close. Escape is blocked for required confirms, so keep a visible cancel action.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `alert-dialog-content` and `alert-dialog-action`. Pass `testID` only when a test needs a custom query value.
