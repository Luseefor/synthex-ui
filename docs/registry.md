# Component registry

> Branch status: the bundled CLI assets, transitive copy, preflight, and
> namespace behavior below describe `ace/better-than-shadcn`, not a published
> release. `registry.json` in the repo root is the source of truth;
> a generator builds it from `packages/ui/src`, so do not edit it by hand.

```bash
npm run registry:generate   # rebuild registry.json + public copy
npm run registry:check      # validate registry.json
```

On this branch the CLI also ships that registry plus `templates/starter`
inside `dist/assets` (`packages/cli/scripts/copy-assets.mjs`, resolved via
`packages/cli/src/utils/assets.ts`), so an
installed `npx @luseefor/synthex-cli@latest` works outside this checkout.

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

- Both platform sources (`.web.*` + `.native.*`), plus the shared file
  (`.shared.ts`/`shared.ts`) where present; simple components such as `label`
  and `table` have none.
- Excludes tests: `*.test.*`, `*.spec.*`, `__tests__`.
- Resolves transitive `registryDependencies` cycle-safe and deduped.
- Preflights every destination first: dry-run reports
  `planned`/`skipped-existing`; identical sources re-report
  `skipped-existing` on a second run, and only changed files refuse without
  `--overwrite`, so no partial copies.
- Prints a `bun add …` hint from transitive `deps` (only `react`,
  `react-dom`, `react-native` are excluded). The hint can currently include
  native-only packages, so filter it for web-only apps.

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

`registry.json`'s `version` always matches the root `package.json` version.
`registry:check` fails on mismatch, on missing files, on components without a
`*.web.*` implementation, and on `registryDependencies` pointing at unknown
components. It reports components without shared logic, like `*.shared.*` or `shared.ts`, as warnings only. Simple components such as `label` and `table`
legitimately have none.
