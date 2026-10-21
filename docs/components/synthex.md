# Synthex

Provides app blocks such as stat grids and marquees.

## Import

```tsx
import { KPIStatGrid, Marquee } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  const stats = [{ id: "a", label: "Users", value: "8200" }];
  return (
    <div>
      <KPIStatGrid stats={stats} columns={2} />
      <Marquee items={[{ id: "a", label: "New" }]} />
    </div>
  );
}
```

## Props

Synthex blocks are uncontrolled. They need no controlled value and render from `stats` or `items` data props. Use `columns` to set grid width and `speed` to tune marquee motion.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `stats` | `KPIStatItem[]` | Required |
| `items` | `MarqueeItem[]` | Required |
| `columns` | `2, 3, 4` | `4` |

## Accessibility

Blocks use plain headings and text so screen readers read values in order. Marquee pauses on hover and respects reduced motion. Provide a static list when motion carries meaning.

## Native support

On native blocks accept `testID` with the same value as their web `data-slot`, such as `kpi-stat-grid` and `marquee`. Pass `testID` only when a test needs a custom query value.
