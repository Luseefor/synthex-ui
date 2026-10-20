# Carousel

Renders a scrollable row of items with previous and next controls.

## Import

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>One</CarouselItem>
        <CarouselItem>Two</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

## Props

Carousel is uncontrolled by default and keeps its scroll position internally. Pass an `api` or `opts` object when the app needs to read or drive the active index. Item size comes from layout classes on `CarouselItem`.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `orientation` | `horizontal, vertical` | `horizontal` |
| `opts` | `CarouselOptions` | None |

## Accessibility

Carousel keeps items in reading order and exposes previous and next as buttons. Tab reaches each control, arrows scroll when the scroller has focus, and `aria-roledescription` identifies the region. Avoid auto play, or provide a pause control.

## Native support

On native carousel parts accept `testID` with the same value as their web `data-slot`, such as `carousel-content` and `carousel-item`. Pass `testID` only when a test needs a custom query value.
