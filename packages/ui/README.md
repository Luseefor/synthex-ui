# synthex-ui

Cross-platform React UI framework for consistent web and native product surfaces.

## Install

```sh
npm install synthex-ui
```

For React Native, also install the relevant peer dependencies used by your app.

## Usage

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

## Exports

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
