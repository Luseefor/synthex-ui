# Synthex UI

Shadcn-parity components for web with the same API on React Native.

## Install

```sh
npm install synthex-ui
```

## Example

```tsx
import "synthex-ui/styles.css";
import { Button } from "synthex-ui/components";
import { ThemeProvider } from "synthex-ui/theme";
export function Example() {
  return (
    <ThemeProvider>
      <Button>Run</Button>
    </ThemeProvider>
  );
}
```

[Live preview](https://synthex-ui.rijan.sh)

For workbench-style engineering surfaces, install the engine packages too:

```sh
npm install synthex-ui @luseefor/synthex-core @luseefor/synthex-react-web
```

## Packages

### `synthex-ui`

Main consumer package for web and native applications.

Exports:

- `synthex-ui`
- `synthex-ui/components`
- `synthex-ui/primitives`
- `synthex-ui/layout`
- `synthex-ui/hooks`
- `synthex-ui/icons`
- `synthex-ui/theme`
- `synthex-ui/styles.css`
- `synthex-ui/web`
- `synthex-ui/native`

### `@luseefor/synthex-core`

Pure TypeScript engine package for:

- layout tree types and reducers
- serialization and validation
- deterministic store primitives
- command execution and history

### `@luseefor/synthex-react-web`

Web-only adapter for rendering the core layout engine with:

- `LayoutRenderer`
- `SplitView`
- `TabView`
- `useSynthex`

## Development

```sh
bun install
bun run check-types
bun run test
bun run build
bun run release:check
```

Run the docs and preview app:

```sh
bun run dev
```

## Documentation

- [Getting started](docs/getting-started.md)
- [Theming](docs/theming.md)
- [Styling](docs/styling.md)
- [Workbench](docs/workbench.md)
- [Architecture diagrams](docs/mermaid-architecture.md)

## Minimal usage

```tsx
import "synthex-ui/styles.css";
import { Button } from "synthex-ui/components";
import { ThemeProvider } from "synthex-ui/theme";

export function Example() {
  return (
    <ThemeProvider>
      <Button>Run</Button>
    </ThemeProvider>
  );
}
```

Workbench integration:

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

## Repository

[https://github.com/Luseefor/synthex-ui](https://github.com/Luseefor/synthex-ui)

## License

MIT. See [LICENSE](LICENSE).
