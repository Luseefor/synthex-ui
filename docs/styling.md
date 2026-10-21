# Styling and CSS

## CSS import strategy

Put both imports in your local CSS entry (order matters), then import that
local file once at app entry:

```css
@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";
```

```ts
import "./styles.css";
```

This provides `--sx-*` custom properties, shadcn-name aliases, dark mode,
`prefers-reduced-motion` handling, and a minimal reset. Order matters:
Tailwind first, then the token surface, then `@source`.

## Tailwind requirement

Components emit Tailwind utilities (e.g. `inline-flex`,
`rounded-[var(--sx-radius-md)]`, `bg-primary`, `text-muted-foreground`).
Your app must include Tailwind and scan the built library:

1. `npm install -D tailwindcss @tailwindcss/vite`
2. Register `@tailwindcss/vite` in `vite.config.ts`.
3. Add the `@source` line above, pointed at the installed
   `synthex-ui/dist` relative to your CSS file
   (the starter uses `@source "../node_modules/synthex-ui/dist"`).

The starter (`templates/starter`) already does all three on this branch.
Without the Tailwind plugin and `@source`, component classes generate no CSS.

## Tailwind companion (`tailwind.css`)

Optional plain-CSS fallback, imported after `styles.css`:

```ts
import "synthex-ui/tailwind.css";
```

It covers keyframes and floating-surface entrances keyed on `data-side` /
`data-align`, plus accordion open/close height animation, with
`prefers-reduced-motion` disabled. `styles.css` carries the token surface;
check which animation entry your component path needs before adding this.

## The `cn()` helper

`cn(...inputs: ClassValue[]): string`, powered by `clsx` + `tailwind-merge`:

```tsx
import { cn } from "synthex-ui";

cn("flex gap-4", isActive && "bg-blue-50", className);
cn("p-4", "px-2");
```

Same input contract as the shadcn `cn` helper, so existing call sites transfer.

## CSS custom properties

```css
.my-card {
  background: var(--sx-color-surface);
  border: 1px solid var(--sx-color-border);
  border-radius: var(--sx-radius-lg);
  padding: var(--sx-space-lg);
}
```

Full token list: `packages/ui/src/styles.css` and
`packages/ui/src/_shared/tokens/*`. Durations in TS tokens are numbers
(milliseconds); CSS exposes `ms` values plus `--sx-easing-standard` and
`--sx-easing-emphasized`.

## Web vs native

| Subpath | Platform |
|---|---|
| `synthex-ui/web` | React DOM only |
| `synthex-ui/native` | React Native only |
| `synthex-ui/components` | Auto-resolved via `exports` conditions |
| `synthex-ui/button` (etc.) | Per-component subpaths with nested `react-native` runtime + `.d.ts` conditions (`packages/ui/package.json`) |

The `react-native` condition selects `.native.js` runtimes and `.native.d.ts`
types under Metro. `add` copies both platform sources plus the shared file
where present; see `docs/registry.md`.

## Charts

Web charts render through `recharts` (`packages/ui/src/chart/chart.web.tsx`);
the native chart path is theme-driven and ignores web-only config plumbing.
Shared API names (`ChartContainer`, `ChartLegendContent`, `ChartStyle`,
`ChartTooltipContent`) match shadcn's config shape:

```tsx
import { ChartContainer, ChartLegendContent, ChartStyle, ChartTooltipContent } from "synthex-ui";

const config = { visitors: { label: "Visitors", color: "#2563eb" } };

<ChartContainer config={config} id="traffic">
  <ChartStyle id={config} config={config} />
  <ChartTooltipContent indicator="dashed" labelKey="visitors" config={config} items={[]} />
  <ChartLegendContent series={[]} />
</ChartContainer>;
```

`config` maps series keys to `{ label, color }`; web exposes
`--color-<key>` vars. Native accepts `config`/`ChartStyle` for signature
parity and renders from theme colors.
