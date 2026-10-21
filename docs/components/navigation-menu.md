# Navigation menu

Renders a top nav list with trigger and content parts.

## Import

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/setup">Setup</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

## Props

Navigation menu supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Delay props tune hover timing.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |

## Accessibility

Navigation menu follows Radix behavior. Arrows move between triggers, Enter opens content, and Escape closes. Links stay keyboard reachable and viewport content is announced as a group.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `navigation-menu-trigger` and `navigation-menu-content`. Pass `testID` only when a test needs a custom query value.
