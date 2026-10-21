# Synthex vs shadcn: full-journey evidence (this branch)

Scope: `ace/better-than-shadcn` working tree vs shadcn's official docs:
[CLI](https://ui.shadcn.com/docs/cli),
[registry](https://ui.shadcn.com/docs/registry),
[theming](https://ui.shadcn.com/docs/theming),
[RTL](https://ui.shadcn.com/docs/rtl).
Capabilities below are verified in this checkout, not published release facts.

## Journey matrix

| Stage | Synthex evidence (this branch) | shadcn reference | Acceptance gate | Remaining gap |
|---|---|---|---|---|
| Discover | `registry.json` is source of truth; `synthex list` hides `internal` entries (`packages/cli/src/commands/list.ts`); preview serves `/registry.json` | Registry supports namespaces, community registries, MCP ([registry](https://ui.shadcn.com/docs/registry)) | `registry:check` passes; `synthex list` matches `registry.json` | No MCP endpoint; no community registry index |
| Create / setup | `npx @luseefor/synthex-cli@latest create <name>` scaffolds `templates/starter` (Vite + React + Tailwind v4 + `@tailwindcss/vite`); CLI bundles registry + starter into `dist/assets` (`packages/cli/scripts/copy-assets.mjs`, `packages/cli/src/utils/assets.ts`) | `init` supports framework presets ([CLI](https://ui.shadcn.com/docs/cli)) | `create` + install + `npm run build` (`tsc --noEmit` + `vite build`) passes in a clean dir | `init` here only writes workbench `layout.json`/config/history; no framework-preset picker yet |
| Add / own source | `synthex add <name> [--dry-run] [--overwrite] [--cwd]` copies `.web.*` + `.native.*` plus the shared file where present (simple components such as `label`, `table` have none), excludes `.test`/`.spec`/`__tests__`, resolves transitive `registryDependencies` cycle-safe, preflights all destinations before writing (`packages/cli/src/commands/add.ts`, `add.test.ts`) | `add` supports dry-run and diff ([CLI](https://ui.shadcn.com/docs/cli)) | Dry-run lists transitive closure; second `add` with identical sources reports `skipped-existing`; changed files refuse without `--overwrite` | No diff view yet, only file list; dep hint is `bun add …` text, not auto-install |
| Style / theme | CSS entry must `@import "tailwindcss";` then `@import "synthex-ui/styles.css";` plus `@source` to `synthex-ui/dist`; `--sx-*` tokens + shadcn aliases + `@theme inline`; 9 accents; `createTheme` + `resolveAccentPreset` with dark overrides for steel/stone/bronze/mulberry | Semantic theme tokens ([theming](https://ui.shadcn.com/docs/theming)) | Starter and existing-app CSS both build; `data-theme="dark"` + `prefers-color-scheme` work | Token docs can drift; `registry:check` does not lint CSS |
| Compose / a11y + RTL | `DirectionProvider` (`dir` + `onDirChange` + `toggleDir` + `useDirection`); web renders `div[dir]`, native uses `View style={{direction}}`; logical utilities; existing `jest-axe` coverage in `dialog-a11y.test.tsx` (role `dialog`, `aria-modal`, labelledby/describedby, Escape, Radix focus containment + restore) and `moat-a11y.test.tsx` (dialog/select/menu/calendar) | Direction guidance ([RTL](https://ui.shadcn.com/docs/rtl)) | RTL toggle flips layout; `vitest` a11y suites pass with no new violations | No full certification claimed; remaining work is a full keyboard/contrast/native assistive-tech audit |
| Native | Components ship `.web.*` + `.native.*` with shared files where present; `packages/ui/package.json` `react-native` condition carries nested runtime + `.d.ts` entries per subpath (e.g. `./button` → `react-native: { types: ./dist/button/index.native.d.ts, default: … }`); Metro resolves `.native` entries | DOM-only; native is out of scope for shadcn | Typecheck plus web and native tests pass; packed `dist` contains both runtimes and type entries | No full web/native API parity claim; check per-component props |
| Migrate / update | Versioned `synthex-ui` `dist` (semver) alongside owned `components/ui/*` copies; `synthex migrate --dry-run` assists renames (e.g. Menubar value mapping still needs manual review) | Owned source you update in place; `add` re-run shows diff | `migrate --dry-run` lists files before writing | No codemod coverage guarantee; review diff before `--overwrite` |
| Validate / ship | `synthex validate`, `layout:*`, `history`, `run`, `registry:generate` + `registry:check`, `scripts/release-check.mjs` (export targets incl. native `.d.ts`, `dist` present, no `src`/test leaks), `scripts/pack-check.mjs` (`npm pack` smoke, required files, all exports packed) | CLI + registry docs as above | `check-types` + `vitest` + `registry:check` + `release:check` green | No bundle-size budget; `packages/web-preview/vite.config.ts` only splits `manualChunks`, so size regressions are unguarded |
| Ecosystem | `docs/llms.txt`, preview gallery, `web-preview`; remote `add` accepts `https:`/`data:` JSON `{ name, files }` | Namespaces, community, MCP over HTTP | `llms.txt` example runs as written | No hosted community namespace; remote manifests are untrusted input, review first |

## Namespaces (after this-branch fix)

`@synthex/<name>`, `@default/<name>`, and bare `@<name>` (means default) are accepted.
Any other `@<registry>/<name>` is rejected as unsupported (`assertSupportedRegistry`, covered in `add.test.ts`).

## Dependency hints

`add` prints a `bun add …` hint from transitive `deps`, excluding only `react`/`react-dom`/`react-native`.
That hint can currently include native-only packages, so web-only apps should filter it manually before installing.

## What to verify before calling it done

1. `npx @luseefor/synthex-cli@latest create demo && cd demo && npm install && npm run build` (`tsc --noEmit` + `vite build`, verified on this branch).
2. Existing Vite app: add the two `@import` lines plus `@source`, install `tailwindcss` + `@tailwindcss/vite`, register the plugin, then `vite build`.
3. `synthex add button --dry-run`, `synthex add button`, re-run identical (expect `skipped-existing`), change one copied file and re-run without `--overwrite` (expect refusal), then `registry:check`, `check-types`, `vitest`.
