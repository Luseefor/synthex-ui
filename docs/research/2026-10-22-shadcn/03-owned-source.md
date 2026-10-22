# Owned-source maintenance: safely updating locally customized components

Date: 2026-10-22. Synthex source: `7babe5e` (`ace/competitive-critique`).
Competitor: official shadcn source `25af02b` (package `shadcn` 4.22.1), read-only.
This report rates the maintenance loop only: keeping owned, locally edited
copies current with upstream without losing customizations. Installation,
styling, and cross-platform coverage are out of scope.

Release separation: `synthex-ui` and `@luseefor/synthex-cli` on npm are
1.1.0, last modified 2026-03-06. All `diff` / `update` capability below is
merged CLI source in this checkout, not the published packages — per
`docs/updating-components.md:3-14` the commands must run from source. Nothing
merged is assumed published; release readiness is not demonstrated.

## Rubric (weights sum to 100%)

| # | Criterion | Weight | Synthex (/10) | shadcn (/10) |
|---|-----------|--------|---------------|--------------|
| 1 | Recorded baseline and change visibility | 25% | 8 | 6 |
| 2 | Merge quality: preserving local edits | 30% | 7 | 4 |
| 3 | Transaction safety: atomicity, backups, rollback, concurrency | 20% | 8 | 3 |
| 4 | Conflict workflow and resolvability | 15% | 8 | 5 |
| 5 | Dependency and source-transform awareness on update | 10% | 4 | 6 |
| | **Weighted total (rounded, 1 decimal)** | 100% | **7.3** | **4.7** |

Arithmetic: Synthex 0.25*8 + 0.30*7 + 0.20*8 + 0.15*8 + 0.10*4 = 7.3.
shadcn 0.25*6 + 0.30*4 + 0.20*3 + 0.15*5 + 0.10*6 = 4.65, shown as 4.7.
Scores are judgment against the anchors in the methodology, not measurements.

## Synthex strengths (source-read, plus passing unit tests)

1. Recorded per-file originals with hash verification.
`add` stores each file's original bytes (base64) plus sha256 in
`.synthex/components.json` (`componentState.ts:468-539`; validation
`385-441`). State is read as one snapshot whose raw bytes become the expected
value for the later state write (`650-687`), so concurrent state changes abort
instead of being lost. `diff` reports three patches per file
(`componentUpdates.ts:229-239`): local-vs-result, base-vs-local, and
base-vs-incoming — "my edit" vs "upstream's edit" without reconstruction.

2. Genuine three-way merge with conservative failure modes.
`mergeComponentFile` (`packages/cli/src/utils/componentMerge.ts:83-194`) is
pure and never writes conflict markers into owned files; on conflict it
returns local bytes untouched with a reason. Non-overlapping edits merge
(`189-193`); clean upstream changes apply when local matches base;
untouched-by-upstream files stay local, including preserved local deletions
(`110-116`). Binary, non-UTF-8, oversized (>512 KiB), and over-long inputs
fail closed to `conflict` (`134-171`), as do delete-vs-modify and
independent-add collisions (`118-132`). Boundary appends are treated as
conflicts (`componentMerge.test.ts:179-185`), trading recall for safety.

3. Conflict-gated batches with backups, locks, and handled-error rollback.
Any conflict blocks every write (`componentUpdates.ts:288-291`). Successful
runs go through `applyComponentTransaction`
(`packages/cli/src/utils/componentTransaction.ts:187-305`): expected-byte
rechecks before any write, an exclusive `.synthex/components.lock`
(PID+UUID, never auto-deleted, `100-144`), prior-byte backups plus a manifest
(`307-375`), a recheck immediately before each file write (`377-394`),
atomic temp-plus-rename writes, and failure rollback that spares newer user
edits and reports them (`441-489`). `update --dry-run` writes nothing even
with `--write-conflicts` or `--resolved` (`componentUpdates.ts:292`), and
`--resolved` accepts only current disk bytes for listed conflicting paths
(`221-228`) — no flag silently discards local work for upstream.

## Synthex gaps

1. Update carries no dependency delta. New upstream dependencies are computed
at `add` time only (`commands/add.ts:596`); the update manifest
(`componentUpdates.ts:38-45`) has no dependency field, so an upstream fix that
adds a package arrives unannounced.
2. Minimal source adaptation on update. The only content transform is the
`.web` to `.native` sibling import remap (`commands/add.ts:198-216`); no
alias, theme-token, or framework handling exists at update time, and config or
destination moves block the update pending manual reconciliation
(`docs/updating-components.md:131-135, 281-284`).
3. Artifacts and recovery are manual. Backups and sidecars accumulate under
`.synthex/` with no retention or `restore` command; recovery is byte-copy by
hand including the state file (`docs/updating-components.md:150-182`). A
stale lock must be cleared by hand after checking the recorded PID
(`296-302`). Retirement semantics are tested
(`componentUpdates.test.ts:543-608`) but subtle — e.g. full vs subset update
rules for shared files (`componentUpdates.ts:168-209`).

## shadcn strengths (source-read at pinned commit)

1. Mature preview surface: `add --dry-run`, `--diff`, `--view`
([`add.ts:60-76, 304-326`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/commands/add.ts)).
The preview classifies each file as create, overwrite, or skip-identical with
both contents for overwritten files
([`dry-run.ts:231-250`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/utils/dry-run.ts))
plus an overwrite count warning
([`dry-run-formatter.ts:98-111`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/utils/dry-run-formatter.ts)).
Standalone `diff` is deprecated in favor of `add --diff`
([`diff.ts:41-51`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/commands/diff.ts)).
2. Documented assisted-merge workflow. The shipped skill tells the operator to
preview with `--dry-run`, inspect each file with `--diff <file>`, hand-apply
upstream hunks around local edits, and never use `--overwrite` without
explicit approval
([`skills/shadcn/SKILL.md:208-218`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/skills/shadcn/SKILL.md)).
Preset switching offers four explicit strategies (overwrite, partial, merge,
skip) with per-component smart merge for the merge path
([`SKILL.md:188-195`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/skills/shadcn/SKILL.md)).
This is operator-plus-agent judgment rather than CLI automation, but it is
written down, guarded by a confirmation rule, and covers the realistic cases.
3. Update-time dependency and transform reporting. The dry-run result includes
dependencies, CSS variables, env vars, and fonts
([`dry-run.ts:62-130`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/utils/dry-run.ts)),
and previewed content passes through the project transform pipeline (imports,
RSC, CSS vars, tailwind prefixes, icons, RTL, fonts) before display
([`dry-run.ts:190-230`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/utils/dry-run.ts)).

## shadcn gaps (relative to this dimension)

Note on package split: the CLI in `packages/shadcn` is a thin wrapper; the
actual write path lives in `packages/registry` (`addComponents` in
`src/add-components.ts`, file writes in `src/updaters/update-files.ts`). Both
were read at the pinned commit, so the claims below rest on the real writer,
not the wrapper.

1. No recorded baseline, so no three-way merge — confirmed in the writer.
`updateFiles` skips only when `isContentSame` (whitespace-normalized;
import-tolerant in workspace mode)
([`update-files.ts:200-223`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/registry/src/updaters/update-files.ts),
[`compare.ts`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/registry/src/compare.ts)).
Otherwise an existing file is skipped, confirmed per-file at a prompt
(`226-256`), or replaced wholesale by `fs.writeFile` (`283`). A grep across
`packages/registry/src` finds no base64/sha store, no installed-original
record, no diff3-style merge (the only sha256 uses are a cache key and header
hashing). Partial credit: `.env` files get append-only merging of new keys
(`267-281`; [`update-env-vars.ts:61-65`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/registry/src/updaters/update-env-vars.ts)),
and CSS variables are additive by default
([`update-css-vars.ts:316-320`](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/registry/src/updaters/update-css-vars.ts)).
2. Overwrite is coarse and confirmation-gated only in narrow cases.
Beyond the style/theme confirm in `add.ts:142-165`, the flow offers no
per-hunk accept, no conflict sidecars, and no structured resolved-state;
the skill explicitly warns against unapproved `--overwrite`, which concedes
the risk rather than removing it.
3. No transaction machinery in the writer — confirmed by inspection.
Writes are sequential direct `fs.writeFile` calls with no backup directory,
no manifest, no expected-byte recheck, no lock, and no rollback: a grep for
backup, rollback, lock, and transaction across `packages/registry/src` returns
only unrelated hits (conflict-marker-tolerant parsing, RTL marker classes).
A mid-run failure or a concurrent edit leaves a partially written tree with
nothing to restore from. Crash and concurrency behavior are therefore
unprotected, not merely unverified.

## Strongest defensible narrow Synthex win

For a team that customizes owned files and regularly pulls upstream fixes,
Synthex's `update` is the narrower, safer tool: recorded originals plus an
automatic line-level merge that applies non-conflicting upstream hunks around
local edits, blocks the whole batch on any overlap, and leaves an auditable
backup — where shadcn requires an operator to decide how customized files should merge after
`add --diff`, or to choose whole-file `--overwrite`. The win is scoped to file-level
maintenance discipline, not preview UX or transform breadth, where shadcn is
stronger.

Disconfirming evidence: a demo of the Synthex merger silently mangling a real
component; shadcn's additive paths (`.env` key-merge, additive CSS vars,
import-tolerant skip) proving sufficient for common updates; or the release
gap itself — until a CLI with `diff`/`update` is published, the safer
mechanism is unavailable from npm while shadcn's manual workflow works today.
Scores are unchanged by the package-split inspection: the writer confirms what
the wrapper suggested.

## Uncertainty and evidence tier

- Source-read (high): all claims read at the pinned commits, including the
real writer (`packages/registry/src/add-components.ts`,
`src/updaters/update-files.ts`) added to the sparse clone after the first
pass. Test-run: `componentMerge.test.ts` (27 passed) and
`componentUpdates.test.ts` (29 passed) in `packages/cli`.
- Limits: per-file rename and rollback on handled failures are not crash-durable multi-file transactions. The cooperative CLI lock does not lock external editors; byte checks are not an operating-system compare-and-swap.
- Unverified: CLI runtime behavior beyond unit tests; any published Synthex
CLI with these commands; device validation (device group OFF).
- shadcn absence claims rest on direct inspection plus a
`packages/registry/src` grep for backup/rollback/lock/transaction/base64
mechanisms, not on search alone.

## Acceptance tasks (small, bounded)

1. Publish-gated merge demo: from a build containing `diff`/`update`, `add` a
component, edit one line, advance the bundled registry on other lines, run
`update`, and assert exit 0, both edits present, baseline advanced, and a
backup directory with a manifest of touched paths.
2. Conflict drill: craft an overlapping edit, run `update --write-conflicts`,
assert exit 1 with owned files and state byte-identical plus sidecars and a
manifest; hand-merge, rerun with `--resolved <path>`, assert exit 0.
3. Concurrency guard: create `.synthex/components.lock` manually, run
`update`, assert it aborts before any write without deleting the lock; remove
it and rerun to confirm success.
