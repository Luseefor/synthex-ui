# Context menu

Renders a right click menu with item and sub parts.

## Import

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right click me</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

## Props

Context menu supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Sub menus take their own open props.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility on web

Context menu follows Radix behavior. Right click or Shift plus F10 opens the menu, arrows move through items, Enter picks an item, and Escape closes. Keep items in a logical order.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `context-menu-trigger` and `context-menu-content`. Pass `testID` only when a test needs a custom query value.

Native ContextMenu opens on a long press and anchors its transparent Modal to the trigger bounds. It does not position at the touch coordinates. Outside press and Back dismiss it; `modal={false}` is accepted but the native surface always uses a Modal. Submenus remain inline within that surface.

See [native overlay contracts](../native-remaining-overlays.md) for native behavior and pending device checks.
