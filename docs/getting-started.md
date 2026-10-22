# Getting started

> These instructions target `@luseefor/synthex-cli@1.2+` and `synthex-ui@2+`.
> If your installed packages predate those versions, run the CLI from source
> (`packages/cli`) in this checkout. See `docs/frameworks.md` for the
> per-framework reference and `docs/releases/v1.2.md` for version scope.

## Option A: scaffold with the CLI

```sh
npx @luseefor/synthex-cli@latest create my-app
npx @luseefor/synthex-cli@latest create my-app --template next
npx @luseefor/synthex-cli@latest create my-app --template expo
```

`--template vite|next|expo` defaults to `vite`.
`--package-manager npm|pnpm|yarn|bun` overrides detection.
`--cwd <dir>` sets the parent directory; `--dry-run` previews files.
`create` copies the starter and renames `package.json[name]`; it does not
install dependencies. Then:

```sh
cd my-app
npm install
npm run dev # Vite / Next
npm start # Expo (expo start)
```

(Use your manager's syntax: `pnpm install` / `pnpm dev` / `pnpm start`,
`yarn install` / `yarn dev` / `yarn start`, `bun install` /
`bun run dev` / `bun run start`.)

For the layout engine:

```sh
npm install @luseefor/synthex-core @luseefor/synthex-react-web
```

## Option B: wire an existing app with `setup`

```sh
npx @luseefor/synthex-cli@latest setup --dry-run
npx @luseefor/synthex-cli@latest setup
npx @luseefor/synthex-cli@latest setup --cwd apps/web
```

Without `--framework`, `setup` detects the framework from `dependencies` /
`devDependencies` (`expo`, `next`, or `vite`); config files alone are not
enough. `--package-manager npm|pnpm|yarn|bun` overrides detection.

`setup` writes `synthex-ui.json` + a CSS entry (web only) + a
`ThemeProvider`-based provider wrapper, then prints install and
manual-wiring steps. It does not install dependencies and does not edit
`vite.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `src/main.tsx`,
or `App.tsx`; you run the printed install and wire the entry point by hand.
Next requires the App Router (`app/` or `src/app/`); Expo writes no CSS and
imports from `synthex-ui/native`. Full details in `docs/frameworks.md`.

Manual wiring after `setup` (short version):

- Vite: run both printed installs (`synthex-ui` plus
  `tailwindcss @tailwindcss/vite` as dev dependencies), keep
  `@tailwindcss/vite` in `vite.config.ts`, import the generated
  `synthex.css` once from your app entry, wrap your root with the generated
  `SynthexProvider`.
- Next: run both printed installs (`synthex-ui` plus
  `tailwindcss @tailwindcss/postcss postcss` as dev dependencies), keep
  `@tailwindcss/postcss` in `postcss.config.mjs`, import `./synthex.css`
  from the root layout (recommended), render the `"use client"`
  `SynthexProvider` around children.
- Expo: run `npm install synthex-ui lucide-react-native` plus the SDK-aware
  `npx expo install react-native-svg react-dom --npm` (pnpm: `pnpm exec expo install
  react-native-svg --pnpm`; yarn: `yarn expo install react-native-svg react-dom
  --yarn`; bun: `bunx expo install react-native-svg react-dom --bun`; never a plain
  package-manager add), wrap `App.tsx` with the
  generated `SynthexProvider` (which imports theming from
  `synthex-ui/native`). No CSS on native.

`init` is the legacy layout-engine command (writes `layout.json` and
engine config). It does not set up a framework; use `setup` for
Vite/Next/Expo apps.

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

On native, import from `synthex-ui/native` instead.

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
- Destination is `componentsDir` from `synthex-ui.json` when that config
  exists in `--cwd`, otherwise the legacy default `components/ui`.
- Namespaces: `@synthex/<name>`, `@default/<name>`, bare `@<name>` accepted;
  other registries are rejected.
- Prints an install hint for transitive `deps` in your package-manager
  syntax (resolved from `--cwd` config/detection); it can include native-only
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
