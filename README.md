# Synthex UI

Synthex UI is a pre-release monorepo for building serious product surfaces with a cross-platform design system and a framework-agnostic layout engine.

It is split into focused packages instead of collapsing everything into one library:

- `@synthex/ui`: cross-platform design-system package with components, primitives, hooks, icons, theme, and the web stylesheet.
- `@synthex/core`: pure TypeScript layout and command engine with no React or DOM dependencies.
- `@synthex/react-web`: thin React DOM adapter for rendering the layout engine on the web.
- `@synthex/web-preview`: Vite docs and preview app used to verify the public package surface.
- `@synthex/cli`: Bun-based CLI for scripting and layout workflows.

## Status

Synthex UI is in active pre-release development. APIs and package contents are still being hardened before a stable `1.0`.

## Package Model

### `@synthex/ui`

Primary consumer package for application teams.

Root exports include:

- `ThemeProvider`, `createTheme`, `defaultTheme`, `lightTheme`, `darkTheme`, `useTheme`
- `Box`, `Text`, `Stack`, `Inline`, `Grid`, `Surface`, `PressablePrimitive`, `ScrollArea`
- `Button`, `Card`, `Input`, `Tabs`, `Badge`, `Separator`, `H1`, `H2`, `H3`, `Lead`, `Muted`, `Small`
- `useControllableState`, `useDisclosure`, `usePlatformValue`, `useReducedMotion`
- `Icon`, `iconMap`, and a curated named icon set

Subpath exports:

- `@synthex/ui/components`
- `@synthex/ui/primitives`
- `@synthex/ui/layout`
- `@synthex/ui/hooks`
- `@synthex/ui/icons`
- `@synthex/ui/theme`
- `@synthex/ui/styles.css`
- `@synthex/ui/web`
- `@synthex/ui/native`

### `@synthex/core`

Framework-agnostic engine package for:

- layout tree types and reducer logic
- command dispatch and history
- serialization and validation
- deterministic store abstractions

### `@synthex/react-web`

Web-only adapter package for the engineering layout surface:

- `LayoutRenderer`
- `SplitView`
- `TabView`
- `useSynthex`

It intentionally does not own design-system components.

## Development

Install dependencies:

```sh
bun install
```

Type-check the full workspace:

```sh
bun run check-types
```

Run tests:

```sh
bun run test
```

Build all packages:

```sh
bun run build
```

Run the docs and preview app:

```sh
bun run dev
```

## Minimal Usage

Web app:

```tsx
import "@synthex/ui/styles.css";
import { Button } from "@synthex/ui/components";
import { ThemeProvider } from "@synthex/ui/theme";

export function Example() {
  return (
    <ThemeProvider>
      <Button>Run</Button>
    </ThemeProvider>
  );
}
```

Layout engine integration:

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

## Package Structure

```text
packages/
  core/         Pure engine package
  ui/           Cross-platform design system
  react-web/    Layout-engine React DOM adapter
  web-preview/  Vite docs and preview app
  cli/          Bun CLI
```

## Release Direction

This milestone focuses on:

- stabilizing the `@synthex/ui` public surface
- keeping `@synthex/react-web` narrowly scoped
- generating declaration files in `dist`
- validating subpath exports through the preview app
- strengthening tests around variants, components, theme, and layout integration
