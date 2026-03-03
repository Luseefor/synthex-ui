# Getting Started

## Installation

```bash
npm install synthex-ui
```

For the layout engine (workbench-style split/tab views):

```bash
npm install synthex-ui @luseefor/synthex-core @luseefor/synthex-react-web
```

## CSS Import

Import the base stylesheet **once** at your app root:

```ts
import "synthex-ui/styles.css";
```

This provides CSS custom properties (`--sx-*`), a minimal reset, and dark mode support.

## Tailwind CSS Setup

Synthex UI components use Tailwind utility classes at build time. You must configure Tailwind to scan the library source:

```css
/* your app's main CSS file */
@import "tailwindcss";
@source "../../node_modules/synthex-ui/dist";
```

> Adjust the `@source` path to match your project structure.

## ThemeProvider

Wrap your app in `ThemeProvider` to enable theming:

```tsx
import { ThemeProvider } from "synthex-ui/theme";
import "synthex-ui/styles.css";

function App() {
  return (
    <ThemeProvider mode="light" accentPreset="blue">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Props

| Prop           | Type                                            | Default   |
|----------------|--------------------------------------------------|-----------|
| `mode`         | `"light" \| "dark"`                              | `"light"` |
| `accentPreset` | `"blue" \| "emerald" \| "violet" \| "amber" \| "rose"` | —         |
| `theme`        | `DeepPartial<SynthexTheme>`                      | —         |

## First Component

```tsx
import { Button } from "synthex-ui/components";

function Demo() {
  return (
    <Button variant="default" size="md">
      Click me
    </Button>
  );
}
```

## Dark Mode

Dark mode works three ways:

1. **ThemeProvider** — `<ThemeProvider mode="dark">`
2. **CSS attribute** — Add `data-theme="dark"` to any ancestor element
3. **System preference** — Automatic via `prefers-color-scheme: dark` (works without ThemeProvider)

## Exports

| Subpath               | Description                     |
|------------------------|---------------------------------|
| `synthex-ui/components`| UI components (Button, Input…)  |
| `synthex-ui/primitives`| Low-level building blocks       |
| `synthex-ui/layout`   | Layout primitives               |
| `synthex-ui/hooks`    | Utility hooks                   |
| `synthex-ui/icons`    | Icon components                 |
| `synthex-ui/theme`    | ThemeProvider, createTheme, tokens |
| `synthex-ui/styles.css`| Base stylesheet                 |
| `synthex-ui/web`      | Web-only exports                |
| `synthex-ui/native`   | React Native exports            |
