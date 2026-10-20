# Contributing

## Setup

```sh
bun install
```

Use Bun 1.4.3 (`packageManager: bun@1.4.3`). CI installs with `bun install --frozen-lockfile`.

## Typecheck

```sh
bun run check-types
```

Runs `typecheck` for all workspaces:

- `@luseefor/synthex-core`
- `synthex-ui`
- `@luseefor/synthex-react-web`
- `@luseefor/synthex-cli`
- `@luseefor/web-preview`

For a single workspace (e.g. preview only):

```sh
bun run typecheck --workspace @luseefor/web-preview
```

## Test

Root suite covers `synthex-ui` + `react-web`:

```sh
bun run test
```

Core and CLI keep separate suites. Run those directly:

```sh
bun run test --workspace @luseefor/synthex-core
bun run test --workspace @luseefor/synthex-cli
bun run test --workspace synthex-ui
bun run test --workspace @luseefor/synthex-react-web
```

## Changesets

- Add a changeset for any user-facing change: `bunx changeset`
- Pick patch/minor/major per package. CI runs `npx changeset status --since=origin/main`.
- `changesets/action` automates the release (`bunx changeset publish` on `main`).

## Registry + tokens regen

A script writes `registry.json`. Do not hand-edit it:

```sh
node ./scripts/generate-registry.mjs
git diff --exit-code registry.json
```

A script builds design tokens from `packages/ui/src/_shared/tokens/`:

```sh
node ./scripts/export-tokens.mjs
```

This writes `tokens/tokens.json` (22 colors / 5 radii / 6 spaces) and
`tokens/figma-variables.json` (`Collection` / `Mode` / `VariableName` / `Value` rows for Figma import).

## Build / release checks

```sh
bun run build
bun run release:check
bun run pack:check
```
