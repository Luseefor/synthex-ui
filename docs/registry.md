# Component registry

`registry.json` (repo root) is the source of truth for installable components. It is
generated from `packages/ui/src` — do not edit it by hand.

```bash
npm run registry:generate   # rebuild registry.json + public copy
npm run registry:check      # validate registry.json
```

## Layout

Each entry has `name`, `dir`, `files`, `deps` (npm packages),
`registryDependencies` (other registry components, resolved automatically by
generators), and `internal` (infrastructure such as `_shared`, `components`,
and `dashboard` — kept in the registry so dependency resolution works, but
hidden from `synthex list`).

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

`@<registry>/<name>` currently resolves against the local registry (the
registry name is accepted but ignored); plain names behave the same. A bare
`@<name>` (no slash) means the default registry.

### URLs

```bash
synthex add https://example.com/registry/button.json
```

The URL must return JSON shaped like `{ "name": "button", "files": {
"button.web.tsx": "<source>" } }`. `data:` URLs with the same payload also
work. Files are written under `components/ui/<name>/`.

## Served registry

`registry.json` is copied to `packages/web-preview/public/registry.json` on
every `registry:generate` run, so the deployed preview serves it at
`/registry.json`. The web-preview `vercel.json` rewrite excludes `api/` only;
static files in `dist/` (including `registry.json`) are served directly.

## Versioning

`registry.json`'s `version` always matches the root `package.json` version.
`registry:check` fails on mismatch, on missing files, on components without a
`*.web.*` implementation, and on `registryDependencies` pointing at unknown
components. Components without shared logic (`*.shared.*` / `shared.ts`) are
reported as warnings only — simple components such as `label` and `table`
legitimately have none.
