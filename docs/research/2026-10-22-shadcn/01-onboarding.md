# Onboarding and delivery: Synthex vs shadcn

Date: 2026-10-22. Synthex `7babe5ef` on `ace/competitive-critique`; shadcn `25af02b` (`shadcn` 4.22.1), cited via pinned links. Scope: first install on new and existing apps, docs versus published tarballs, manual wiring, CLI payload portability, release truth. Scores are judgment, not measurements. A hard split runs through everything below. Synthex's merged source describes a coherent onboarding story, but the published packages predate it: `synthex-ui` and `@luseefor/synthex-cli` are both `1.1.0`, last modified 2026-03-06 (`npm view` output, exact strings in Commands). The repo banners say so explicitly, and this report scores source capability while marking shipped readiness separately.

## Rubric and scores (weights sum to 100%; each criterion out of 10; totals rounded to one decimal)

| # | Criterion (weight) | Synthex | shadcn | Synthex contrib | shadcn contrib |
|---|---|---|---|---|---|
| 1 | New-project scaffold (`create`/`init`, templates, package managers) (25%) | 7 | 9 | 1.75 | 2.25 |
| 2 | Existing-app wiring (`setup`/`init` safety, detection, manual steps) (25%) | 7 | 9 | 1.75 | 2.25 |
| 3 | Component add flow (`add`, dry-run/diff, registries, monorepos) (20%) | 7 | 9 | 1.40 | 1.80 |
| 4 | Release truth: docs vs published payload plus gates (20%) | 4 | 9 | 0.80 | 1.80 |
| 5 | Update and migration path (`diff`/`update`, codemods, presets) (10%) | 6 | 7 | 0.60 | 0.70 |
| | **Weighted total** | | | **6.3** | **8.8** |

## Synthex strengths

1. Three starters including Expo, with pinned manifests. `create --template vite|next|expo` copies the matching template and renames `package.json[name]` without installing anything, printing manager-correct install and run commands (`packages/cli/src/commands/create.ts:63-96`; `docs/frameworks.md:27-34`). The Expo starter pins SDK 58 (`templates/native/package.json:13-22`), and the UI package exposes a `react-native` export condition per subpath (`packages/ui/package.json:11-19`).
2. `setup` is safe by construction. It never overwrites: identical reruns report `skipped-existing`, differing files throw before any write, including under `--dry-run` (`packages/cli/src/commands/setup.ts:192-213`). Config paths are validated against traversal, absolute paths, and symlink escape (`packages/cli/src/utils/uiConfig.ts:124-144,151-190`). Install commands are printed per manager, including the SDK-aware Expo form with a warning never to plain-install `react-native-svg` (`packages/cli/src/commands/setup.ts:259-287`; `docs/frameworks.md:119-128`).
3. Lean, platform-aware `add` with exact dependency hints. With `synthex-ui.json` present, web installs copy web files and Expo installs copy native files, pruning `_shared` to the import closure; tests are excluded and destinations preflighted (`packages/cli/src/commands/add.ts:141-177`; `docs/registry.md:50-76`). Web `button` copies exactly 4 files and reports only the packages the selected files import; the CLI never auto-installs or edits `package.json` (`docs/frameworks.md:323-327`).
4. Honest docs and thorough gate scripts. The README and framework docs banner every new capability as source-only until the next CLI publish (`README.md:5-8`; `docs/getting-started.md:3-7`; `docs/updating-components.md:3-14`). `scripts/onboarding-check.mjs:164-206` scaffolds from the packed CLI, repins the scratch app to the local tarball, installs, builds, then runs `setup` plus owned-button `add` per template; `scripts/pack-check.mjs:260-409` exercises the packed CLI end to end including merge previews, backup restore, and conflict sidecars.

## Synthex gaps

1. The published CLI predates the entire onboarding story. Per the banners above, `npx @luseefor/synthex-cli@latest` (still 1.1.0) lacks `create --template`, `setup`, lean `add`, and `diff`/`update`. A developer following the README against the public tarball gets none of the judged behavior. This is the single largest delivery-readiness gap and caps criterion 4 at 4.
2. `setup` shifts all wiring risk onto the user. It does not install dependencies and does not touch build config, layouts, entry files, or existing CSS (`docs/frameworks.md:129-135`). The per-framework checklists are precise (`docs/frameworks.md:142-227`), but every step is a place a newcomer can diverge, and nothing verifies the result until the app builds.
3. Framework detection is deliberately narrow. Only `dependencies`/`devDependencies` count; config files alone fail, multiple matches require `--framework`, and Next.js demands App Router (`packages/cli/src/utils/project.ts:190-208,288-376`). Each rule is defensible, but the funnel produces more hard stops on messy real repos than shadcn's template inference.
4. The registry story is local-only. Only `@synthex` and `@default` namespaces resolve; every other registry is refused (`packages/cli/src/commands/add.ts:125-133`). There is no remote registry ecosystem, no preset packaging, no MCP server, and no agent skill files.

## shadcn strengths

1. One `init` covers scaffolding and adoption. Aliased to `create`, it takes `[components...]` and offers `--template` (next, start, vite, react-router, laravel, astro), `--base`, `--monorepo`, `--preset`, `--defaults`, `--force`, `--cwd`, `--name`, and reinstall flags with a yes-by-default non-interactive posture (pinned: `packages/shadcn/src/commands/init.ts`, option block). Scaffolding resolves per framework with monorepo overrides (pinned: `packages/shadcn/src/templates/index.ts`, `packages/shadcn/src/templates/create-template.ts`).
2. The `add` surface is the most complete preview-and-apply loop in the comparison: `--dry-run`, `--diff [path]`, `--view [path]`, `--all`, `--path`, `--overwrite`, `--yes`, `--cwd` (pinned: `packages/shadcn/src/commands/add.ts`). Standalone `diff` explicitly defers to `add --diff` (pinned: `packages/shadcn/src/commands/diff.ts`), which signals the preview path is maintained rather than legacy. Monorepo targets are resolved from config rather than requiring manual `--cwd` discipline (pinned imports in `add.ts`/`diff.ts`).
3. Distribution beyond the CLI: namespaced, URL, and local-path addresses, registry config ensured from the component list, preset codes with a builder flow, five codemod migrations with `--list` (pinned: `packages/shadcn/src/commands/migrate.ts`), an `mcp` command wiring Claude/Cursor/VS Code clients (pinned: `packages/shadcn/src/commands/mcp.ts`), and a skill bundle with enforced styling, form, and composition rules (`skills/shadcn/SKILL.md` with `rules/`, `agents/`, `scripts/` alongside).
4. What is documented is shippable. The reviewed source is the published 4.22.1 lineage, so `init`, `add --diff`/`--dry-run`, presets, registries, and MCP reflect installable behavior rather than forthcoming work. That collapses the source-vs-tarball gap that dominates the Synthex column.

## shadcn gaps

1. No native or Expo story. All six templates are web targets; nothing in the reviewed CLI maps to React Native, Expo SDK handling, or dual web/native payloads. For the stated web-and-mobile audience this is a coverage gap, not a quality judgment.
2. High-mutation onboarding. `init` sets up configuration, writes files, and installs dependencies (its own description, pinned `init.ts`), with `--force` and reinstall flows that overwrite owned files. The blast radius per run exceeds Synthex's never-overwrite `setup`, and safe outcomes depend on prompts and backups rather than structural refusal.
3. Owned-edit merging is weaker than Synthex's design. The update model is re-add/overwrite plus preview; I found no three-way base/local/incoming merge with backups and conflict sidecars comparable to Synthex's `update` (`docs/updating-components.md:83-135`). Teams heavily customizing copied components get preview tooling but not merge semantics.

## Strongest defensible narrow Synthex win

For a team shipping one design system to web and Expo from a single CLI, Synthex's source story is the only coherent option here: `create --template expo` plus SDK-aware `setup` lines, `react-native`-conditioned exports, and platform-pruned owned `add` form an end-to-end native path shadcn does not attempt. Score impact is deliberately narrow (criteria 1-3, not the totals), and it is a source-capability win, not a shipped win: nothing in this paragraph holds for the published 1.1.0 CLI.

Disconfirming evidence that would overturn it: shadcn publishing any Expo/native template or native-conditioned registry payload; a published Synthex CLI whose Expo starter fails `scripts/onboarding-check.mjs --template expo` or whose native `add` leaks `.web.` or provider files into Expo projects (the packed gate at `scripts/pack-check.mjs:393-401` already asserts the contrary, but I ran no installs or builds).

## Acceptance tasks

1. Close the shipped gap: publish the CLI, then show `npm view @luseefor/synthex-cli version` above 1.1.0 with `setup --help` listing `--framework` and `--dry-run` from the `@latest` tarball.
2. Replay the packed-CLI gate on one scratch Vite app: `setup --dry-run` writes nothing, `setup` writes three files, and `add button` yields exactly the four lean files with the four-package hint (`docs/frameworks.md:323-327`).
3. Replay the Expo gate without devices: `create --template expo` from the packed CLI, repinned to the local tarball, passes `typecheck` and `expo export --platform android` as `scripts/onboarding-check.mjs:156-162,196-204` requires.

## Uncertainty and evidence tier

High tier: Synthex source behavior (read in full for `setup`, `create`, `add` planning, config validation), npm metadata (both packages 1.1.0, modified 2026-03-06), shadcn command surfaces (option schemas, registration in pinned `packages/shadcn/src/index.ts`, skills content). Medium tier: shadcn `init` end-to-end effects (judged from wiring, descriptions, and template/preset imports; I did not trace every writer or run it) and CI gate effectiveness (workflows read, not executed). Not validated: installs, builds, dev servers, and all device or screen-reader behavior; device group OFF. An unsuccessful search was never treated as absence: registry, MCP, and preset claims rest on files read, and gaps state what was inspected.

## Commands and outcomes

- `npm view synthex-ui version time.modified dist-tags` → `1.1.0`, `2026-03-06T06:56:48.357Z`, `latest: 1.1.0`.
- `npm view @luseefor/synthex-cli version time.modified dist-tags` → `1.1.0`, `2026-03-06T06:57:08.989Z`, `latest: 1.1.0`.
- `node packages/cli/dist/index.js --help` → exit 0; lists `add`, `apply`, `create`, `diff`, `update`, `init`, `setup`, `layout:*`. No installs, builds, or suites were run.

Follow-up artifact verification: the [published CLI evidence](./published-cli-evidence.json) records the pinned 1.1.0 tarball integrity and confirms its entry registers no create/setup/add/diff/update commands. This verifies the release gap beyond the timestamp and banners.
