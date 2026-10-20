# Synthex Starter

Minimal Vite + React + TS starter using `synthex-ui`.

## Use

```sh
npm install
npm run dev
```

`src/App.tsx` renders a `Button` inside `ThemeProvider`:

```tsx
import { Button } from "synthex-ui/components";
import { ThemeProvider } from "synthex-ui/theme";
```

## Add components with the CLI

```sh
npx synthex list
npx synthex add button
```

This copies the `button` registry files into `components/ui/button/`.
Re-run for any other component, e.g. `synthex add card dialog`.

Use `--dry-run` to preview, `--overwrite` to replace existing files.
