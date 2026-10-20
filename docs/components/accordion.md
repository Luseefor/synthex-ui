# Accordion

Renders collapsible sections with trigger and content parts.

## Import

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Accordion type="single" defaultValue="one">
      <AccordionItem value="one">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent>Details</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Props

Accordion supports controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Use `type="single"` for one open item or `type="multiple"` for several.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `type` | `single, multiple` | Required |
| `value` | `string, string[]` | None |
| `defaultValue` | `string, string[]` | None |
| `onValueChange` | `(value) => void` | None |

## Accessibility

Accordion follows Radix behavior. Tab reaches each trigger, Enter or Space toggles it, and arrows move between triggers in the same root. Triggers expose `aria-expanded` and content uses a region tied to its trigger.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `accordion-trigger` and `accordion-content`. Pass `testID` only when a test needs a custom query value.
