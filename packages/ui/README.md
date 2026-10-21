# synthex-ui

Cross-platform React UI framework for consistent web and native product surfaces.

## Install

```sh
npm install synthex-ui
npm install -D tailwindcss @tailwindcss/vite
```

For React Native, also install the peer dependencies your app needs.

## Setup (Vite + Tailwind v4)

Register the plugin in `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";

export default { plugins: [tailwindcss()] };
```

Put both imports in your local CSS entry (`src/styles.css`), in order:

```css
@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";
```

Then import that local file once at app entry:

```ts
import "./styles.css";
```

## Usage

```tsx
import { Button } from "synthex-ui/button";
import { ThemeProvider } from "synthex-ui/theme";

export function Example() {
  return (
    <ThemeProvider mode="light" accentPreset="blue">
      <Button>Run</Button>
    </ThemeProvider>
  );
}
```

Native apps import from `synthex-ui/native` (or per-component subpaths, resolved via the `react-native` condition). No CSS import on native.

## Exports

- `synthex-ui`
- `synthex-ui/components`
- `synthex-ui/button` (etc., per-component web/native subpaths)
- `synthex-ui/primitives`
- `synthex-ui/layout`
- `synthex-ui/hooks`
- `synthex-ui/icons`
- `synthex-ui/theme`
- `synthex-ui/styles.css`
- `synthex-ui/web`
- `synthex-ui/native`
