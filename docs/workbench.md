# Workbench Integration

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

Recursively renders a layout tree of split panes and tab groups.

| Prop | Type | Description |
|------|------|-------------|
| `layout` | `LayoutNode` | Root layout node from `@luseefor/synthex-core` |
| `renderPanel` | `(panel: PanelNode) => ReactNode` | Render each panel's content |
| `selectedNodeId` | `string \| null` | Currently selected node for highlighting |
| `onSelectNode` | `(id: string) => void` | Selection callback |
| `theme` | `Partial<WorkbenchTheme>` | Theme overrides |

### SplitView

Renders horizontal/vertical split panes with a draggable resize handle.

### TabView

Renders a tabbed container with tab rail and active panel.

## Theme Integration

The workbench automatically inherits `SynthexTheme` colors via CSS variable cascade:

```
--synthex-workbench-* (consumer override)
  → --sx-* (from ThemeProvider)
    → hardcoded fallback
```

### Custom Workbench Theme

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

Hook for managing workbench state (layout, undo/redo, serialization):

```tsx
const synthex = useSynthex({
  layout: initialLayout,
  commands: myCommands,
});

// synthex.layout — current layout tree
// synthex.dispatch — command dispatcher
// synthex.undo / synthex.redo — history navigation
```
