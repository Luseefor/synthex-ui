# Framework setup (Vite / Next / Expo)

> These instructions target `@luseefor/synthex-cli@1.2+` and `synthex-ui@2+`.
> If your installed packages predate those versions, run the CLI from source
> (`packages/cli`) in this checkout. See `docs/releases/v1.2.md` for
> version scope.

This is the single detailed reference for framework onboarding.
`docs/getting-started.md` and `README.md` show the short path;
this file holds the per-framework details.

## Scaffold a new app (`create`)

```sh
npx @luseefor/synthex-cli@latest create my-app
npx @luseefor/synthex-cli@latest create my-app --template next
npx @luseefor/synthex-cli@latest create my-app --template expo
```

- `--template vite|next|expo`, defaults to `vite`.
- `--package-manager npm|pnpm|yarn|bun`. When omitted, the CLI detects the
  manager from the parent directory (`packageManager` field, then lockfile,
  else `npm`).
- `--cwd <dir>` sets the parent directory for the new project.
- `--dry-run` lists files without writing.
- `create` copies `templates/starter` (vite), `templates/next` (next), or
  `templates/native` (expo) and renames `package.json[name]` to your app
  name. It does not install dependencies. Run the printed install command
  yourself, then run the starter:
  - Vite / Next use `dev`: `npm run dev` (pnpm: `pnpm dev`, yarn: `yarn dev`,
    bun: `bun run dev`).
  - Expo uses `start` (`expo start`): `npm start` (pnpm: `pnpm start`, yarn:
    `yarn start`, bun: `bun run start`).

What each starter contains:

- **vite** (`templates/starter`): Vite + React + Tailwind v4 with
  `@tailwindcss/vite` already registered in `vite.config.ts`,
  `src/styles.css` already wired (`@import "tailwindcss";` then
  `@import "synthex-ui/styles.css";` plus `@source`), imported once from
  `src/main.tsx`. Demo `src/App.tsx` renders `Button` inside `ThemeProvider`.
- **next** (`templates/next`): Next.js App Router + Tailwind v4.
  `app/layout.tsx` is a server component that imports `./globals.css` and
  renders `<Providers>`. `app/providers.tsx` is a `"use client"` boundary
  that wraps children in `ThemeProvider` from `synthex-ui/theme`.
  `app/page.tsx` is a `"use client"` page using `Button` from
  `synthex-ui/button`. `app/globals.css` imports `tailwindcss` then
  `synthex-ui/styles.css` plus `@source "../node_modules/synthex-ui/dist"`.
  `postcss.config.mjs` registers `@tailwindcss/postcss`.
- **expo** (`templates/native`): Expo SDK 58 standalone starter.
  `App.tsx` imports `Button`, `Dialog*`, and `ThemeProvider` from
  `synthex-ui/native` (resolved through the `react-native` export
  condition). No CSS files are used. `react-native-svg` is already a
  dependency. `index.ts` registers the root component with
  `registerRootComponent(App)`.

## Add to an existing app (`setup`)

```sh
npx @luseefor/synthex-cli@latest setup --dry-run
npx @luseefor/synthex-cli@latest setup
npx @luseefor/synthex-cli@latest setup --cwd apps/web
npx @luseefor/synthex-cli@latest setup --framework next --package-manager pnpm
```

Options:

- `--cwd <dir>` (optional): target project directory. Must contain a
  `package.json`. For monorepos, point at the app package
  (for example `--cwd apps/web`).
- `--framework vite|next|expo` (optional): explicit framework. When omitted,
  the CLI reads `dependencies` + `devDependencies` for `expo`, `next`, or
  `vite`. Exactly one match wins. Multiple matches are ambiguous and require
  `--framework`. No match errors out; config files alone
  (`vite.config.*`, `next.config.*`, `app.json`) are not enough. Pass
  `--framework` or add the dependency.
- `--package-manager npm|pnpm|yarn|bun` (optional): overrides detection
  (`packageManager` field, then nearest lockfile, else `npm`).
- `--dry-run`: list planned files without writing. Reports `planned` vs
  `skipped-existing` and refuses on changed conflicts before writing
  anything, same as a real run; it writes nothing.

What `setup` writes (never overwrites):

- `synthex-ui.json`: `{ version: 1, framework, packageManager,
  componentsDir, css, provider }`. With `src/` present, `componentsDir` is
  `src/components/ui` and `provider` is
  `src/components/synthex-provider.tsx`; without `src/`, `components/ui`
  and `components/synthex-provider.tsx`.
- CSS entry (web only): `src/synthex.css` or `synthex.css` for vite;
  `src/app/synthex.css` or `app/synthex.css` for next (prefers `app/` when
  both exist). Content is `@import "tailwindcss";` then
  `@import "synthex-ui/styles.css";` plus `@source` line(s) pointing at
  `node_modules/synthex-ui/dist`. In a workspace a second `@source` line
  points at the workspace root install when it differs. Expo writes no CSS
  (`css: null`); theming comes from `synthex-ui/native`.
- Provider wrapper: a `ThemeProvider`-based `SynthexProvider`. Vite writes a
  plain component importing from `synthex-ui/theme`. Next prepends
  `"use client";` and imports from `synthex-ui/theme`. Expo imports from
  `synthex-ui/native`.

`setup` is idempotent: a second run with identical content reports
`skipped-existing`. If a target file exists with different content, `setup`
refuses before writing anything, including under `--dry-run` (which reports
the conflicting files without writing); delete or update that file manually.
`setup` never overwrites.

What `setup` prints:

- `installCommands`: web prints two commands — one for `synthex-ui`, plus a
  dev-dependency install for Tailwind v4 and its plugin:
  - Vite: e.g. `npm install synthex-ui`, then
    `npm install -D tailwindcss @tailwindcss/vite`.
  - Next: e.g. `npm install synthex-ui`, then
    `npm install -D tailwindcss @tailwindcss/postcss postcss`.
  (pnpm: `pnpm add …` / `pnpm add -D …`; yarn: `yarn add …` /
  `yarn add -D …`; bun: `bun add …` / `bun add -d …`.)
  Expo prints an install for `synthex-ui lucide-react-native` plus an SDK-aware Expo install for
  `react-native-svg` and React-compatible `react-dom` (not a plain package-manager add, so the version
  matches your Expo SDK):
  - npm: `npx expo install react-native-svg react-dom --npm`
  - pnpm: `pnpm exec expo install react-native-svg react-dom --pnpm`
  - yarn: `yarn expo install react-native-svg react-dom --yarn`
  - bun: `bunx expo install react-native-svg react-dom --bun`.
- `instructions`: manual entry/config steps. You run the install commands
  yourself and wire the entry point by hand (next section).

What `setup` does NOT do:

- Does not install dependencies.
- Does not edit `vite.config.ts`, `postcss.config.mjs`, `next.config.mjs`,
  `app/layout.tsx`, `src/main.tsx`, `App.tsx`, or any existing CSS.
- Does not merge into an existing provider or stylesheet. It only creates
  `synthex-ui.json`, the CSS entry, and the provider wrapper.

## Manual wiring after `setup`

`setup` prints these steps; they are repeated here so copy-paste works
without re-running the CLI.

### Vite

1. Run both printed installs, for example `npm install synthex-ui` and
   `npm install -D tailwindcss @tailwindcss/vite`.
   Keep the Tailwind Vite plugin (`@tailwindcss/vite`) in
   `vite.config.ts`; `setup` does not edit build config. See the
   [Tailwind v4 Vite guide](https://tailwindcss.com/docs/installation/using-vite).
2. Import the generated CSS once from your app entry:

```ts
import "./synthex.css"; // or "./src/synthex.css" — use the path setup wrote
```

The file already contains (order matters):

```css
@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";
```

Adjust `@source` only if you move the CSS file; it must point at the
installed `synthex-ui/dist` relative to that CSS file. In a workspace
`setup` may emit a second `@source` line for the workspace root install;
keep both.

3. Wrap your root with the generated provider (paths below are relative
to the importing file; with `src/` both live under `src/`, so the import
is still `./components/…`):

```tsx
import { SynthexProvider } from "./components/synthex-provider";

function App() {
  return (
    <SynthexProvider>
      <YourApp />
    </SynthexProvider>
  );
}
```

### Next (App Router only)

1. Run both printed installs, for example `npm install synthex-ui` and
   `npm install -D tailwindcss @tailwindcss/postcss postcss`.
   Keep `"@tailwindcss/postcss"` in `postcss.config.mjs`; `setup` does not
   edit build config. See the
   [Tailwind v4 PostCSS guide](https://tailwindcss.com/docs/installation/using-postcss)
   and the
   [Next.js server and client components docs](https://nextjs.org/docs/app/getting-started/server-and-client-components)
   for background.
2. Import the generated CSS from the root layout (recommended):

```tsx
// app/layout.tsx or src/app/layout.tsx
import "./synthex.css";
```

The generated `synthex.css` sits next to the layout (`app/` or `src/app/`)
and already contains the two `@import` lines plus `@source`.

3. Render the generated `"use client"` provider around children (import is
relative to the layout file, so `src/app/` layouts also use
`../components/…`; when using root `app/` alongside a separate `src/`,
use `../src/components/…`):

```tsx
// app/layout.tsx or src/app/layout.tsx
import { SynthexProvider } from "../components/synthex-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SynthexProvider>{children}</SynthexProvider>
      </body>
    </html>
  );
}
```

Pages Router (`pages/`) is not supported. `setup` requires `app/` or
`src/app/` and errors on a `pages/`-only project.

### Expo (SDK 58)

This release targets React 19.3 or newer and React Native 0.81 or 0.88.
The Expo starter is verified against SDK 58. Check the UI peer requirements
before adding it to an older Expo project.

1. Run both printed installs, for example:

```sh
npm install synthex-ui lucide-react-native
npx expo install react-native-svg react-dom --npm
```

The icon package is required by native components. Installing React DOM
through Expo keeps the transitive web dependencies compatible with the
SDK's React version.

Use your manager's Expo command (`pnpm exec expo install react-native-svg react-dom
--pnpm`, `yarn expo install react-native-svg react-dom --yarn`,
`bunx expo install react-native-svg react-dom --bun`); do not use a plain
`npm install react-native-svg` — the Expo command pins the version to your
SDK.

See the [Expo SDK docs](https://docs.expo.dev/) for runtime setup.

2. Wrap your root component (`App.tsx`) with the generated provider.
   No CSS file is used on native; the generated provider imports theming
   from `synthex-ui/native`:

```tsx
import { SynthexProvider } from "./components/synthex-provider";

export default function App() {
  return (
    <SynthexProvider>
      <YourScreens />
    </SynthexProvider>
  );
}
```

Import components from `synthex-ui/native` on native, not from
`synthex-ui/components`. The starter uses `Button`/`Dialog` from
`synthex-ui/native`.

## Monorepos and `--cwd`

Run `setup` inside the app package, not the workspace root:

```sh
npx @luseefor/synthex-cli@latest setup --cwd apps/web --dry-run
npx @luseefor/synthex-cli@latest setup --cwd apps/web
```

`--cwd` must contain its own `package.json`; `setup` never walks up to a
workspace root silently. Package-manager detection still reads parent
lockfiles and the `packageManager` field. The generated CSS keeps an
`@source` line for the app install plus one for the workspace root install
when they differ; keep both lines.

## Own the source with `add`

```sh
npx @luseefor/synthex-cli@latest list
npx @luseefor/synthex-cli@latest add button --dry-run
npx @luseefor/synthex-cli@latest add button card
npx @luseefor/synthex-cli@latest add button --overwrite
npx @luseefor/synthex-cli@latest add button --cwd apps/web
```

- With `synthex-ui.json`, `add` selects the app platform: web files for
  Vite/Next, native files for Expo. Root and component files are retained,
  as are non-`_shared` metadata dependency directories; only `_shared`
  files are pruned to the relative import closure of the selected files.
  Expo uses native barrels as the neutral `index.ts` entry so directory
  imports stay native. Without config, legacy installs retain both
  platforms and whole directories. Test files
  (`*.test.*`, `*.spec.*`, `__tests__`) are excluded.
- Resolves transitive `registryDependencies`, preflights every destination
  before writing. Re-running with identical sources reports
  `skipped-existing`; only changed files refuse without `--overwrite`, so no
  partial copies.
- Destination: `componentsDir` from `synthex-ui.json` when that config
  exists in `--cwd`; otherwise the legacy default `components/ui`.
- Namespaces: `@synthex/<name>`, `@default/<name>`, bare `@<name>` accepted;
  other registries are rejected.
- Dependency hints for configured installs come from the actual selected
  files (including type imports; host `react`/`react-dom`/`react-native`
  excluded). Unconfigured legacy installs keep the union of registry `deps`
  for compatibility. `add` returns `dependencies: string[]` and
  `installCommand: string | null` in its JSON, including on `--dry-run`;
  it never auto-installs and never edits `package.json`. Run the printed
  command yourself in your package-manager syntax (e.g. `npm install …`,
  `pnpm add …`, `yarn add …`, `bun add …`).

  Example: web `add button` copies `button/button.shared.ts`,
  `button/button.web.tsx`, `button/index.ts`, plus `_shared/variants.ts`
  (4 files) and reports
  `@radix-ui/react-slot`, `class-variance-authority`, `clsx`,
  `tailwind-merge`. Full reference: [`docs/registry.md`](./registry.md).

Copied native components use the copied theme context, which falls back to the
default theme when no owned provider is present. Pruning does not copy the
theme provider itself. For a custom native theme, first run `add _shared`
(explicit `_shared` keeps the full platform shared pool), then wrap owned
components in the owned `ThemeProvider` from
`./components/ui/_shared/theme` (adjust for `componentsDir`). Package
components continue using the package provider.

## Keep owned components updated (`diff` / `update`)

> These instructions target `@luseefor/synthex-cli@1.2+` and `synthex-ui@2+`.
> If your installed packages predate those versions, run the CLI from source
> (`packages/cli`) in this checkout. Full reference:
> [`docs/updating-components.md`](./updating-components.md) and
> [`docs/releases/v1.2.md`](./releases/v1.2.md).

```sh
npx @luseefor/synthex-cli@latest diff button --json
npx @luseefor/synthex-cli@latest update --dry-run
npx @luseefor/synthex-cli@latest update button --write-conflicts
npx @luseefor/synthex-cli@latest update button --resolved components/ui/button/index.ts
```

- `add` records the installed original bytes, hash, and registry version in
  `.synthex/components.json` (separate from layout-engine history).
- `diff [component...] [--cwd] [--json]` is read-only (defaults to all
  recorded installs). `update [component...] [--cwd] [--dry-run] [--json]
  [--write-conflicts] [--resolved <file...>]` merges registry changes with a
  three-way merge, preserves independent local edits, stops all applies on
  any conflict, never writes markers, backs up successful runs under
  `.synthex/backups/<uuid>`, and saves conflict sidecars under
  `.synthex/conflicts/<uuid>` only on a real conflicting run.
- After hand-merging from the `base`/`local`/`incoming` sidecars, pass each
  resolved project-relative path via `--resolved` so the baseline advances
  past the conflict. See `docs/updating-components.md` for the end-to-end
  example, restore steps, and legacy-copy behavior.
- Lean `_shared` retention: a subset `update button` keeps tracked `_shared`
  paths it did not select (another root may still need them). A full update
  (no args, or every recorded root listed) may prune unused tracked `_shared`
  paths using the normal backup/conflict flow; a locally modified obsolete
  shared file is kept as a conflict, never silently deleted.

## `setup` vs `init`

- `setup` is framework onboarding: writes `synthex-ui.json` + CSS (web) +
  provider wrapper, then prints install and manual-wiring steps.
- `init` is the legacy layout-engine command: writes layout-engine config
  (`layout.json`, project config, history) for the dockable workbench. It
  does not configure a framework, CSS, or provider.

Use `setup` for Vite/Next/Expo apps. Use `init` only when you need the
workbench engine files.
