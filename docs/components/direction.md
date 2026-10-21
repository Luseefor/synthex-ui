# Direction

Provides text direction context for left to right layouts.

## Import

```tsx
import { DirectionProvider, useDirection } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <DirectionProvider dir="ltr">
      <Toolbar />
    </DirectionProvider>
  );
}

function Toolbar() {
  const { dir } = useDirection();
  return <span>{dir}</span>;
}
```

## Props

Direction provider supports controlled and uncontrolled use. Pass `dir` with `onDirChange` for controlled state, or omit `dir` for uncontrolled state with automatic resolution.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `dir` | `ltr, rtl` | None |
| `onDirChange` | `(dir: string) => void` | None |

## Accessibility

Direction sets the `dir` attribute on web so screen readers and layout follow the reading order. Keep direction consistent across the page and avoid mixing directions in one sentence.

## Native support

On native `DirectionProvider` maps direction to `View` style with matching `testID`. Pass `testID` only when a test needs a custom query value.
