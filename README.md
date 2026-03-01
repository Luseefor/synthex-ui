# Synthex UI

Synthex UI is a publish-ready monorepo built around three public packages:

- `synthex-ui`: cross-platform component library and theme system
- `@synthex/core`: framework-agnostic layout and command engine
- `@synthex/react-web`: React DOM adapter for dockable workbench rendering

The design-system package is installable like a normal consumer library:

```sh
npm install synthex-ui
```

For workbench-style engineering surfaces, install the engine packages too:

```sh
npm install synthex-ui @synthex/core @synthex/react-web
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

### `@synthex/core`

Pure TypeScript engine package for:

- layout tree types and reducers
- serialization and validation
- deterministic store primitives
- command execution and history

### `@synthex/react-web`

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

Architecture diagrams:

- [Mermaid documentation](/Users/lucifer/Programming/synthex-ui/docs/mermaid-architecture.md)

## Minimal Usage

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
import { createLayoutEngine } from "@synthex/core";
import { LayoutRenderer, useSynthex } from "@synthex/react-web";

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
