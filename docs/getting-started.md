# Getting started

> Branch status: `create`, bundled registry/starter, transitive `add`, native
> subpaths, and the Tailwind starter describe `ace/better-than-shadcn`.
> Verify with the gates in `docs/synthex-vs-shadcn.md`.

## Option A: scaffold with the CLI

```sh
npx @luseefor/synthex-cli@latest create my-app
cd my-app
npm install
npm run dev
```

This copies `templates/starter` (Vite + React + Tailwind v4 +
`@tailwindcss/vite`, CSS entry already wired, package renamed to `my-app`).

For the layout engine:

```sh
npm install @luseefor/synthex-core @luseefor/synthex-react-web
```

## Option B: existing Vite + Tailwind v4 app

```sh
npm install synthex-ui
npm install -D tailwindcss @tailwindcss/vite
```

Register the plugin (`vite.config.ts`):

```ts
import tailwindcss from "@tailwindcss/vite";

export default { plugins: [tailwindcss()] };
```

Wire the CSS entry. Both `@import` lines must be in CSS, in this order:

```css
@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";
```

Point `@source` at the installed `synthex-ui/dist` relative to that CSS file.
Then import that local file once at app entry:

```ts
import "./styles.css";
```

## ThemeProvider

```tsx
import { ThemeProvider } from "synthex-ui/theme";

function App() {
  return (
    <ThemeProvider mode="light" accentPreset="blue">
      <YourApp />
    </ThemeProvider>
  );
}
```

| Prop | Type | Default |
|---|---|---|
| `mode` | `"light" \| "dark"` | `"light"` |
| `accentPreset` | 9 presets below | None (base blue) |
| `theme` | `DeepPartial<SynthexTheme>` | None |

Accents: `blue`, `emerald`, `violet`, `amber`, `rose`, `steel`, `stone`,
`bronze`, `mulberry` (steel/stone/bronze/mulberry have mode-aware dark
overrides; see `packages/ui/src/_shared/theme/createTheme.ts`).

## First component

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

## Own the source with `add`

```sh
npx @luseefor/synthex-cli@latest list
npx @luseefor/synthex-cli@latest add button --dry-run
npx @luseefor/synthex-cli@latest add button card
npx @luseefor/synthex-cli@latest add button --overwrite
```

- Copies `.web.*` + `.native.*`, plus the shared file (`.shared.ts`/`shared.ts`)
  where present (simple components such as `label` and `table` have none);
  test files (`*.test.*`, `*.spec.*`, `__tests__`) are excluded.
- Resolves transitive `registryDependencies`, preflights every destination
  before writing. Re-running with identical sources reports
  `skipped-existing`; only changed files refuse without `--overwrite`, so no
  partial copies.
- Namespaces: `@synthex/<name>`, `@default/<name>`, bare `@<name>` accepted;
  other registries are rejected.
- Prints a `bun add …` hint from transitive `deps`; it can include native-only
  packages, so filter it for web-only apps.

## Dark mode

1. `mode="dark"` on `ThemeProvider`, or
2. `data-theme="dark"` on any ancestor, or
3. `prefers-color-scheme: dark` with no provider (CSS fallback in `styles.css`).

## Exports

| Subpath | Description |
|---|---|
| `synthex-ui/components` | UI components (Button, Input…) |
| `synthex-ui/blocks` | App blocks (AssistantChatPanel, KPIStatGrid…), alias of `dist/synthex` |
| `synthex-ui/primitives` | Low-level building blocks |
| `synthex-ui/layout` | Layout primitives |
| `synthex-ui/hooks` | Utility hooks |
| `synthex-ui/icons` | Icon components |
| `synthex-ui/theme` | ThemeProvider, createTheme, tokens |
| `synthex-ui/styles.css` | Base stylesheet |
| `synthex-ui/tailwind.css` | Optional plain-CSS keyframe/animation fallback |
| `synthex-ui/web` | React DOM only |
| `synthex-ui/native` | React Native only |
| `synthex-ui/button` (etc.) | Per-component subpaths with nested `react-native` runtime + `.d.ts` conditions |
