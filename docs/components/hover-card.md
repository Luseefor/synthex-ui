# Hover card

Renders preview content when hovering a trigger.

## Import

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger>@ada</HoverCardTrigger>
      <HoverCardContent side="top">
        Ada, engineer
      </HoverCardContent>
    </HoverCard>
  );
}
```

## Props

Hover card supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Delay props tune hover timing.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Hover card follows Radix behavior. Hover or focus shows the content, Escape hides it, and the content stays open while the pointer rests on it. Do not put required actions only inside hover content.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `hover-card-trigger` and `hover-card-content`. Pass `testID` only when a test needs a custom query value.
