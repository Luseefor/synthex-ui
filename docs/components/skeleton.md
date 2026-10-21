# Skeleton

Renders a loading placeholder with pulse styles.

## Import

```tsx
import { Skeleton } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <div>
      <Skeleton width="40%" height={16} />
      <Skeleton width="100%" height={48} />
    </div>
  );
}
```

## Props

Skeleton is uncontrolled. It needs no controlled value and renders static placeholders with variant styles. Use width and height props to match real content.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `width` | `string, number` | None |
| `height` | `string, number` | None |

## Accessibility

Skeleton uses `aria-busy` on the parent while loading and hides placeholder nodes from screen readers. Replace skeletons with real content promptly and avoid flashing many placeholders.

## Native support

On native `Skeleton` maps `data-slot="skeleton"` to `testID="skeleton"`. Pass `testID` only when a test needs a custom query value.
