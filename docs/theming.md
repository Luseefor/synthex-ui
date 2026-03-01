# Theming

Synthex UI uses CSS custom properties (`--sx-*`) as its theme contract. Every component references these tokens for colors, spacing, typography, radius, shadows, and motion.

## Token Reference

### Colors

| Token | Light | Dark |
|-------|-------|------|
| `--sx-color-background` | `#f6f8fb` | `#090c11` |
| `--sx-color-surface` | `#ffffff` | `#11161f` |
| `--sx-color-foreground` | `#0f172a` | `#e6edf3` |
| `--sx-color-primary` | `#1d4ed8` | `#5b8cff` |
| `--sx-color-border` | `rgba(148, 163, 184, 0.24)` | `rgba(148, 163, 184, 0.16)` |

See [`styles.css`](../packages/ui/src/styles.css) for the full list.

### Space

| Token | Value |
|-------|-------|
| `--sx-space-xs` | `4px` |
| `--sx-space-sm` | `8px` |
| `--sx-space-md` | `12px` |
| `--sx-space-lg` | `16px` |
| `--sx-space-xl` | `24px` |
| `--sx-space-2xl` | `32px` |

### Typography

| Token | Value |
|-------|-------|
| `--sx-font-size-xs` | `0.75rem` |
| `--sx-font-size-sm` | `0.875rem` |
| `--sx-font-size-md` | `1rem` |
| `--sx-font-size-lg` | `1.125rem` |
| `--sx-font-weight-medium` | `500` |
| `--sx-font-weight-semibold` | `600` |
| `--sx-font-weight-bold` | `700` |

### Motion

| Token | Value |
|-------|-------|
| `--sx-motion-fast` | `120ms` |
| `--sx-motion-normal` | `180ms` |
| `--sx-motion-slow` | `280ms` |
| `--sx-easing-standard` | `cubic-bezier(0.2, 0.2, 0, 1)` |

## createTheme API

```ts
import { createTheme } from "synthex-ui/theme";

const theme = createTheme(
  { colors: { primary: "#7c3aed" } },  // partial overrides
  { mode: "dark", accentPreset: "violet" },
);
```

`createTheme` merges: base theme → accent preset → your overrides.

## Accent Presets

Five built-in accent palettes that override primary/accent/ring colors:

| Preset    | Swatch    |
|-----------|-----------|
| `blue`    | `#2563eb` |
| `emerald` | `#059669` |
| `violet`  | `#7c3aed` |
| `amber`   | `#d97706` |
| `rose`    | `#e11d48` |

```tsx
<ThemeProvider accentPreset="emerald" mode="dark">
```

## Custom Theme

```tsx
import { ThemeProvider } from "synthex-ui/theme";

<ThemeProvider
  mode="dark"
  theme={{
    colors: {
      primary: "#8b5cf6",
      primaryHover: "#7c3aed",
      background: "#09090b",
      surface: "#18181b",
    },
    radius: { md: 8 },
  }}
>
```

## CSS-Only Theming

Without `ThemeProvider`, override tokens directly:

```css
[data-theme="custom"] {
  --sx-color-primary: #8b5cf6;
  --sx-color-background: #09090b;
  --sx-radius-md: 8px;
}
```

Then add the attribute to your HTML:

```html
<div data-theme="custom">...</div>
```
