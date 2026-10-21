# Component registry

> Branch status (`ace/lean-component-installs`): the lean `add` behavior below
> describes the CLI source in this checkout. It is a forthcoming CLI release;
> implemented in source, not yet published in
> `npx @luseefor/synthex-cli@latest`. Run the CLI from source (`packages/cli`)
> to use it today.
> `registry.json` in the repo root is the source of truth;
> a generator builds it from `packages/ui/src`, so do not edit it by hand.

```bash
npm run registry:generate   # rebuild registry.json + public copy
npm run registry:check      # validate registry.json
```

On this branch the CLI ships that registry plus the Vite, Next, and Expo
starter templates inside `dist/assets` (`packages/cli/scripts/copy-assets.mjs`, resolved via
`packages/cli/src/utils/assets.ts`), so an
installed CLI works outside this checkout after the release.

## Layout

Each entry has `name`, `dir`, `files`, `deps` for npm packages,
`registryDependencies` for other registry components, and `internal` for
infrastructure such as `_shared`, `components`, and `dashboard`. Generators
resolve `registryDependencies` on their own. The registry keeps `internal`
entries so resolution works, but `synthex list` hides them (`--all` shows
everything).

## Installing components

```bash
npx @luseefor/synthex-cli@latest list
npx @luseefor/synthex-cli@latest list --all

# install into ./components/ui/<name>
npx @luseefor/synthex-cli@latest add button
npx @luseefor/synthex-cli@latest add button card input

# preview without writing (transitive closure included)
npx @luseefor/synthex-cli@latest add button --dry-run

# overwrite existing files (otherwise conflicts refuse before any write)
npx @luseefor/synthex-cli@latest add button --overwrite

# target another project directory
npx @luseefor/synthex-cli@latest add button --cwd ./my-app
```

What `add` copies (`packages/cli/src/commands/add.ts`, `add.test.ts`):

- With `synthex-ui.json`, `add` selects the app platform: web files for
  Vite/Next, native files for Expo. Root and component files are retained,
  as are non-`_shared` metadata dependency directories; only `_shared`
  files are pruned to the relative import closure of the selected files.
  Expo uses native barrels as the neutral `index.ts` entry so directory
  imports stay native. Without config, legacy installs retain both
  platforms and whole directories. Simple components such as `label`
  and `table` have no shared file.
- Excludes tests: `*.test.*`, `*.spec.*`, `__tests__`.
- Resolves transitive `registryDependencies` cycle-safe and deduped.
- Preflights every destination first: dry-run reports
  `planned`/`skipped-existing`; identical sources re-report
  `skipped-existing` on a second run, and only changed files refuse without
  `--overwrite`, so no partial copies.
- Dependency hints for configured installs come from the actual selected
  files (static, type-only, re-export, and literal dynamic imports are
  scanned; host `react`/`react-dom`/`react-native` are excluded).
  Unconfigured legacy installs keep the union of registry `deps` for
  compatibility.
- `add` returns `dependencies: string[]` and
  `installCommand: string | null` in its JSON, including on `--dry-run`
  (dry-run writes nothing and logs no hint). It never auto-installs and
  never edits `package.json`; run the printed command yourself in your
  package-manager syntax (e.g. `npm install …`, `pnpm add …`,
  `yarn add …`, `bun add …`).

Example: web `add button` copies exactly 4 source files —
`button/button.shared.ts`, `button/button.web.tsx`, `button/index.ts`,
plus `_shared/variants.ts` — and reports
`@radix-ui/react-slot`, `class-variance-authority`, `clsx`,
`tailwind-merge`. See also [`docs/frameworks.md`](./frameworks.md) for the
configured vs legacy behavior and shared-file retention during subset or
full updates. See [`updating components`](./updating-components.md) for
backups and conflict handling.

The scanner handles literal JavaScript/TypeScript module specifiers. Computed
imports conservatively retain the shared pool; their package names cannot be
inferred. CSS package imports and application aliases need manual dependency
review. Non-`_shared` metadata dependencies are retained as whole directories.

### Registry references (`@<registry>/<name>`)

```bash
npx @luseefor/synthex-cli@latest add @synthex/button
npx @luseefor/synthex-cli@latest add @default/button
npx @luseefor/synthex-cli@latest add @button
```

`@synthex/<name>`, `@default/<name>`, and bare `@<name>` (means default)
are accepted and resolve against the local registry. Any other namespace
(e.g. `@other/button`) is rejected as unsupported after this-branch fix.

### URLs

```bash
npx @luseefor/synthex-cli@latest add https://example.com/registry/button.json
```

The URL must return JSON shaped like `{ "name": "button", "files": {
"button.web.tsx": "<source>" } }`. `data:` URLs with the same payload also
work. The command writes files under `components/ui/<name>/`. Review remote
manifests before installing; they are untrusted input.

## Served registry

Every `registry:generate` run copies `registry.json` to
`packages/web-preview/public/registry.json`, so the deployed preview serves it at
`/registry.json`. The web-preview `vercel.json` rewrite excludes `api/` only. It serves static files in `dist/`, including `registry.json`, directly.

## Versioning

`registry.json`'s `version` always matches `packages/ui/package.json`.
`registry:check` fails on mismatch, on missing files, on components without a
`*.web.*` implementation, and on `registryDependencies` pointing at unknown
components. It reports components without shared logic, like `*.shared.*` or `shared.ts`, as warnings only. Simple components such as `label` and `table`
legitimately have none.
