# 02 — Web component correctness and interaction contracts

Review date: 2026-10-22. Synthex `7babe5ef2c2d1959e680d6edfc19bc384ce428ea` (branch `ace/competitive-critique`). shadcn `25af02b1b467fcd53b63e0c6d6d324c57c16ef18` (`shadcn` 4.22.1, read-only). Scope: web contracts for Button, Form, Checkbox, Dialog, direction/RTL, theme contrast and SSR roots, plus evidencing tests. Native out of score. No screen-reader or device validation; nothing here certifies visual or assistive-technology outcomes.

## Scope note: matched Radix recipes, not all of shadcn web quality

Scores compare Synthex against its direct counterparts, the Radix-based `new-york-v4` recipes. Base UI / React Aria variants and the `Field` family are credited (C3) but are not the matched baseline. Legacy `Form*` criticisms apply to that family only: `Field` components are RHF-free layout (no `react-hook-form` import in any base `field.tsx`), and the official guide (`apps/v4/content/docs/forms/react-hook-form.mdx:10,32-37`) recommends `Field` for current work. `new-york-v4` is one style, not all of 4.22.1.

## Rubric (weights sum to 100%)

| Criterion | Weight | Rates |
|---|---|---|
| C1 Interactive correctness (keyboard, focus, disabled, form participation, dismiss) | 30% | Behavior under keyboard, focus, disabled, reset, submit, Escape/outside interaction |
| C2 ARIA and association (naming, describedby, invalid, required, dialog wiring) | 30% | Labeling and description/error linkage without dangling or clobbered references |
| C3 Composition and primitive choice (Slot, controlled patterns, Radix/Base UI/Aria) | 20% | asChild/Slot quality, controlled patterns, primitive selection |
| C4 Evidence quality (contract tests, axe/contrast/SSR, stated limits) | 20% | Runnable tests and documented limits, not source presence alone |

Scores are judgments on this dimension, not measurements. Arithmetic: Synthex `8×0.3 + 8×0.3 + 7×0.2 + 7×0.2 = 7.6`; shadcn `7×0.3 + 7×0.3 + 9×0.2 + 5×0.2 = 7.0`, to one decimal.

| Criterion | Synthex /10 | shadcn 4.22.1 /10 |
|---|---|---|
| C1 Interactive correctness | 8 | 7 |
| C2 ARIA and association | 8 | 7 |
| C3 Composition and primitive choice | 7 | 9 |
| C4 Evidence quality | 7 | 5 |
| **Weighted total** | **7.6** | **7.0** |

Revision note: shadcn C2 moves from 6 to 7. The docs recommend `Field` with explicit per-field wiring and no RHF-context requirement, narrowing the gap to the legacy `Form*` recipe. No other score changes were warranted.

## Source capability vs release readiness

Scores cover merged source, not the published package. The worktree names `synthex-ui` 1.1.0, and npm `synthex-ui` plus `@luseefor/synthex-cli` 1.1.0 were last modified 2026-03-06, predating the merged work. Nothing below is assumed published until a new release is verified. shadcn is assessed from pinned source, not any install.

## Synthex — strengths

1. **Disabled `asChild` links are truly deactivated, keyboard included.** `packages/ui/src/button/button.web.tsx:44-83` adds capture-phase click and Enter/Space guards, clones disabled state onto button-like children, and forces `aria-disabled` with `tabindex=-1`. `button.web.test.tsx:33-57` pins click/Enter cancellation plus handler restoration on re-enable.
2. **Form linkage auto-wires associations and respects callers.** `form/form.web.tsx:205-247` merges generated, caller, and child `aria-describedby` tokens with dedup, preserves custom `id`, honors explicit `required={false}`/`aria-*` opt-outs, and emits `required` with `aria-required`; `useFormField` (`:120-163`) references only mounted ids. `form.contract.web.test.tsx:20-184` covers opt-outs, unmount unlinking, merging, and id resolution; `form.web.test.tsx:52-76` shows a non-RHF path.
3. **Checkbox adds an invalid tone and explicit reset contracts atop Radix.** `checkbox/checkbox.web.tsx:32-69` manages an uncontrolled `defaultChecked="indeterminate"` case locally, preserves mixed state across native resets, and styles an invalid tone; `checkbox.contract.web.test.tsx:22-111` asserts reset-to-mixed, controlled toggling, and `FormData` contents.
4. **Direction bridges Radix context, not just `div[dir]`.** `direction/direction.web.tsx:14-36` supports controlled/uncontrolled `dir`, `onDirChange`, and `toggleDir`, feeding Radix's direction provider; `direction.test.tsx:134-159` proves Radix Tabs renders `dir="rtl"` from context.
5. **Contrast and SSR behavior are tested with stated limits.** `themeContrastSsr.test.tsx:31-97` asserts ≥4.5:1 ratios across nine accents × light/dark with `renderToString` stability (`:171-187`); `ThemeProvider.web.tsx:28-40` documents the nested-provider last-effect-wins limit in code.

## Synthex — gaps

1. **Dialog offers fewer close-button configurations.** Synthex renders one icon close (`dialog/dialog.web.tsx:104-112`) with `dismissible`/`hideClose` props. Correction: its `aria-label="Close dialog"` is a proper accessible name, equivalent to shadcn's `sr-only` text — not inferior. The real difference is breadth: shadcn adds a footer close button and separate Overlay/Portal exports (`new-york-v4/ui/dialog.tsx:22-48,94-119`). The `aria-modal="true"` hardcode (`dialog.web.tsx:79`) duplicates Radix handling.
2. **Button breadth lags.** No `xs`/`icon-*` sizes, no `data-variant`/`data-size` attributes, no `aria-invalid` hooks (`button.web.tsx:10-27`); shadcn's recipe covers all three (`button.tsx:9-38`).
3. **Checkbox callback drops the mixed value.** `checkbox.web.tsx:19,51-61` narrows `onCheckedChange` to boolean, hiding Radix's `"indeterminate"` transition from observers.
4. **Nested-theme portal sync is admitted best-effort.** Per `ThemeProvider.web.tsx:34-40`, simultaneous nested mounts or outer updates during an inner mount resolve root tokens wrongly for portals.

## shadcn 4.22.1 — strengths

1. **Three primitive bases per component.** Besides Radix, the repo ships Base UI and React Aria variants — Radix, Base UI, and Aria checkboxes at [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/bases/radix/ui/checkbox.tsx), [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/bases/base/ui/checkbox.tsx), and [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/bases/aria/ui/checkbox.tsx).
2. **Dialog ships more close configurations.** `showCloseButton` on content and footer plus separate overlay/portal exports ([pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/ui/dialog.tsx), lines 50-82, 94-119).
3. **Current form guidance uses RHF-free `Field` with explicit a11y wiring.** The guide threads `id`, `htmlFor`, `aria-invalid`, `data-invalid`, and `FieldError` per field (`react-hook-form.mdx:43-64,205-222`); `Field` imports no RHF context (verified by grep over all three base `field.tsx` files) and works with plain `<form>`.
4. **SSR convention is per-file.** Registry files carry `"use client"` (`new-york-v4/ui/form.tsx:1`, `checkbox.tsx:1`, `dialog.tsx:1`).

## shadcn — gaps (matched Radix recipes)

1. **Legacy `FormControl` always references the description id.** [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/ui/form.tsx) lines 107-123 build `aria-describedby` from the description id with or without error, so empty-description fields point at a nonexistent node — the case Synthex guards (`form.contract.web.test.tsx:104-124`). Legacy-scoped; the `Field` path avoids it by manual wiring.
2. **Legacy `useFormField` requires a RHF provider.** `form.tsx:45-51` calls `useFormContext()` unconditionally, throwing outside `FormProvider`. Legacy-scoped; `Field` has no such requirement.
3. **Button `asChild` has no disabled guard.** [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/new-york-v4/ui/button.tsx) lines 40-61 render `Slot.Root` directly, leaving disabled-styled link children keyboard-activatable.
4. **Thin Checkbox wrapper adds nothing of its own on reset or invalid tone.** Correction: it does include `aria-invalid` styling (`checkbox.tsx:16`) and inherits the Radix primitive's states — Radix 1.4.1 types admit `checked`/`defaultChecked` as `boolean | 'indeterminate'` (workspace's installed copy; shadcn's pinned Radix version unverified). The narrower gap: no wrapper-level reset contract, no invalid tone prop, no colocated test — each consumer verifies the primitive itself.
5. **No component interaction-contract tests observed locally.** The `new-york-v4/ui` surface ships no adjacent tests for keyboard, describedby, reset, or axe behavior, and `packages/tests` holds CLI/registry plumbing tests (`add`, `apply`, `init`, `registries`, `view`), not component contracts. This scores only observed local evidence; app-level or upstream primitive tests may exist elsewhere.

## Strongest defensible narrow Synthex win

**Automatic form-association wiring with contract tests.** Synthex's `FormControl` merges caller, child, and generated `aria-describedby` tokens, never emits dangling ids, honors opt-outs, and works with and without RHF — each test-pinned. Against the matched legacy recipe, shadcn's `FormControl` always references the description id and needs a RHF provider; against `Field`, correctness needs manual `id`/`htmlFor`/`aria-invalid` threading per field. For teams wanting association guarantees without per-field manual wiring, that is a concrete, narrowly scoped source advantage — not a release claim or screen-reader certification.

## Disconfirming evidence

- Pinned shadcn source with conditional mounted-id references plus caller-token merging in the legacy family erases the dangling-id half.
- Evidence Synthex's merging breaks under RHF re-renders (stale mount flags, duplicated tokens in field arrays) undermines the robustness half.
- A screen-reader pass showing Synthex's merged output announces worse than the `Field` manual pattern reverses the practical judgment. None was performed here.

## Acceptance tasks

1. Dynamic-field test: two `FormField`s sharing one `Form`, unmount one's description, assert surviving `aria-describedby` tokens resolve with no cross-field leakage.
2. Dialog dismiss test: `dismissible={false}` resists Escape/outside interaction; flipping to dismissible closes on Escape with focus returning to the trigger (extend `dialog-a11y.test.tsx:57-85`).
3. Publish gate: install a prerelease of the merged sources in a blank app and re-run `button.web`, `form.contract.web`, and `checkbox.contract.web` suites against packaged output.

## Uncertainty and evidence tiers

- Tier 1 (ran, prior turn): `npx vitest run src/button/button.web.test.tsx` in `packages/ui` — 4 passed. Other Synthex tests read, not executed.
- Tier 2 (read): all cited Synthex sources, pinned shadcn recipes, the RHF guide, base `field.tsx` heads, Radix 1.4.1 checkbox types (workspace copy), `packages/tests` listing.
- Tier 3 (unverified): npm state beyond version/date; shadcn's pinned Radix version and runtime indeterminate/reset behavior; tests outside inspected surfaces; Base UI vs Radix vs Aria runtime deltas; assistive-technology outcomes; shadcn theme contrast.
- shadcn CLI strengths (`add --diff`/`--dry-run`, skills-assisted merging, presets, registries/MCP) are out of this dimension and unscored.

## Commands and outcomes

- This revision: read-only inspection (RHF guide, base `field.tsx` files, Radix checkbox types, `packages/tests` and `packages/registry` listings). No changes, installs, builds, or test runs.
- Prior turn: `npx vitest run src/button/button.web.test.tsx` — 1 file, 4 tests passed.
