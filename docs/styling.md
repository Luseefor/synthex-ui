# Styling and CSS

## CSS import strategy

Synthex UI ships a single CSS file that must be imported once at your app root:

```ts
import "synthex-ui/styles.css";
```

This file provides:
- All `--sx-*` CSS custom properties (colors, space, typography, radius, shadows, motion)
- Complete dark theme overrides via `[data-theme="dark"]`
- Auto dark mode via `prefers-color-scheme: dark`
- `prefers-reduced-motion` support
- A minimal CSS reset (box-sizing, body defaults)

## Tailwind companion (`tailwind.css`)

For the Tailwind `data-[...]` variants the components emit, import this optional plain-CSS fallback after `styles.css`:
`import "synthex-ui/tailwind.css";`
It provides the `sx-fade-up` and `sx-pop-in` keyframes, accordion open and close height animation, floating-surface entrances keyed on `data-side` and `data-align`, and a block that turns off motion for `prefers-reduced-motion`. `styles.css` does not include these keyframes.

## Tailwind CSS requirement

Synthex UI components use Tailwind utility classes internally. Your consuming app must include Tailwind and scan the library:

```css
/* your main CSS file */
@import "tailwindcss";
@source "../../node_modules/synthex-ui/dist";
```

### Why Tailwind?

Components reference Tailwind utilities (e.g., `inline-flex`, `rounded-[var(--sx-radius-md)]`) for styling. Tailwind's JIT compiler resolves these classes at build time. Without Tailwind, component styles won't render.

## The `cn()` helper

Synthex UI exports `cn()`, powered by `clsx` plus `tailwind-merge` with no extra install, for composing class names:

```tsx
import { cn } from "synthex-ui";

cn("flex gap-4", isActive && "bg-blue-50", className); // string
cn("p-4", "px-2"); // -> "p-4 px-2" (conflict resolved)
```

The signature is `function cn(...inputs: ClassValue[]): string`, where `ClassValue` comes from `clsx`.

It matches shadcn `cn`. It uses the same `clsx` plus `tailwind-merge` mix, so existing call sites work unchanged. If you already use shadcn, this feels familiar.

## CSS custom properties

You can use all tokens as CSS custom properties in your own CSS:

```css
.my-card {
  background: var(--sx-color-surface);
  border: 1px solid var(--sx-color-border);
  border-radius: var(--sx-radius-lg);
  padding: var(--sx-space-lg);
  transition: all var(--sx-motion-fast) var(--sx-easing-standard);
}
```

## Web vs native

Components have separate web and native implementations:

| Subpath | Platform |
|---------|----------|
| `synthex-ui/web` | React DOM only |
| `synthex-ui/native` | React Native only |
| `synthex-ui/components` | Auto-resolved via package.json `exports` conditions |

The `react-native` condition in `package.json` ensures bundlers like Metro select the `.native.js` entry.

## Chart shadcn compat (no recharts)

Charts stay hand-rolled SVG with no `recharts` dependency. Only API names match shadcn:

```tsx
import { ChartContainer, ChartLegendContent, ChartStyle, ChartTooltipContent } from "synthex-ui";

const config = { visitors: { label: "Visitors", color: "#2563eb" } };

<ChartContainer config={config} id="traffic">
  <ChartStyle id="traffic" config={config} />
  {/* LineChart / AreaChart / BarChart */}
  <ChartTooltipContent indicator="dashed" labelKey="visitors" config={config} items={[]} />
  <ChartLegendContent series={[]} />
</ChartContainer>;
```

- `config` maps series keys to `{ label, color }`. On web colors become `--color-<key>` vars, inline on `ChartContainer` and scoped via `ChartStyle`.
- `ChartTooltipContent` supports `indicator?: "dot" | "line" | "dashed"` and `labelKey`. It falls back to `config[labelKey].label` when `label` is absent.
- On native the code accepts `config` and `ChartStyle` for parity and ignores them. It uses theme colors directly.
