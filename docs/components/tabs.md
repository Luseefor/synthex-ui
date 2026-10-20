# Tabs

Renders a tab list with associated content panels.

## Import

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
    </Tabs>
  );
}
```

## Props

Tabs support controlled and uncontrolled use. Pass `value` with `onValueChange` for controlled state, or `defaultValue` for uncontrolled state. Each trigger and panel pair must share the same `value`.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |

## Accessibility

Tabs follow Radix behavior. Arrows move between triggers, Home and End jump to list edges, and Tab moves from the active trigger into its panel. Triggers use `role="tab"` with `aria-selected` and panels use `role="tabpanel"`.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `tabs-list` and `tabs-trigger`. Pass `testID` only when a test needs a custom query value.
