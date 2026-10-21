# Typography

Renders styled headings and body text parts.

## Import

```tsx
import { H1, Muted, P } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <div>
      <H1>Title</H1>
      <P>Body copy goes here.</P>
      <Muted>Updated today</Muted>
    </div>
  );
}
```

## Props

Typography is uncontrolled. It needs no controlled value and renders static text with preset styles. Use `H1` through `H4` for heading order.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `children` | `ReactNode` | Required |

## Accessibility

Typography uses real heading and paragraph elements so screen readers follow document order. Keep one `H1` per page and do not skip heading levels. Keep line length readable.

## Native support

On native text parts accept `testID` with the same value as their web `data-slot`, such as `h1` and `muted`. Pass `testID` only when a test needs a custom query value.
