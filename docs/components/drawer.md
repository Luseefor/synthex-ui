# Drawer

Renders a side panel with trigger and close parts.

## Import

```tsx
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Drawer>
      <DrawerTrigger>Open panel</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Settings</DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}
```

## Props

Drawer supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Use `direction` to set the slide edge.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

On web, Drawer follows dialog behavior. Escape closes the panel, focus moves inside on open and returns to the trigger on close. Keep `DrawerTitle` present so screen readers announce the purpose.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `drawer-trigger` and `drawer-content`. Pass `testID` only when a test needs a custom query value.

Native interaction, placement, dismissal and ref behavior are documented in [native Sheet/Drawer](../native-sheet-drawer.md). Native always uses Modal and has no swipe/snap-point or custom focus-management implementation; device and screen-reader checks are pending.
