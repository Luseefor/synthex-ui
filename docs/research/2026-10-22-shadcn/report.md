# A defensible Synthex advantage: maintaining customized component source

Synthex's strongest immediate competitive opportunity is **baseline-aware updates for components a team has already customized**. Build the product story around keeping a team's local design changes while taking upstream fixes, with explicit conflicts, previews and recoverable writes. The merged implementation already supplies much of this mechanism. Its published release and recovery experience need work before this becomes a reliable customer promise.

shadcn remains stronger in onboarding, distribution and ecosystem readiness. Native coverage gives Synthex a second, structurally different opportunity, but mobile behavior still needs device evidence. The maintenance opportunity is a closer comparison: both products distribute component source that users edit.

## Scope and five-critic scorecard

As of 2026-10-22, compare Synthex merged commit `7babe5ef2c2d1959e680d6edfc19bc384ce428ea` with official shadcn commit `25af02b1b467fcd53b63e0c6d6d324c57c16ef18`, whose CLI package version is 4.22.1. [Sources](./sources.json), [methodology](./methodology.md) and each report preserve the scope and rubric.

| Independent critique | Synthex /10 | shadcn /10 | Interpretation |
|---|---:|---:|---|
| [1. Onboarding and delivery](./01-onboarding.md) | 6.3 | 8.8 | shadcn offers the stronger installable adoption flow; Synthex's current source is ahead of its published release. |
| [2. Sampled web component contracts](./02-web-contracts.md) | 7.6 | 7.0 | Synthex has useful explicit association/disabled contracts. This is a sampled source review, not a whole-library accessibility verdict. |
| [3. Customized owned-source maintenance](./03-owned-source.md) | 7.3 | 4.7 | Synthex has a built-in original/local/incoming model and a conservative apply path. shadcn has capable previews and an assisted merging workflow. |
| [4. Single-stack web + Expo task fitness](./04-cross-platform.md) | 6.3 | 1.6* | Synthex supplies both hosts. shadcn core deliberately targets web. |
| [5. Product and ecosystem readiness](./05-product-ecosystem.md) | 5.3 | 8.2 | shadcn has the more coherent distribution/discovery ecosystem and released breadth. |

These are rubric-based judgments, not measured product quality or customer-study scores. Do not average unlike dimensions into a universal rating. Each report provides criterion weights and arithmetic. The web critic revised shadcn's score from 6.7 to 7.0 after crediting the current RHF-free `Field` path, inherited primitive behavior and equivalent accessible naming. This correction matters: finding a weakness in the legacy `Form*` recipe does not establish that all shadcn form patterns have it.

\* **1.6 rates a particular single-stack web-and-Expo purchasing requirement. It is not shadcn's web quality score.** React Native support in core is outside shadcn's scope. Pairing shadcn with a separate native project, such as React Native Reusables, is a real alternative that this review did not evaluate end to end. This deliberately asymmetric score is excluded from the main positioning argument.

## The customer problem worth owning

Consider a product team that copied a Button, changed its brand treatment and analytics, and later needs an upstream accessibility fix. Replacing the file discards useful local work. Keeping it unchanged misses the fix. Looking at the current local and upstream files helps review, but does not by itself identify which differences are intentional customizations.

The target customer already wants source ownership, makes recurring customizations, and expects to maintain them across releases. A team that rarely edits copied files, or already maintains a successful Git/vendor-patch process, may gain little. The hypothesis is a lower-maintenance ownership workflow for that specific team, not a new reason for every shadcn user to migrate.

Define three versions:

- **B:** the original installed upstream bytes after the installer's platform transformations.
- **L:** the team's current local bytes.
- **U:** the newly available upstream bytes after the same planning path.

The baseline resolves an ambiguity that two versions cannot resolve. Given identical observed `L` and `U`, one history might have `B=L`, meaning the local file is untouched and should take the upstream change. Another history might have `B=U`, meaning upstream is unchanged and the local customization should remain. A deterministic decision needs history or an equivalent baseline. Git can provide this history when teams maintain it; Synthex records it as part of installation.

This is the useful differentiation: an explicit history model integrated with the component installer and updater.

## What the implementation actually does

[Component state](../../../packages/cli/src/utils/componentState.ts) records original bytes, a hash, origin and registry version. [The merge function](../../../packages/cli/src/utils/componentMerge.ts) handles unchanged files, upstream-only changes, local-only changes and non-overlapping text edits. Overlapping edits, changed binary inputs, unsupported encodings and guarded large inputs produce conflicts instead of conflict markers in the owned file.

[Update planning](../../../packages/cli/src/utils/componentUpdates.ts) distinguishes local and upstream patches, refuses an apply when any selected file conflicts, and advances the baseline to upstream bytes rather than to the merged customization. That last detail keeps a second update from treating the team's own edits as newly installed upstream content. `--resolved` explicitly accepts current contents for named conflicting paths and advances the upstream baseline; it does not prove that a human resolution is correct.

[The transaction implementation](../../../packages/cli/src/utils/componentTransaction.ts) checks expected bytes, uses an exclusive lock between cooperating Synthex transactions, creates original-byte backups and a manifest, writes individual files through temporary files and rename, and attempts rollback on handled failures. It preserves an observed newer edit during rollback and reports anything it cannot restore.

The current shadcn comparison deserves full credit. Its [CLI add path](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/commands/add.ts) supports project-aware previews, diffs and file views. The [official update workflow](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/skills/shadcn/SKILL.md#updating-components) instructs an operator to inspect differences and preserve local modifications while applying upstream changes. Its [actual file updater](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/registry/src/updaters/update-files.ts) transforms and replaces component files with overwrite/skip decisions; it also has specialized environment-file merging. The review found no equivalent recorded per-component baseline and three-way component transaction in that examined path. This is narrower than claiming shadcn cannot merge changes: people, Git and assistants can perform that work.

## Reproduced evidence

This review reran four existing CLI suites: merge, state, transaction and updates. **94 tests passed.** A separate [behavioral demonstration](./owned-update-proof.ts) exercised the real source APIs with a temporary registry and project, without mocks. Its [saved result](./owned-update-results.json) records eight passing checks:

1. Installation stores the exact original and matching hash.
2. Different baselines produce the appropriate different decisions for the same observed local/upstream pair.
3. A disjoint-merge preview leaves every project file unchanged.
4. Applying preserves the local customization, takes the upstream change, backs up the former local bytes and records upstream as the new baseline.
5. Repeating that update produces no byte changes or new backup.
6. An overlap blocks an entire two-component batch, including the otherwise clean file, in both real and dry runs.
7. Explicit resolution keeps current bytes and prevents the same conflict recurring.
8. A stale transaction expectation refuses an overwrite without changing the project.

Reproduce from the repository root:

```sh
bun --cwd packages/cli vitest run \
  src/utils/componentMerge.test.ts src/utils/componentState.test.ts \
  src/utils/componentTransaction.test.ts src/utils/componentUpdates.test.ts
bun docs/research/2026-10-22-shadcn/owned-update-proof.ts
```

These are behavioral checks, not a head-to-head execution benchmark. No shadcn merge attempt, user task timing, semantic compilation, crash injection or native device test was performed by the demonstration. The Synthex source was previously validated by its merged PR checks; those historical checks are separate from this audit's targeted rerun.

## Why the claim must stay bounded

**The release gap is currently the largest blocker.** npm still exposes Synthex CLI/UI 1.1.0, modified on 2026-03-06. This audit also downloaded the pinned CLI tarball without executing lifecycle scripts and inspected its entry registrations. They lack `create`, `setup`, `add`, `diff` and `update`; the [artifact evidence](./published-cli-evidence.json) records its integrity and entry hash. The new workflow is merged source, not a verified `@latest` experience.

**An update can introduce an undeclared dependency.** The plan computes dependencies, but the update manifest currently does not return them. A source merge that adds an import may leave the consumer unable to build. This directly weakens the central maintenance promise.

**Line merges do not establish semantic correctness.** Independent textual changes can still break a prop contract, import or behavior. A conflict-free result must remain subject to the consumer's typecheck and tests. Adjacent hunks may also conservatively conflict even when a person could merge them.

**Recovery is still operator work.** There is no dedicated backup inspection/restore command or retention policy. Stale locks require deliberate manual handling. Baseline files add storage, and deleting or corrupting them requires recovery or re-adoption rather than guessing an original.

**Filesystem guarantees have limits.** Per-file atomic rename and handled-error rollback are not a crash-durable, multi-file database transaction. There is no durability journal or `fsync` protocol. The CLI lock does not lock an external editor, and a byte check followed by a write is not an operating-system compare-and-swap. Do not promise protection against every crash, hostile filesystem race or concurrent editor interleaving.

**Test counts need inspection too.** `componentUpdates.test.ts` includes `expect(manifest.backupDir).toBeNull;` without invoking the matcher. That assertion proves nothing. The demonstration deliberately checks concrete state, backup bytes and byte snapshots instead of using suite counts as a substitute for behavior. Correcting the assertion should first establish the intended first-install backup contract, rather than adding parentheses and assuming null is right.

## Focused work plan

| Order | Bounded deliverable | Acceptance evidence |
|---|---|---|
| 1 | Release and adoption truth | Review the pending version/release work, publish through the authorized release process, and install exact released versions in isolated Vite, Next and Expo consumers. Verify `add`, `diff`, `update` and packed state/backup behavior from the registry artifact. Correct every `@latest` example to match what ships. No publish is performed by this research task. |
| 2 | Dependency-aware update preview | Extend the update manifest with selected incoming dependencies and package-manager-correct install guidance. Never silently install. A fixture where upstream introduces a new package must report it on `diff` and `update --dry-run`, write nothing in previews, and produce a consumer that builds after the documented install. |
| 3 | Inspectable recovery | Design `backup list/show` and a guarded restore preview. Restore file contents and recorded baseline together, respect created/deleted-file metadata, validate backup paths, and refuse to overwrite newer edits without an explicit reviewed decision. Prove stale-state and interrupted-recovery cases on real temporary filesystems. |
| 4 | Product-quality evidence | Maintain a versioned corpus of clean, disjoint, conflicting, deletion, retirement, remote-rename, shared-file, encoding and concurrency scenarios. Repair ineffective assertions, add realistic consumer typecheck cases, and document crash/race limits. Separate expected conservative conflicts from unexpected failures. |
| 5 | Demonstrate and test the customer promise | Ship one documented customization → upstream fix → preview → apply → conflict → resolution → recovery walkthrough. Run the same task corpus against pinned shadcn with its official assisted workflow, preserving Git-based solutions as valid alternatives. Publish raw outcomes, not just a favorable score. |

A head-to-head evaluation should record customization retention, upstream-fix retention, unintended file changes, conflict detection, recovery outcome, resulting consumer build and operator decisions. Establish exact versions and fixtures before execution; keep model/tool settings fixed for any assisted arm. Human task time needs actual participants and a stated protocol. The required safety gates should include zero unintended writes in previews/conflict-aborted batches and successful restoration of the expected file-and-baseline state. A lower time or intervention count is a hypothesis until measured.

## Positioning and stopping rules

The defensible source claim today is: **“Synthex records component originals and can merge non-overlapping upstream text changes while preserving local edits, with conflict previews and backups.”** Add “available from the published CLI” only after verifying the released artifact. Avoid “never loses changes,” “fully atomic,” “production-proven native,” or “better than shadcn overall.”

Prioritize the release, dependency delta and recovery path over more component families, visual presets or workbench features. Those other features may be useful, but do not strengthen this specific promise. Keep native development tied to independently useful customer work and device evidence rather than using shadcn's web scope to manufacture a low quality score.

Reconsider the bet if teams prefer their existing Git workflow, successful merges routinely fail consumer validation, recoveries are confusing, or an equivalent upstream history-aware updater erases the distinction. A fair loss in the task corpus is useful evidence. The aim is one valuable, demonstrable maintenance advantage that a team can adopt and trust.
