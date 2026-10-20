# Dropdown menu

Renders a trigger anchored list of actions with sub menus and item variants.

## Import

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Props

Dropdown menu supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Sub menus use the same pattern through `DropdownMenuSub`.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Dropdown menu follows Radix behavior. Enter or Space opens the menu, arrows move through items, Right opens a sub menu and Left closes it, and Escape closes the stack. Disabled items are skipped by keyboard focus.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `dropdown-menu-trigger` and `dropdown-menu-content`. Pass `testID` only when a test needs a custom query value.
