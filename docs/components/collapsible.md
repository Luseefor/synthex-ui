# Collapsible

Renders a single section that expands and collapses.

## Import

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      <CollapsibleContent>
        Shipping takes 2 days.
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## Props

Collapsible supports controlled and uncontrolled use. Pass `open` with `onOpenChange` for controlled state, or `defaultOpen` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Collapsible trigger exposes `aria-expanded` and toggles on Enter or Space. Content renders in a region tied to the trigger. Keep trigger labels descriptive when closed.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `collapsible-trigger` and `collapsible-content`. Pass `testID` only when a test needs a custom query value.
