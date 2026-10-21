# Menubar

Renders an app menu bar with menu and item parts.

## Import

```tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Menubar value="file">
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New tab</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

## Props

Menubar supports controlled and uncontrolled use. Pass `value` with `onValueChange` on `Menubar` for controlled state, or `defaultValue` for uncontrolled state. `MenubarSub` keeps its own open props.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |

## Accessibility

Menubar follows Radix behavior. Arrows move across menus and items, Enter opens a menu or picks an item, and Escape closes. Keep menu labels short and group related items.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `menubar-trigger` and `menubar-content`. Pass `testID` only when a test needs a custom query value.
