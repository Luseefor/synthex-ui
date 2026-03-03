# Synthex UI Mermaid Documentation

This document captures the repo structure, package boundaries, runtime flows, and release pipeline using Mermaid diagrams.

## Monorepo Package Topology

```mermaid
flowchart LR
  Root["synthex-ui-workspace"] --> Core["@luseefor/synthex-core"]
  Root --> UI["synthex-ui"]
  Root --> ReactWeb["@luseefor/synthex-react-web"]
  Root --> Preview["@luseefor/web-preview"]
  Root --> CLI["@luseefor/synthex-cli"]

  ReactWeb --> Core
  Preview --> UI
  Preview --> Core
  Preview --> ReactWeb
  CLI --> Core
```

## Public Package Responsibilities

```mermaid
flowchart TD
  UI["synthex-ui"] --> UIComp["components"]
  UI --> UIPrim["primitives"]
  UI --> UILayout["layout"]
  UI --> UIHooks["hooks"]
  UI --> UIIcons["icons"]
  UI --> UITheme["theme"]
  UI --> UICSS["styles.css"]

  Core["@luseefor/synthex-core"] --> Layout["layout tree + reducer"]
  Core --> Commands["command registry + history"]
  Core --> Store["store + events"]
  Core --> Serialize["serialization + validation"]

  ReactWeb["@luseefor/synthex-react-web"] --> Renderer["LayoutRenderer"]
  ReactWeb --> Split["SplitView"]
  ReactWeb --> Tabs["TabView"]
  ReactWeb --> Hook["useSynthex"]
```

## UI Package Internal Structure

```mermaid
flowchart TD
  Shared["_shared"] --> Tokens["tokens"]
  Shared --> Variants["variants"]
  Shared --> Theme["theme"]
  Shared --> Types["types"]

  UI["synthex-ui/src"] --> Shared
  UI --> Components["component folders"]
  UI --> Primitives["primitives"]
  UI --> Layout["layout"]
  UI --> Hooks["hooks"]
  UI --> Icons["icons"]
  UI --> EntryWeb["index.web.ts"]
  UI --> EntryNative["index.native.ts"]

  Components --> Inputs["input / textarea / select / form"]
  Components --> Navigation["tabs / breadcrumb / sidebar / menubar"]
  Components --> Overlays["dialog / drawer / popover / tooltip / toast"]
  Components --> Feedback["alert / badge / progress / skeleton"]
  Components --> Data["table / data-table / chart / pagination"]
  Components --> Utilities["command / combobox / resizable / carousel"]
```

## Theme Resolution Flow

```mermaid
flowchart LR
  Preset["accent preset"] --> CreateTheme["createTheme"]
  Overrides["theme overrides"] --> CreateTheme
  Mode["light or dark mode"] --> CreateTheme

  CreateTheme --> Semantic["semantic token set"]
  Semantic --> WebProvider["ThemeProvider.web"]
  Semantic --> NativeProvider["ThemeProvider.native"]
  WebProvider --> CSSVars["CSS variables"]
  NativeProvider --> NativeValues["native token values"]
```

## Layout Engine Model

```mermaid
flowchart TD
  Node["LayoutNode"] --> Split["split node"]
  Node --> Tabs["tabs node"]
  Node --> Panel["panel node"]

  Split --> SplitMeta["direction + sizes + children"]
  Tabs --> TabsMeta["activePanelId + panel children"]
  Panel --> PanelMeta["panelType + title"]

  Reducer["layoutReducer"] --> Add["ADD_PANEL"]
  Reducer --> Remove["REMOVE_PANEL"]
  Reducer --> SplitAction["SPLIT_NODE"]
  Reducer --> Move["MOVE_NODE"]
  Reducer --> Resize["RESIZE_SPLIT"]

  Reducer --> Normalize["normalization"]
  Normalize --> Validate["validation"]
```

## Workbench Interaction Sequence

```mermaid
sequenceDiagram
  participant User
  participant Preview as web-preview
  participant Renderer as @luseefor/synthex-react-web
  participant Engine as @luseefor/synthex-core engine
  participant Registry as command registry

  User->>Preview: click split / add / undo / redo
  Preview->>Engine: dispatch LayoutAction
  Engine->>Registry: run command
  Registry->>Engine: apply reducer transition
  Engine-->>Preview: new layout state
  Preview->>Renderer: render layout tree
  Renderer-->>User: updated docked workbench
```

## Preview App Route Map

```mermaid
flowchart TD
  App["web-preview app"] --> Overview["/"]
  App --> Install["/installation"]
  App --> Components["/components"]
  App --> Theme["/theme"]
  App --> Engine["/engine"]
  App --> Playground["/playground"]

  Components --> Gallery["live component gallery"]
  Theme --> Accent["accent presets + mode switching"]
  Engine --> Matrix["support matrix + exports"]
  Playground --> Workbench["live layout engine workbench"]
```

## Release Verification Pipeline

```mermaid
flowchart LR
  Install["bun install"] --> Typecheck["bun run check-types"]
  Typecheck --> Test["bun run test"]
  Test --> Build["bun run build"]
  Build --> ReleaseCheck["bun run release:check"]
  ReleaseCheck --> PackCheck["bun run pack:check"]
  PackCheck --> Publish["@luseefor/synthex-core -> synthex-ui -> @luseefor/synthex-react-web"]
```

## CI Flow

```mermaid
flowchart TD
  Push["push or pull_request"] --> Checkout["actions/checkout"]
  Checkout --> SetupBun["setup bun 1.3.2"]
  SetupBun --> Install["bun install --frozen-lockfile"]
  Install --> Typecheck["check-types"]
  Typecheck --> Test["test"]
  Test --> Build["build"]
  Build --> Verify["release:check"]
  Verify --> Pack["pack:check"]
```

## Package Publish Order

```mermaid
flowchart LR
  Core["@luseefor/synthex-core"] --> UI["synthex-ui"]
  UI --> ReactWeb["@luseefor/synthex-react-web"]
```

## Consumer Install Matrix

```mermaid
flowchart TD
  Consumer["application"] --> UIOnly["npm install synthex-ui"]
  Consumer --> Workbench["npm install synthex-ui @luseefor/synthex-core @luseefor/synthex-react-web"]

  UIOnly --> WebUI["web or native design system usage"]
  Workbench --> EngineUI["dockable web workbench usage"]
```
