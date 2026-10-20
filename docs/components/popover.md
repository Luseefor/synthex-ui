# Popover

Renders anchored content beside a trigger without modal focus lock.

## Import

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent side="bottom">
        Details here
      </PopoverContent>
    </Popover>
  );
}
```

## Props

Popover supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Use `side` and `align` to place the content.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Popover follows Radix behavior. Enter or Space opens the content, Escape closes it and returns focus to the trigger, and Tab can leave the open content because it is not modal. Keep the trigger label descriptive.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `popover-trigger` and `popover-content`. Pass `testID` only when a test needs a custom query value.
