# Synthex vs shadcn, why Synthex and the path to 100

Right now shadcn sits at 75/100 and synthex sits at 70/100. The gap is ecosystem and a11y base, not architecture. I think the architecture is already sound.

## Why people pick Synthex

1. **Web + native from one API.** Every component ships `.web.tsx` + `.native.tsx` + `.shared.ts` (`packages/ui/src/*`). shadcn is DOM-only. This is the #1 reason to choose Synthex. I would not trade this for web-only Radix wrappers.
2. **Workbench engine.** `@luseefor/synthex-core` (`layout/reducer.ts`, `engine.ts`, `validation.ts`, `command/registry.ts`, `state/store.ts`, `serialization/serialize.ts`) + `@luseefor/synthex-react-web` (`LayoutRenderer`, `SplitView`, `TabView`, `useSynthex`). shadcn has no equivalent. Dockable IDE-style UI out of the box.
3. **Publishable package, not copy-paste.** `synthex-ui` ships versioned `dist` with `web`/`native` exports (`packages/ui/package.json`). shadcn copies source into your repo (no versioning, no updates). Synthex upgrades via semver.
4. **Programmatic theme.** `SynthexTheme` + `createTheme` + `themeToCssVariables` (`packages/ui/src/_shared/theme/`), 9 accents, mode-aware `resolveAccentPreset`, `ThemeProvider` web (document-root sync with save/restore) + native (`flex:1`). shadcn theming is CSS-file-first; Synthex themes are computable/serializable (see `usePreviewTheme.ts` radius/accent/mode → `themeOverrides`).
5. **App blocks included.** `synthex.web.tsx` (AssistantChatPanel, KPIStatGrid, CadenceBarChart, DungeonHUDShell, etc.). shadcn sells this as blocks/templates.

## Path to 100 without losing the moat

| Gap | Fix (web+native safe) | Points |
|---|---|---|
| a11y base | Add WAI-ARIA roles/attrs + focus-trap + restore focus + `aria-modal`, roving tabindex for tabs/menubar, `aria-expanded/controls` on triggers. Keep custom primitives (Radix is web-only, would kill moat). Add `axe` tests. | +5 |
| CLI `add` | `synthex add <component> --cwd` copying from `packages/ui/src/*` + dep install, `synthex list`, `init --template`. Mirrors `shadcn add` DX without copy-paste lock-in. | +4 |
| RTL | Wire `DirectionProvider` (`direction.web/native`) into `ThemeProvider` docs + `dir` attr propagation + logical CSS (`ms/me`, `start/end`). Add test. | +3 |
| Styling | Document `cn` (clsx+twMerge) parity, add `eject`/preset support, chunk-size guard already in vite build. | +2 |
| Testing | Keep 119 tests green; add a11y + RTL + CLI `add` tests; native smoke via `react-test-renderer` where cheap. | +3 |
| Ecosystem | `llms.txt`, `docs/synthex-vs-shadcn.md` (this file), blocks gallery in `web-preview`, changesets. | +3 |

That takes us from 70 to about 90 to 95 with the moat intact. The last 5 is community adoption, out of scope for code.

## Changelog for RTL, CLI add and a11y

- RTL ships `DirectionProvider`. `direction.web` renders `div[dir]`, `direction.native` uses `View style={{ direction }}`, plus `useDirection` and `toggleDir`. `packages/ui/src/direction/direction.test.tsx` covers it, and the Theme preview page has a demo toggle.
- CLI `add` stays planned. `synthex add <component>` and `synthex list` are not built yet. The current CLI runs `init`, `layout:*`, `undo` and `redo`, `run`, `history` and `validate`. I documented it as roadmap in `docs/llms.txt`.
- For a11y, WAI-ARIA roles and attrs stay per component (see `components.test.tsx`). The `axe` sweep plus focus trap and return focus are still open.
