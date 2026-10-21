# Synthex Next starter

Minimal Next.js App Router + TS + Tailwind v4 starter using `synthex-ui`.

## Setup

```sh
npm install
npm run dev
```

```sh
bun install
bun run dev
```

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000 and click the counter button to verify
hydration.

## Client boundary

- `app/layout.tsx` is a server component. It imports `./globals.css`
  and renders `<Providers>`.
- `app/providers.tsx` is a client component (`"use client"`). It wraps
  children in `ThemeProvider` from `synthex-ui/theme`.
- `app/page.tsx` is a client component (`"use client"`). It uses
  `useState` and `Button` from `synthex-ui/button` to prove hydration.

See https://nextjs.org/docs/app/getting-started/server-and-client-components.

## Styling

`app/globals.css` imports `tailwindcss` first, then
`synthex-ui/styles.css`, plus:

```css
@source "../node_modules/synthex-ui/dist";
```

`postcss.config.mjs` registers `@tailwindcss/postcss`.

## Add components with the CLI

```sh
npx @luseefor/synthex-cli@latest add button
```
