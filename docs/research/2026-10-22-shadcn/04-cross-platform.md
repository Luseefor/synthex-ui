# Cross-platform strategy: one team shipping React web + Expo iOS/Android

Review date: 2026-10-22. Synthex: `7babe5ef`, branch `ace/competitive-critique` (merged through PR #131). shadcn (read-only): `25af02b1`, package `shadcn` 4.22.1. Ratings are judgment for the stated segment, not measurements or universal claims.

## Segment framing

The buyer is one team shipping a React web app and an Expo iOS/Android app from shared design language. shadcn core is web-scoped by design; scoring it low rates segment fit, not quality. Its lack of React Native output is N/A-as-a-bug but counts against team fitness, because the team must source and maintain a second native stack itself.

React Native Reusables is a community native project in the shadcn visual idiom, not part of core or its CLI. Pairing shadcn web with Reusables native is a two-project integration the team owns (version skew, prop drift, separate theming).

## Rubric (weights sum 100%) and scores

| # | Criterion (for a web + Expo team) | Wt | Synthex /10 | shadcn core /10 |
|---|---|---|---|---|
| 1 | Native component coverage breadth: share of the web catalogue with a maintained native implementation | 25% | 8 | 2 |
| 2 | API portability discipline: shared prop contracts, explicit inert-prop inventory, ref forwarding that survives RN version skew | 20% | 7 | 1 |
| 3 | Platform source ownership: conditional exports, owned-copy workflow, CLI support, Metro bundle evidence | 20% | 7 | 2 |
| 4 | Shared theme contracts: tokens, direction/RTL, motion/reduced-motion across both hosts | 15% | 6 | 2 |
| 5 | Native gesture/overlay/focus/assistive-tech evidence on device | 20% | 3 | 1 |

Weighted totals to one decimal: **Synthex 6.3** (2.0 + 1.4 + 1.4 + 0.9 + 0.6); **shadcn core 1.6** (0.5 + 0.2 + 0.4 + 0.3 + 0.2). shadcn's 1.6 reflects that criteria 1–5 test for surface core deliberately does not ship; its web quality is not what is scored.

## Source-main capabilities vs release readiness

Everything credited to Synthex is merged-source capability in this checkout. Release readiness is weaker: npm `synthex-ui` and `@luseefor/synthex-cli` are at 1.1.0, last modified 2026-03-06, predating the native-overlay/slider/resizable/carousel/sheet/remaining-overlays stages (PRs #125–#131). None of the current merged native work may be assumed published; evaluators must build from source or pack tarballs, as the `native:check` fixture does.

## Synthex strengths (source evidence)

1. **Near-catalogue native breadth with documented deltas.** Every family ships a `.native` implementation behind a `react-native`-first export condition (`packages/ui/package.json:11-19`, repeated per subpath); only `synthex-ui/blocks` is web-only (`:74-78`). The matrix records each family's mechanism and limits, e.g. single-month calendar grid (`docs/native-capabilities.md:84`) and `react-native-svg` chart with null `ChartStyle` (`:87,149`).
2. **One shared anchored-overlay layer.** Eight overlay families resolve position through a single pure function with RTL-aware flip and clamp (`packages/ui/src/_shared/positioning.native.ts:64-80`), hosted in a transparent-`Modal` surface with outside-press and system-dismiss routing (`packages/ui/src/_shared/overlay.native.tsx:29-38,68-72`). Pure-geometry plus mocked-host contract tests (43 native test files) cover math and controllers.
3. **Portability contracts: refs, direction, inert props.** Native components annotate `React.ElementRef<typeof Host>` so refs survive the RN 0.81-to-0.88 strict-API change (`packages/ui/src/button/button.native.tsx:23-24`; `docs/native-capabilities.md:49-58`). Direction crosses the owned-copy boundary via an explicit context module (`packages/ui/src/_shared/direction-context.native.ts`), and inert props are inventoried with `void` markers, not silently dropped (`docs/native-capabilities.md:135-145`; e.g. `packages/ui/src/sheet/sheet.native.tsx:31-32`).
4. **Real interaction math on gesture families.** Slider tap/drag with fixed thumb identity and no-cross clamp, resizable pair-conserved drag, carousel pager with controlled index semantics, and OTP focus/paste/Backspace handling are implemented in source with mocked contract tests — a larger behavior surface than stub wrappers.

## Synthex gaps (source evidence)

1. **No device evidence anywhere.** The audit's own tiers — mocked render, mocked overlay hosts, pure geometry, export graph, Metro export — are all explicitly "not device validation," and the device checklist is entirely pending on iOS and Android (`docs/native-capabilities.md:19-46,190-211`; `docs/native-device-validation.md`). A Metro bundle export proves module resolution, not behavior.
2. **Desktop interaction models are mostly absent natively.** No roving keyboard navigation, no focus containment/restoration, no nested-`Modal` verification; `modal={false}` still presents a modal; hover becomes tap-toggle with delay props inert (`packages/ui/src/tooltip/tooltip.native.tsx:~30`); context-menu maps right-click to long-press anchored to the trigger frame, not pointer position (`packages/ui/src/context-menu/context-menu.native.tsx:62,87-88`) — reasonable adaptations a shared codebase must still code around.
3. **Placeholders and hardcoded seams remain.** `useMobile()` returns `false` unconditionally (`packages/ui/src/hooks/useMobile.native.ts:1-3`); `Spinner` is a static ring; `NativeSelect` is a text field, not a picker; `Grid` is row-wrap percent widths with no breakpoints; `data-table` mounts all rows with no virtualization (`docs/native-capabilities.md:66-128`). Theme switching is a `mode` prop with no CSS-variable equivalent, and some warning tones hardcode hex instead of tokens.
4. **Release and ownership friction.** The published 1.1.0 predates all native work; owned-copy consumers must also copy `direction` and theme sources or contexts silently fork (`docs/native-capabilities.md:60-64`). Until a release ships, adoption means tracking main closely.

## shadcn core strengths (pinned source, for this segment)

1. **Registry and multi-source install model.** Namespaced registries let a team compose components from more than one upstream — the closest core-native mechanism to the two-stack problem, by convention rather than by product.
2. **Safe-change workflow: `add --diff` / `--dry-run` / `--view`.** The CLI previews file operations before writing (`packages/shadcn/src/commands/add.ts`); a deprecated `diff` command forwards to the new flags (`packages/shadcn/src/commands/diff.ts`). For a team hand-maintaining a native mirror, preview-before-write keeps web updates reviewable. Pinned: [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/commands/add.ts), [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/packages/shadcn/src/commands/diff.ts).
3. **Agent-assisted maintenance surface.** The shipped skill codifies search-first composition, variant-before-custom-style, semantic tokens, and per-component rules (`skills/shadcn/SKILL.md`); the CLI exposes MCP setup (`packages/shadcn/src/commands/mcp.ts`). Pinned: [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/skills/shadcn/SKILL.md).
4. **Web component depth that sets the parity bar.** Radix-based primitives with portal, focus, and keyboard semantics (e.g. `apps/v4/registry/bases/radix/ui/tooltip.tsx`) define what the native side must live up to. Pinned: [pinned source](https://github.com/shadcn-ui/ui/blob/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/apps/v4/registry/bases/radix/ui/tooltip.tsx).

## shadcn core limits for this segment (not defects)

1. **No native target in core.** No `react-native` export condition, native implementation, or Expo fixture exists in the pinned tree; the only `react-native`/`expo` hits are incidental strings in tooling files. Confirmed by inspecting export/registry structure, not search alone.
2. **No shared theme contract across hosts.** CSS variables, `dark:` class strategy, and animation tokens have no RN-side counterpart in core; any native theme bridge is team-built.
3. **No mobile gesture/overlay/focus story.** Portals, hover, and keyboard patterns do not transfer; the team re-derives dismissal, anchoring, and focus per component, with Reusables as an optional but separate, independently-versioned answer.

## Strongest defensible narrow Synthex win

For a team that must ship the *same named component API* on web and Expo with one theme and one set of prop names, Synthex offers the only single-package path: one dependency, both hosts behind conditional exports, shared tokens/direction/controllers, owned copies via the CLI — versus shadcn core plus a separately-owned native mirror. The win is narrow (breadth + ownership mechanics, excluding device-proven behavior) but structural: the overlay layer and inert-prop inventory convert "does it work natively?" from open research per component into a documented delta per component.

**Disconfirming evidence that would overturn it:** a device pass showing systematic overlay mis-anchoring after rotation, broken Android-back dismissal, or assistive-tech regressions across the overlay families reduces the breadth claim to scaffolding; if the 1.1.0 line persists for months while main moves on, the ownership advantage stays theoretical. A published Reusables-plus-shadcn pairing with a verified shared-theme bridge would also neutralize the single-package argument.

## Three small acceptance tasks (bounded, device-group compliant where noted)

1. **Metro resolution gate:** pack current source, install in a scratch Expo app, import every native subpath, export iOS + Android bundles — rerun `bun run native:check` at this commit, record pass/fail per subpath. (Resolution tier only.)
2. **Inert-prop audit:** for each family in the `void` inventory, render native with the prop set and un-set and confirm identical output — proving inertness, not accidental effect. Test tier only.
3. **Device spot-check on the overlay layer (requires device group):** on one iOS and one Android device, open each anchored overlay near screen edges, rotate, dismiss via backdrop and system back; record anchoring, flip/clamp, and announcement outcome per family. Until this runs, no claim beyond "native implementations with documented mobile adaptations" is supportable.

## Uncertainty and evidence tiers

Mocked-host tests establish controller logic, not layout, gestures, `Modal` physics, keyboard behavior, or assistive-tree output; Metro export establishes bundling, not behavior (`docs/native-capabilities.md:19-46`). No pixel, animation-timing, or screen-reader validation is claimed — device groups were off. shadcn reads rest on pinned source plus a bounded `react-native`/`expo` content search; absence of a native target was confirmed by inspecting export/registry structure. The Reusables note rests on a docs landing-page fetch plus no Reusables reference in the pinned core tree; its coverage was not audited and is out of scope.
