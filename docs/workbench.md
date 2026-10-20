# Workbench integration

`@luseefor/synthex-react-web` provides a dockable workbench layout system on top of the `@luseefor/synthex-core` layout engine.

## Setup

```bash
npm install synthex-ui @luseefor/synthex-core @luseefor/synthex-react-web
```

```tsx
import { ThemeProvider } from "synthex-ui/theme";
import { LayoutRenderer, useSynthex } from "@luseefor/synthex-react-web";
import "synthex-ui/styles.css";

function Workbench() {
  const synthex = useSynthex({ layout: initialLayout });

  return (
    <ThemeProvider mode="dark">
      <LayoutRenderer
        layout={synthex.layout}
        renderPanel={(panel) => <YourPanel panel={panel} />}
      />
    </ThemeProvider>
  );
}
```

## Components

### LayoutRenderer

`LayoutRenderer` renders a layout tree of split panes and tab groups.

| Prop | Type | Description |
|------|------|-------------|
| `layout` | `LayoutNode` | Root layout node from `@luseefor/synthex-core` |
| `renderPanel` | `(panel: PanelNode) => ReactNode` | Render each panel's content |
| `selectedNodeId` | `string \| null` | Currently selected node for highlighting |
| `onSelectNode` | `(id: string) => void` | Selection callback |
| `theme` | `Partial<WorkbenchTheme>` | Theme overrides |

### SplitView

SplitView renders horizontal and vertical split panes. Drag the handle to resize.

### TabView

TabView renders a tabbed container with a tab rail and an active panel.

## Theme integration

The workbench inherits `SynthexTheme` colors via CSS variable cascade:

```
--synthex-workbench-* (consumer override)
  → --sx-* (from ThemeProvider)
    → hardcoded fallback
```

### Custom workbench theme

I keep workbench overrides in CSS. It is easier to scan than a theme prop.

Override specific workbench tokens:

```css
.my-workbench {
  --synthex-workbench-canvas: #0a0a0f;
  --synthex-workbench-border: rgba(255, 255, 255, 0.08);
  --synthex-workbench-tab-active: rgba(255, 255, 255, 0.06);
}
```

Or pass a `theme` prop:

```tsx
<LayoutRenderer
  layout={layout}
  theme={{
    canvasBackground: "#0a0a0f",
    tabActiveBackground: "rgba(255,255,255,0.06)",
  }}
  renderPanel={renderPanel}
/>
```

## useSynthex

`useSynthex` manages workbench state, including layout, undo/redo, and serialization:

```tsx
const synthex = useSynthex({
  layout: initialLayout,
  commands: myCommands,
});

// synthex.layout: current layout tree
// synthex.dispatch: command dispatcher
// synthex.undo / synthex.redo: history navigation
```
