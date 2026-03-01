# Styling and CSS

## CSS Import Strategy

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

## Tailwind CSS Requirement

Synthex UI components use Tailwind utility classes internally. Your consuming app must include Tailwind and scan the library:

```css
/* your main CSS file */
@import "tailwindcss";
@source "../../node_modules/synthex-ui/dist";
```

### Why Tailwind?

Components reference Tailwind utilities (e.g., `inline-flex`, `rounded-[var(--sx-radius-md)]`) for styling. These classes are resolved by Tailwind's JIT compiler at build time. Without Tailwind, component styles won't render.

## The `cn()` Helper

Synthex UI exports `cn()` (powered by `clsx` + `tailwind-merge`) for composing class names:

```tsx
import { cn } from "synthex-ui/components";

<div className={cn("flex gap-4", isActive && "bg-blue-50", className)} />
```

`tailwind-merge` automatically resolves conflicting utilities (e.g., `p-4` + `px-2` → `py-4 px-2`).

## CSS Custom Properties

All tokens are available as CSS custom properties, so you can use them in your own CSS:

```css
.my-card {
  background: var(--sx-color-surface);
  border: 1px solid var(--sx-color-border);
  border-radius: var(--sx-radius-lg);
  padding: var(--sx-space-lg);
  transition: all var(--sx-motion-fast) var(--sx-easing-standard);
}
```

## Web vs Native

Components have separate web and native implementations:

| Subpath | Platform |
|---------|----------|
| `synthex-ui/web` | React DOM only |
| `synthex-ui/native` | React Native only |
| `synthex-ui/components` | Auto-resolved via package.json `exports` conditions |

The `react-native` condition in `package.json` ensures bundlers like Metro automatically select the `.native.js` entry.
