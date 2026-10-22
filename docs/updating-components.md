# Updating owned components (`diff` / `update`)

> These instructions target `@luseefor/synthex-cli@1.2+` and `synthex-ui@2+`.
> If your installed packages predate those versions, run the CLI from source
> (`packages/cli`) in this checkout. See `docs/releases/v1.2.md` for version
> scope. Source locations: `packages/cli/src/commands/diff.ts`,
> `packages/cli/src/commands/update.ts`,
> `packages/cli/src/utils/componentUpdates.ts`,
> `componentMerge.ts`, `componentState.ts`, `componentTransaction.ts`,
> `componentInstall.ts`, `componentTypes.ts`. A newer CLI also ships a newer bundled
> registry, so the `availableVersion` you see can change after you upgrade the
> CLI itself.

`add` copies registry bytes into your project and records that original.
`diff` previews what changed since, without writing. `update` merges registry
changes into your owned copies, preserving your edits, with backups and
conflict protection. This is the detailed reference; `docs/frameworks.md`
("Own the source with `add`") and `docs/llms.txt` point here.

## What `add` records

On every `add` (including `add --overwrite`), the CLI writes
`.synthex/components.json` (`version: 1`) alongside your files:

- `destinationRoot`: project-relative destination (for example
  `components/ui` or `src/components/ui`).
- `platform`: `"web"`, `"native"`, or `null` (legacy no-config install).
- `requests`: the active root specs you installed (`button`, `@synthex/button`,
  or a full `https:`/`data:` URL for remote components).
- `files`: one entry per installed file (`path`, `component`, `source`,
  `registryVersion`, `base`, `sha256`), where `base` is the installed
  original bytes (base64) and `sha256` is its hash.

This state is distinct from the layout-engine history used by the workbench
(`.synthex/history.json` plus `layout.json`, managed by
`packages/cli/src/engine/fileManager.ts`). Deleting
`.synthex/components.json` resets the component baseline; it does not touch
layout history, and vice versa.

`registryVersion` comes from `registry.json` (`version`) for local
components. When the registry has no version it is recorded as `null` and
displayed as `unknown` — honest, not guessed. Remote (`https:`/`data:`)
components always record `null` for the version; the full request URL is
tracked in `requests` and each file's `source` (`<url>#<path>`), so updates
re-fetch the same URL.

`add --overwrite` also goes through the backup transaction below before
writing, same as `update`. An explicit re-install from a different registry
replaces the superseded origin for that component, while retaining unrelated
requests; update-all then fetches the active source.

## `diff`: read-only preview

```sh
npx @luseefor/synthex-cli@latest diff [component...] --cwd <dir> --json
# These examples target @luseefor/synthex-cli@1.2+; run packages/cli from source in this checkout if needed
```

- With no `component...`, previews all recorded installs (`requests`).
  Pass names to limit the preview (for example `diff button card`).
- Read-only: never writes components, state, backups, or conflict files.
  `backupDir` and `conflictDir` are always `null` on a `diff` manifest.
- `--cwd <dir>`: target project directory.
- `--json`: emits the structured manifest (`cwd`, `dryRun: true`, `files[]`,
  `conflicts`, `backupDir`, `conflictDir`) instead of human-readable patches.

Each entry carries `path`, `component`, `status`, optional `reason`,
`installedVersion` / `availableVersion` (`null` renders as `unknown`),
`diff` (local vs result, or local vs incoming when `conflict`/`untracked`),
plus `localDiff` (base vs local) and `upstreamDiff` (base vs incoming) for
separate review. Use `diff --json` to get the local and upstream patches
independently.

Statuses: `unchanged`, `updated` (upstream changed, local untouched),
`merged` (both sides changed in different places), `local-only` (upstream
matches base, your edit/deletion is kept), `created` (new upstream file),
`deleted` (upstream removed the file and you never touched it), `conflict`,
`untracked` (a file with no recorded original — see "Legacy copies" below).
`update` adds one more status, `resolved` (see below).

## `update`: merge with backups and conflict protection

```sh
npx @luseefor/synthex-cli@latest update [component...] --cwd <dir> --dry-run --json --write-conflicts
npx @luseefor/synthex-cli@latest update button --resolved components/ui/button/index.ts
# These examples target @luseefor/synthex-cli@1.2+; run packages/cli from source in this checkout if needed
```

- With no `component...`, updates all recorded installs. Updates only apply
  to recorded components; unknown names error out before any writes.
- `--dry-run`: preview the merge without writing components, state, or
  backups. No disk writes, even combined with `--write-conflicts` or
  `--resolved`.
- `--json`: same structured manifest as `diff`, with `dryRun` reflecting the
  flag and `backupDir`/`conflictDir` set when the run actually wrote them.
- `--write-conflicts`: on a real (non-`--dry-run`) run that has conflicts,
  save the three versions for manual merging (next section). Without it, or
  on `--dry-run`, no conflict files are written.
- `--resolved <file...>`: accept the current on-disk contents of explicitly
  listed conflicting files (project-relative paths, repeatable). See
  "Resolving conflicts" below. This accepts your current bytes, not the
  incoming registry bytes — there is no `--force`-incoming flag.
- Exit code is `1` when any conflict remains; `0` otherwise.

How the merge works (`mergeComponentFile`, pure, no I/O):

- Independent edits on different lines merge (`merged`).
- Your edits are preserved when upstream did not touch the file
  (`local-only`), including a preserved local deletion (you deleted a file
  upstream left alone — it stays deleted).
- A clean upstream change applies when you never touched the file
  (`updated`, `created`, `deleted`).
- Any conflict stops ALL applies: when one or more files conflict, `update`
  writes nothing — no component file, no state, no backup. Fix or
  `--resolved` every conflict, then rerun.
- Owned files never get conflict markers. On conflict the file is left
  exactly as you had it (`content` is your local bytes) with a `reason`
  explaining why manual resolution is required (overlapping edits, binary
  changed on both sides, invalid UTF-8 on both changed sides, oversized file
  or line count, local deletion vs upstream edit, upstream deletion vs local
  edit, or two differing independent additions with no base).

On success the baseline advances: `.synthex/components.json` is rewritten so
each file's `base`/`sha256`/`registryVersion` equal the upstream bytes just
merged (or kept). A file where your edit was preserved (`local-only` or
`merged`) keeps its future local diff — the next `diff` shows your
customization against the new upstream, not against the old one.

`update` refuses before any writes when the `synthex-ui.json` destination or
platform no longer matches the recorded install ("The component directory or
platform differs from the recorded installation... moving an installation
requires manual review"). There is no `--force`, no `--reject`, and no patch
overwrite mode — move or reconcile the install manually.

## Conflict artifacts (`--write-conflicts`)

Only a real run with conflicts writes them. Each run creates one directory:

- `.synthex/conflicts/<uuid>/base/<project-path>` — recorded original bytes.
- `.synthex/conflicts/<uuid>/local/<project-path>` — your bytes at preflight.
- `.synthex/conflicts/<uuid>/incoming/<project-path>` — incoming registry bytes.
- `.synthex/conflicts/<uuid>/manifest.json` — `{ version: 1, files[] }`
  with each conflict's change plus `baseExists`/`localExists`/`incomingExists`.

Sides that do not exist (created/deleted files) are omitted. A plain
conflict run and any `--dry-run` write nothing to disk.

## Backups and manual restore

Every successful `update` (and every `add`, including `add --overwrite`)
that actually changes bytes first backs up prior bytes under:

- `.synthex/backups/<uuid>/files/<project-relative-path>` — exact prior
  bytes of each overwritten file (plus the prior `.synthex/components.json`
  bytes at `files/.synthex/components.json`).
- `.synthex/backups/<uuid>/manifest.json` —
  `{ version: 1, files: [{ path, existed }] }`. `existed: false` marks created
  files (no prior bytes to back up) and the manifest also covers the state
  file itself.

When every mutation is a no-op (identical rerun), no backup directory is
created (`backupDir: null`).

To restore manually, copy the exact bytes back, including the state file —
restoring a component file without restoring `.synthex/components.json`
leaves the baseline advanced and the next `diff` will disagree with what is
on disk. Steps:

```sh
# 1. Find the run to restore (manifest lists every touched path):
cat .synthex/backups/<uuid>/manifest.json
# 2. Restore each file byte-exactly, including the state:
cp .synthex/backups/<uuid>/files/components/ui/button/index.ts components/ui/button/index.ts
cp .synthex/backups/<uuid>/files/.synthex/components.json .synthex/components.json
```

Review the manifest before deleting anything: a path with `existed: false`
was created by that run, so "restore" means deleting the created file — but
never delete unrelated new files blindly. Only remove paths the manifest
lists, and only when you intend to undo that run.

## End-to-end example (edits preserved)

```sh
# 1. Install and record the baseline.
synthex add button
# -> writes components/ui/button/* and .synthex/components.json

# 2. Customize an owned file (your edit).
# components/ui/button/index.ts, add your own variant:
# export const myCtaClass = "rounded-full font-semibold";
```

```sh
# 3. Preview later registry changes (read-only).
synthex diff button --json
# -> button/index.ts: status "merged" (or "local-only" if upstream
#    did not touch your lines), diff shows the merge result.

# 4. Apply when the preview looks right.
synthex update button
# -> non-overlapping upstream hunks merge around your variant;
#    baseline in .synthex/components.json advances to the new upstream,
#    so the next `diff` shows only your variant as the local diff.
```

## Resolving conflicts

`update` never auto-resolves overlapping changes. The workflow is:

```sh
# 1. Preview and save the three versions (real run, conflicts present).
synthex update button --write-conflicts
# -> exit 1, files untouched, prints e.g.
#    Conflict files: /path/to/app/.synthex/conflicts/<uuid>

# 2. Open the sidecars for the conflicting path and hand-merge into the
#    owned file. Only the owned file matters; never edit the sidecars
#    expecting the CLI to pick it up.
#    .synthex/conflicts/<uuid>/base/components/ui/button/index.ts
#    .synthex/conflicts/<uuid>/local/components/ui/button/index.ts
#    .synthex/conflicts/<uuid>/incoming/components/ui/button/index.ts
#    Edit: components/ui/button/index.ts  (your resolved result)

# 3. Re-run update, naming each file you resolved (exact project-relative
#    path shown by diff, repeatable for several files).
synthex update button --resolved components/ui/button/index.ts

# 4. Optional safety preview first — still writes nothing:
synthex update button --resolved components/ui/button/index.ts --dry-run
```

What `--resolved` means, exactly:

- The current on-disk bytes of each listed path are kept as-is. The CLI
  performs no marker insertion and no file overwrite for those paths; the
  baseline for those paths advances to the incoming registry bytes, so the
  next `diff`/`update` treats your resolution as the new local state instead
  of re-reporting the same conflict. Without this, rerunning `update` after
  hand-merging would report the conflict again forever — `--resolved` is what
  breaks that loop.
- It is an explicit accept-current, not a force-incoming: there is no flag
  that discards your edits in favor of upstream. To take upstream wholesale,
  check out the `incoming` sidecar over the owned file yourself, then pass
  that path via `--resolved`.
- Unknown paths error before any writes
  (`Unknown resolved path(s): ... Use project-relative paths shown by diff.`).
  A path that is not currently conflicting also errors before any writes
  (`"... is not a conflicting file; omit it from --resolved."`).
- Every conflict must be gone before anything applies: if any conflict
  remains (unresolved and unmergeable), `update` still writes nothing,
  including the files you did resolve. Resolve or fix all of them, then
  rerun.
- `--dry-run` with `--resolved` still writes nothing; it only previews the
  `resolved` statuses.
- Upstream-removed edge case: if upstream removed a file you kept (with
  edits) and you accept your kept copy via `--resolved`, the baseline record
  for that path is dropped while your file stays on disk untouched — it
  becomes unmanaged (never deleted for you). If you had deleted a file
  upstream modified and you accept the deletion via `--resolved`, the file
  stays absent and the baseline advances to upstream, so the deletion is
  preserved as a local deletion going forward.

## Legacy copies without state

- `diff <name>` still previews in an untracked project (or for untracked
  files): those files report `untracked` with reason "This existing file has
  no recorded original; it cannot be merged automatically."
- `update` refuses without a recorded baseline (`No recorded original
  exists. Review "synthex diff <component>" first. An identical
  "synthex add <component>" records a baseline; modified legacy files need
  manual reconciliation.`). An identical `add` adopts the files (records the
  baseline; `skipped-existing`); files you modified must be reconciled by
  hand — `add --overwrite` would take the registry bytes (backed up first),
  it does not migrate your edits. There is no automatic-migration claim.

## Limitations

- No `--force`, `--reject`, or patch-overwrite mode on any command.
- Config moves are unsupported: changing `componentsDir` or the framework
  platform in `synthex-ui.json` after installing blocks `update` until you
  restore the original config or reinstall manually.
- Large/binary/non-UTF-8 files that changed on both sides always conflict;
  the 512 KiB merge cap, the line-count cap, and the diff display caps are
  reported as the `reason`/diff message rather than attempted.
- Remote components carry no registry version (`null`/`unknown`); updates
  re-fetch the recorded URL with the newer bundled registry only when you
  upgrade the CLI.
- Conflict sidecars and backups live inside the project (`.synthex/`); they
  are not cleaned automatically. Delete a `.synthex/conflicts/<uuid>` or
  `.synthex/backups/<uuid>` directory only when you are sure you no longer
  need that run's artifacts.

Concurrent CLI mutations are serialized with `.synthex/components.lock`. The
transaction checks file contents again before each write. If a run fails,
rollback restores only files that still contain its own output; newer user
edits are preserved and reported with the backup location. An interrupted
process can leave a lock: check the PID recorded in that file, ensure the
process has stopped, then remove the stale lock before retrying. The CLI does
not remove another process's lock automatically.

When a valid registry explicitly retires an installed component, its untouched
files can be removed with backups; locally modified files require conflict
resolution. A missing payload that the registry still advertises is treated
as a broken registry and aborts the update. Recorded requests remain after
retirement, so repeated updates are harmless and can detect a later return.
If a remote URL changes its component name, its old paths are included in the
same review: untouched paths can be removed, while edited paths block the
entire batch until resolved.


## Shared files in lean installs

Configured web and native installs copy only referenced `_shared` files.
Updating a subset of recorded roots preserves shared files outside that plan,
since other installed components may still need them. A full update (no
arguments, or every recorded root listed) also checks previously tracked shared
files that the new plans no longer reference. Unmodified unused files are
removed with backups; locally modified files produce a conflict before the
batch writes anything. Untracked application files are not pruned.
