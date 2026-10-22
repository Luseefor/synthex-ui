# Product and ecosystem comparison

Review date: 2026-10-22. Synthex source `7babe5ef`, branch `ace/competitive-critique`, against shadcn `4.22.1` at `25af02b`. This report judges production adoption and product ecosystem only: whether either product solves a distinct customer job, how coherent its surface is, how users discover and install pieces, and what is actually released versus source-only. Scores are judgment, not measurement. No visual comparison is claimed; no device or screen-reader validation was performed.

## Source-main versus release readiness

Synthex strengths below are source strengths. `npm view` on 2026-10-22 returns `synthex-ui@1.1.0`, `time.modified 2026-03-06T06:56:48.357Z`, and `@luseefor/synthex-cli@1.1.0`, `time.modified 2026-03-06T06:57:08.989Z`. The assessed work — platform-pruned `add`, `setup`/`create --template`, `diff`/`update` with three-way merge — is flagged forthcoming in `README.md:5-8` and `docs/registry.md:3-9`, not yet published. shadcn has no such gap: the tree is `4.22.1` itself, CLI through skills in one release.

## Rubric

| Criterion | Weight | Synthex /10 | shadcn /10 |
|---|---|---|---|
| Distinct customer problem and differentiation | 25% | 6 | 8 |
| Library-versus-workbench product focus and coherence | 20% | 5 | 8 |
| Docs, discovery, and registry interoperability | 25% | 6 | 9 |
| Breadth mapped to production jobs and release readiness | 20% | 4 | 9 |
| Performance honesty: measurable budgets versus claims | 10% | 5 | 5 |

Weighted totals: Synthex `0.25*6 + 0.20*5 + 0.25*6 + 0.20*4 + 0.10*5 = 5.3`. shadcn `0.25*8 + 0.20*8 + 0.25*9 + 0.20*9 + 0.10*5 = 8.2` (8.15 rounded half-up). Fractions are arithmetic, not extra precision.

## Synthex strengths (source, with release caveat)

1. One API across web and native is the structural bet. `packages/ui/package.json:10-55` exposes per-component subpaths each with `react-native` conditions plus `web`/`native` roots, and `registry.json:53-74` wires each component to platform-split files (`.web.tsx` / `.native.tsx` / `.shared.*`). shadcn's registry has three web bases and no native target. Uncertainty: device behavior is explicitly pending, so the job is promised, not evidenced.
2. Lean owned-source installs reduce what lands in the host repo. `docs/registry.md:50-76` describes platform-selected copies with `_shared` pruned to the import closure (web `add button` copies 4 files), scanned dependency hints, no auto-install and no `package.json` edits. `scripts/lean-install-check.mjs:1-15` enforces that owned Button copies build without `synthex-ui`. Uncertainty: gates run in CI, not observed here.
3. Safe-update workflow exceeds copy-and-forget. `packages/cli/src/commands/update.ts:5-17` offers `update --dry-run`, `--write-conflicts`, and `--resolved`, with conflicts failing the run; `packages/cli/src/commands/diff.ts:15-31` previews local versus upstream patches. shadcn's `add --diff/--dry-run` previews but resolves by overwrite/merge prompt. Uncertainty: unpublished, so no user evidence the merge survives real edits.
4. shadcn interop is deliberate. `components.json` uses the standard shadcn schema with `aliases` into `packages/ui/src`; `docs/shadcn-interop.md` maps `--sx-color-*` tokens to shadcn names with `cva`/`Slot` parity; `docs/llms.txt` gives agents install wiring.

## Synthex gaps

1. The published artifact is seven months stale. npm `1.1.0` predates every differentiator above, so a team installing today gets none of them. Until a release is cut from this tree, the ecosystem score reflects intent. Evidence tier: `npm view`, strong.
2. The registry is local-file only and rejects third-party namespaces. `docs/registry.md:92-113` accepts `@synthex/`, `@default/`, and bare `@` refs; `packages/cli/src/commands/add.ts:130` throws for anything else. shadcn's writer resolves arbitrary configured namespaces (`packages/registry/src/registry/address.ts:19-64`, `namespaces.ts`). No outside registry can feed the Synthex CLI.
3. Discovery tooling is thin. The CLI covers `list`/`add`/`create`/`setup`/`migrate`/`validate` plus workbench commands (`packages/cli/src/index.ts:4-17`), and the preview site has component, block, docs, theme, and engine pages — but there is no cross-registry search, no `view`/`docs` equivalent, no MCP server, and no agent skill files. shadcn ships all four (`packages/shadcn/src/mcp/index.ts:63-184`; `search.ts`, `view.ts`; `skills/shadcn/SKILL.md`).
4. Product focus is split. The repo ships a component library, a layout engine (`packages/core/package.json:1-6`), a React DOM adapter (`packages/react-web/package.json:1-6`), and a preview workbench with builder and theme customizer. Every engine feature is maintenance surface the library customer never asked for, and the engine is web-only — it does nothing for the Expo story that justifies the project.

## shadcn strengths

1. Distribution is the product, and it is complete. `packages/shadcn/src/commands/add.ts:55-87` wires `--dry-run` and `--diff [path]` into one command; deprecated standalone `diff` (`packages/shadcn/src/commands/diff.ts:50-60`) points users at it. Presets and migration codemods (`packages/shadcn/src/migrations/`, `packages/registry/src/codemod/`) keep owned code current without a package-update treadmill.
2. Registry scale and plurality. `apps/v4/registry.json` holds 411 items (54 `registry:ui`, 97 `registry:block`, 238 examples), with per-base trees under `apps/v4/registry/bases/{base,radix,aria}/ui` (65/64/62 entries) and 30 served blocks in `__blocks__.json`. Three primitive bases (Base UI default, Radix, Aria) times eight named presets (`preset/defaults.ts`; selector at `presets.ts:154-156`) separate substrate choice from taste. Pinned sources: [source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/commands/add.ts), [source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/preset/presets.ts), [source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/registry/src/registry/address.ts).
3. Agent and machine surfaces are first-class. The MCP server exposes registries, listing, search, view, examples, add commands, and an audit checklist; `skills/shadcn/` adds enforced composition, styling, form, icon, and chat rules consumed via `info --json`. More items, more ways to find and correctly compose them. Pinned: [source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/mcp/index.ts), [source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/skills/shadcn/SKILL.md).
4. Interop runs both directions. Namespaced items, URL installs, package-import aliases (`packages/registry/src/package-imports.ts`), and monorepo-aware targeting let third parties extend the graph without permission. Synthex's shim points one way; shadcn's graph absorbs new publishers.

## shadcn gaps

1. No native target. All three bases are web substrates; a web-and-mobile team must run a second system for Expo. Scope, not defect — but the opening Synthex bets on.
2. Breadth is web-production breadth: dashboards, sidebars, charts, and themes compose well, but jobs needing dockable workspace layout get blocks, not an engine.
3. No published per-component performance budgets were found in the inspected tree; leanness comes from the copy-source model rather than measured numbers. Both products share this gap, hence the tied 5. Absence is unlocated, not proven.

## Strongest defensible narrow Synthex win

For a web-and-mobile team that wants to own its sources: one component API targeting Vite/Next and Expo, installed as platform-pruned owned files with recorded originals and three-way `update`, plus shadcn-convention interop for the web side. No shadcn base covers Expo, and no shadcn command records merge bases. That bundle — cross-platform owned source with safe updates — is the one job where Synthex is structurally ahead rather than behind.

Disconfirming evidence that would overturn it: a fresh publish missing any piece (stale `dist`, failed `pack-check`/`lean-install-check`, Expo template failing `native-check` typecheck); native overlays failing on hardware; or teams ignoring `update --write-conflicts` for plain package updates. Any of these collapses the win to a source-only claim. Stop building: new workbench engine features and further component-count expansion before the publish and device evidence land.

## Acceptance work items

1. Publish `synthex-ui` and `@luseefor/synthex-cli` from `7babe5ef` (prerelease tag acceptable), then record `npm view` versions/timestamps and a passing `pack-check` plus `lean-install-check --template expo` log in the report directory.
2. Prove or scope the namespace boundary: install one fixture component from a second local registry through the CLI, or record the product reason third-party namespaces stay rejected and what interop alternative replaces them.
3. Publish one measured cost table: per-component web bundle delta for `button`, `dialog`, and `data-table` from the preview build with exact build command and output sizes, replacing structural leanness claims with numbers.

## Commands and outcomes

- `git rev-parse --short HEAD` / `branch --show-current`: `7babe5e`, `ace/competitive-critique`; shadcn `25af02b`, package `4.22.1`.
- `npm view synthex-ui version time.modified` → `1.1.0`, `2026-03-06T06:56:48.357Z`; `npm view @luseefor/synthex-cli version time.modified` → `1.1.0`, `2026-03-06T06:57:08.989Z`. Outcome: merged features are not published.
- Registry counts via local parse: shadcn `apps/v4/registry.json` 411 items (54 ui / 97 blocks / 238 examples / rest internal, theme, style, lib, hook); base dirs 65/64/62. Outcome: breadth gap quantified structurally, not by stars.
- No code changes, commits, installs, builds, or suites were run; all findings are source or registry reads plus the two read-only `npm view` calls above.
