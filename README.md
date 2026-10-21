# Synthex UI

Web + React Native components from one API, plus an optional dockable workbench engine.

> Branch status (`ace/framework-onboarding`): `create --template` and `setup`
> below describe the CLI source in this checkout. They are slated for an
> upcoming `@luseefor/synthex-cli` release and are not yet in the published
> `npx @luseefor/synthex-cli@latest` build. See `docs/frameworks.md`.

## Install

```sh
npx @luseefor/synthex-cli@latest create my-app
npx @luseefor/synthex-cli@latest create my-app --template next
npx @luseefor/synthex-cli@latest create my-app --template expo
```

`--template vite|next|expo` defaults to `vite`. Then `cd my-app`,
run the printed install (`npm install`, `pnpm install`, `yarn install`,
or `bun install`), and run the starter (`npm run dev` for Vite / Next,
`npm start` for Expo).

Or wire an existing app:

```sh
npx @luseefor/synthex-cli@latest setup --dry-run
npx @luseefor/synthex-cli@latest setup
npx @luseefor/synthex-cli@latest setup --cwd apps/web
```

`setup` detects `vite`/`next`/`expo` from dependencies unless
`--framework` is passed, writes `synthex-ui.json` + CSS (web) + provider,
then prints the install and manual-wiring steps. It does not install deps
and does not edit `vite.config.ts`, `postcss.config.mjs`, `layout.tsx`,
or `App.tsx`.

Workbench engine (only if you need dockable panels):

```sh
npm install synthex-ui @luseefor/synthex-core @luseefor/synthex-react-web
```

The CLI binary is `synthex`:

```sh
npx @luseefor/synthex-cli@latest --help
npx @luseefor/synthex-cli@latest list
npx @luseefor/synthex-cli@latest add button --dry-run
```

## Setup (Vite / Next / Expo)

`create` copies `templates/starter` (vite), `templates/next`, or
`templates/native` from CLI source. For an existing app, `setup` writes the
CSS entry and provider; you finish the wiring by hand. Full per-framework
reference in `docs/frameworks.md`.

Vite: run both printed installs (`synthex-ui` plus
`tailwindcss @tailwindcss/vite` as dev dependencies), keep
`@tailwindcss/vite` in `vite.config.ts`, import the generated
`synthex.css` once from your app entry, wrap your root with the generated
`SynthexProvider`.

Next (App Router): run both printed installs (`synthex-ui` plus
`tailwindcss @tailwindcss/postcss postcss` as dev dependencies), keep
`@tailwindcss/postcss` in `postcss.config.mjs`,
import `./synthex.css` from the root layout (recommended), render the
`"use client"` `SynthexProvider` around children. `pages/` is not supported.

Expo (SDK 58): no CSS. Run `npm install synthex-ui lucide-react-native` plus the SDK-aware
`npx expo install react-native-svg react-dom --npm` (never a plain package-manager
add), wrap `App.tsx` with the
generated `SynthexProvider` (which imports theming from
`synthex-ui/native`), and import components from `synthex-ui/native`.

The generated CSS entry (order matters):

```css
@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";
```

Adjust `@source` to point at the installed `synthex-ui/dist` from your CSS file.

Then import that local file once at app entry:

```ts
import "./synthex.css";
```

`init` is the legacy layout-engine command (engine config only). Use
`setup` for framework onboarding.

## Example

```tsx
import { Button } from "synthex-ui/components";
import { ThemeProvider } from "synthex-ui/theme";

export function Example() {
  return (
    <ThemeProvider mode="light" accentPreset="blue">
      <Button>Run</Button>
    </ThemeProvider>
  );
}
```

On native, import from `synthex-ui/native`.

9 accents: `blue`, `emerald`, `violet`, `amber`, `rose`, `steel`, `stone`, `bronze`, `mulberry`.

[Live preview](https://synthex-ui.rijan.sh)

## Own the source (optional)

Copy web + native sources into your repo with transitive deps resolved:

```sh
npx @luseefor/synthex-cli@latest add button card --dry-run
npx @luseefor/synthex-cli@latest add button card
```

Destination is `componentsDir` from `synthex-ui.json` when present,
otherwise the legacy default `components/ui`. `@synthex/<name>`,
`@default/<name>`, and `@<name>` are accepted; other
namespaces are rejected. The printed install hint uses your package-manager
syntax (resolved from `--cwd` config/detection) and can include native-only
packages, so filter it for web-only apps. See `docs/registry.md` and
`docs/frameworks.md`.

## Workbench

```tsx
import { createLayoutEngine } from "@luseefor/synthex-core";
import { LayoutRenderer, useSynthex } from "@luseefor/synthex-react-web";

const engine = createLayoutEngine({
  id: "editor",
  type: "panel",
  panelType: "editor",
  title: "Editor",
});

export function Workbench() {
  const layout = useSynthex(engine);

  return (
    <LayoutRenderer
      layout={layout}
      onAction={(action) => {
        engine.dispatch(action);
      }}
    />
  );
}
```

## Packages

- `synthex-ui` — components (`components`, `primitives`, `layout`, `hooks`, `icons`, `theme`, `styles.css`, `web`, `native`, per-component `button`… subpaths with nested `react-native` runtime + `.d.ts` conditions)
- `@luseefor/synthex-core` — layout tree, reducer, engine, validation, commands, store, serialization
- `@luseefor/synthex-react-web` — `LayoutRenderer`, `SplitView`, `TabView`, `useSynthex`
- `@luseefor/synthex-cli` — `synthex` CLI (`create`, `setup`, `add`, `list`, `migrate`, `validate`, `init`, `layout:*`, `undo`/`redo`, `run`, `history`)

## Development

```sh
bun install
bun run check-types
bun run test
bun run build
bun run release:check
bun run dev
```

## Documentation

- [Getting started](docs/getting-started.md)
- [Frameworks (Vite / Next / Expo)](docs/frameworks.md)
- [Theming](docs/theming.md)
- [Styling](docs/styling.md)
- [Registry and `add`](docs/registry.md)
- [Workbench](docs/workbench.md)
- [LLMs](docs/llms.txt)

No full web/native API parity or full a11y certification is claimed.

## Repository

[https://github.com/Luseefor/synthex-ui](https://github.com/Luseefor/synthex-ui)

## License

MIT. See [LICENSE](LICENSE).

### Safe component updates (upcoming CLI release)

The CLI records installed originals in `.synthex/components.json`. Preview with
`synthex diff button`, then use `synthex update button --dry-run` before applying
`synthex update button`. Independent edits merge; conflicting edits require
manual review, and applied changes have backups. See
[updating components](./docs/updating-components.md) for conflict resolution,
legacy copies, and recovery.
