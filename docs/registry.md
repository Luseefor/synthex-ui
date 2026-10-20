# Component registry

`registry.json` in the repo root is the source of truth for installable components. A generator builds it from `packages/ui/src`, so do not edit it by hand.

```bash
npm run registry:generate   # rebuild registry.json + public copy
npm run registry:check      # validate registry.json
```

## Layout

Each entry has `name`, `dir`, `files`, `deps` for npm packages, `registryDependencies` for other registry components, and `internal` for infrastructure such as `_shared`, `components`, and `dashboard`. Generators resolve `registryDependencies` on their own. The registry keeps `internal` entries so dependency resolution works, but `synthex list` hides them.

## Installing components

```bash
# list public components (internal ones hidden; --all shows everything)
synthex list
synthex list --all

# install into ./components/ui/<name>
synthex add button
synthex add button card input

# preview without writing
synthex add button --dry-run

# overwrite existing files
synthex add button --overwrite
```

### Registry references (`@<registry>/<name>`)

```bash
synthex add @synthex/button
```

`@<registry>/<name>` currently resolves against the local registry. The command accepts the registry name but ignores it, so plain names behave the same. A bare
`@<name>` with no slash means the default registry.

### URLs

```bash
synthex add https://example.com/registry/button.json
```

The URL must return JSON shaped like `{ "name": "button", "files": {
"button.web.tsx": "<source>" } }`. `data:` URLs with the same payload also
work. The command writes files under `components/ui/<name>/`.

## Served registry

Every `registry:generate` run copies `registry.json` to `packages/web-preview/public/registry.json`, so the deployed preview serves it at
`/registry.json`. The web-preview `vercel.json` rewrite excludes `api/` only. It serves static files in `dist/`, including `registry.json`, directly.

## Versioning

`registry.json`'s `version` always matches the root `package.json` version.
`registry:check` fails on mismatch, on missing files, on components without a
`*.web.*` implementation, and on `registryDependencies` pointing at unknown
components. It reports components without shared logic, like `*.shared.*` or `shared.ts`, as warnings only. Simple components such as `label` and `table`
legitimately have none.
