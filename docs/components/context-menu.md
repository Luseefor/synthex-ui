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

## Accessibility

Context menu follows Radix behavior. Right click or Shift plus F10 opens the menu, arrows move through items, Enter picks an item, and Escape closes. Keep items in a logical order.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `context-menu-trigger` and `context-menu-content`. Pass `testID` only when a test needs a custom query value.
