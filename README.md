# Synthex UI

Web + React Native components from one API, plus an optional dockable workbench engine.

> Branch status (`ace/better-than-shadcn`): the CLI notes below describe this
> checkout (bundled registry/starter, transitive `add`, native subpaths,
> Tailwind starter). Verify with the gates in `docs/synthex-vs-shadcn.md`;
> they are not published release facts.

## Install

```sh
npx @luseefor/synthex-cli@latest create my-app
```

Or add to an existing project:

```sh
npm install synthex-ui
```

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

## Setup (Vite + Tailwind v4)

`create` already scaffolds this. For an existing app, install the Vite plugin:

```sh
npm install -D tailwindcss @tailwindcss/vite
```

Register it in `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";

export default { plugins: [tailwindcss()] };
```

Then in your CSS entry (imports must be in CSS, order matters):

```css
@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";
```

Adjust `@source` to point at the installed `synthex-ui/dist` from your CSS file.

Then import that local file once at app entry:

```ts
import "./styles.css";
```

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

9 accents: `blue`, `emerald`, `violet`, `amber`, `rose`, `steel`, `stone`, `bronze`, `mulberry`.

[Live preview](https://synthex-ui.rijan.sh)

## Own the source (optional)

Copy web + native sources into your repo with transitive deps resolved:

```sh
npx @luseefor/synthex-cli@latest add button card --dry-run
npx @luseefor/synthex-cli@latest add button card
```

`@synthex/<name>`, `@default/<name>`, and `@<name>` are accepted; other
namespaces are rejected. The printed `bun add …` hint can include native-only
packages, so filter it for web-only apps. See `docs/registry.md`.

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
- `@luseefor/synthex-cli` — `synthex` CLI (`create`, `add`, `list`, `migrate`, `validate`, `init`, `layout:*`, `undo`/`redo`, `run`, `history`)

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

- [Comparison journey matrix](docs/synthex-vs-shadcn.md)
- [Getting started](docs/getting-started.md)
- [Theming](docs/theming.md)
- [Styling](docs/styling.md)
- [Registry and `add`](docs/registry.md)
- [Workbench](docs/workbench.md)
- [LLMs](docs/llms.txt)

No full web/native API parity or full a11y certification is claimed; see the
comparison doc for gates and gaps.

## Repository

[https://github.com/Luseefor/synthex-ui](https://github.com/Luseefor/synthex-ui)

## License

MIT. See [LICENSE](LICENSE).
