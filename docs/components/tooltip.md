# Tooltip

Renders a short hint attached to a trigger element.

## Import

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent side="top">
        Helpful hint
      </TooltipContent>
    </Tooltip>
  );
}
```

## Props

Tooltip supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state. Delay props control how fast hover and touch show the content.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Tooltip follows Radix behavior. Hover or keyboard focus shows the content, Escape hides it, and the content uses `role="tooltip"` tied to the trigger. Keep hints short and never put required actions inside a tooltip.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `tooltip-trigger` and `tooltip-content`. Pass `testID` only when a test needs a custom query value.
