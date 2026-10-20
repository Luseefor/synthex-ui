# Chart

Renders hand rolled SVG charts with shared config and tooltip parts.

## Import

```tsx
import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  const config = { visitors: { label: "Visitors" } };
  return (
    <ChartContainer config={config} id="traffic">
      <ChartStyle id="traffic" config={config} />
      <ChartTooltipContent labelKey="visitors" config={config} items={[]} />
    </ChartContainer>
  );
}
```

## Props

Chart parts are uncontrolled. Pass `config` to map series keys to labels and colors, and pass `series` plus `config` to `LineChart`, `AreaChart` and `BarChart`. No open or value state needs control.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `config` | `ChartConfig` | Required |
| `series` | `ChartSeries[]` | `[]` |
| `indicator` | `dot, line, dashed` | None |

## Accessibility

Charts expose `aria-label` on the SVG wrapper and keep a text summary near the visual. Tooltips appear on hover and focus, and legend entries use plain text. Provide a table or list fallback when values carry decisions.

## Native support

On native chart parts accept `testID` with the same value as their web `data-slot`, such as `chart-container` and `chart-tooltip-content`. `config` is accepted for parity and ignored for color resolution. Pass `testID` only for test queries.
