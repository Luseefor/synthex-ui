# Synthex starter

Minimal Vite + React + TS starter using `synthex-ui`.

## Use

```sh
npm install
npm run dev
```

`src/App.tsx` renders a `Button` inside `ThemeProvider`:

```tsx
import { Button } from "synthex-ui/button";
import { ThemeProvider } from "synthex-ui/theme";
```

## Styling

`src/styles.css` is imported from `src/main.tsx`. It imports
`tailwindcss` first, then `synthex-ui/styles.css` via CSS `@import`
so the library `@theme` directives are compiled, plus:

```css
@source "../node_modules/synthex-ui/dist";
```

This tells Tailwind where the prebuilt `synthex-ui` utilities live.
`vite.config.ts` registers the `@tailwindcss/vite` plugin.

## Add components with the CLI

```sh
npx @luseefor/synthex-cli@latest list
npx @luseefor/synthex-cli@latest add button
npx @luseefor/synthex-cli@latest create my-app
```

This copies the `button` registry files into `components/ui/button/`.
Re-run for any other component, e.g. `add card dialog`.

Use `--dry-run` to preview, `--overwrite` to replace existing files.

Copied files live at the project root under `components/ui/`.
Tailwind v4 automatic content detection scans them there, so no extra
`@source` entry is needed for local copies.

Local copies import their own runtime dependencies (e.g. `button`
needs `@radix-ui/react-slot` and `class-variance-authority`;
icon components need `lucide-react`). If the bundler or `tsc`
reports a missing package after `add`, install it:

```sh
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```
