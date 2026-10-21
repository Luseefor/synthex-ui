# Aspect ratio

Renders a box that keeps a fixed width to height ratio.

## Import

```tsx
import { AspectRatio } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <AspectRatio ratio={16 / 9}>
      <img src="/cover.jpg" alt="Cover" />
    </AspectRatio>
  );
}
```

## Props

Aspect ratio is uncontrolled. It needs no controlled value and sizes children from the `ratio` prop. Use a single child that fills the box.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `ratio` | `number` | Required |

## Accessibility

Aspect ratio adds no semantics. Give media children text alternatives, such as `alt` on images. Do not use it to crop essential controls.

## Native support

On native `AspectRatio` accepts `testID` with the same value as its web `data-slot`, such as `aspect-ratio`. Pass `testID` only when a test needs a custom query value.
