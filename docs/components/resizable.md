# Resizable

Renders adjustable panels with a drag handle.

## Import

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>Left</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>Right</ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

## Props

Resizable is uncontrolled. It needs no controlled value and sizes panels from default and min props. Use `direction` to set the split axis.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `direction` | `horizontal, vertical` | Required |
| `defaultSize` | `number` | None |

## Accessibility

Resizable handle uses `role="separator"` with keyboard support. Arrows resize when the handle has focus. Keep panels labeled when they hold distinct regions.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `resizable-panel` and `resizable-handle`. Pass `testID` only when a test needs a custom query value.
