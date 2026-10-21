# Theming

Source of truth: `packages/ui/src/_shared/theme/createTheme.ts`,
`packages/ui/src/_shared/tokens/*`, and `packages/ui/src/styles.css`.
Values below are copied from that code on this branch.

## Token reference

### Colors (light / dark)

| Token | Light | Dark |
|---|---|---|
| `--sx-color-background` | `#ffffff` | `#09090b` |
| `--sx-color-background-subtle` | `#f4f4f5` | `#18181b` |
| `--sx-color-surface` | `#ffffff` | `#18181b` |
| `--sx-color-surface-muted` | `#fafafa` | `#09090b` |
| `--sx-color-surface-raised` | `#f4f4f5` | `#27272a` |
| `--sx-color-foreground` | `#09090b` | `#fafafa` |
| `--sx-color-foreground-muted` | `#71717a` | `#a1a1aa` |
| `--sx-color-foreground-on-brand` | `#fafafa` | `#fafafa` |
| `--sx-color-border` | `#e4e4e7` | `#27272a` |
| `--sx-color-border-strong` | `#d4d4d8` | `#3f3f46` |
| `--sx-color-primary` | `#2563eb` | `#3b82f6` |
| `--sx-color-primary-hover` | `#1d4ed8` | `#60a5fa` |
| `--sx-color-primary-muted` | `#dbeafe` | `rgba(59, 130, 246, 0.15)` |
| `--sx-color-secondary` | `#f4f4f5` | `#27272a` |
| `--sx-color-secondary-hover` | `#e4e4e7` | `#3f3f46` |
| `--sx-color-secondary-muted` | `#fafafa` | `#18181b` |
| `--sx-color-destructive` | `#ef4444` | `#ef4444` |
| `--sx-color-destructive-hover` | `#dc2626` | `#f87171` |
| `--sx-color-destructive-muted` | `#fef2f2` | `rgba(239, 68, 68, 0.15)` |
| `--sx-color-accent` | `#f4f4f5` | `#27272a` |
| `--sx-color-accent-muted` | `#fafafa` | `#18181b` |
| `--sx-color-ring` | `#2563eb` | `#3b82f6` |

Shadcn-name aliases (`--background`, `--foreground`, `--primary`, `--ring`,
`--chart-1…`, …) and Tailwind v4 `@theme inline` mappings live in
`styles.css`; they forward to the `--sx-*` values so provider overrides and
dark mode propagate, including opacity modifiers.

### Radius, space, motion, type

From `tokens/radius.ts`, `tokens/space.ts`, `tokens/motion.ts`,
`tokens/typography.ts` (numbers; CSS appends `px`/`ms`/`rem`):

| Group | Tokens |
|---|---|
| Radius | `sm 6`, `md 8`, `lg 12`, `xl 16`, `pill 999` |
| Space | `xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 24`, `2xl 32` |
| Motion | `fast 140`, `normal 220`, `slow 340`; `easingStandard cubic-bezier(0.2, 0, 0, 1)`, `easingEmphasized cubic-bezier(0.16, 1, 0.3, 1)` |
| Type sizes (px) | `xs 12`, `sm 14`, `md 16`, `lg 18`, `xl 20`, `2xl 24`, `3xl 30`, `4xl 36` (CSS: `px / 16 rem`) |
| Type line-height | `tight 1.15`, `normal 1.4`, `relaxed 1.65` |
| Type weight | `medium 500`, `semibold 600`, `bold 700` |
| Type family | `sans "Inter Tight", "Segoe UI", sans-serif`; `mono "JetBrains Mono", "SFMono-Regular", monospace` |
| Shadows | `xs/sm/md/lg/inset` (`tokens/shadows.ts`; dark variants in `createTheme.ts` + `styles.css`) |

## Accent presets (9)

| Preset | Light swatch | Notes |
|---|---|---|
| `blue` | `#2563eb` | Base theme; empty override |
| `emerald` | `#10b981` | Hover `#059669`, muted `#ecfdf5`, ring `#10b981` |
| `violet` | `#8b5cf6` | Hover `#7c3aed`, muted `#f5f3ff` |
| `amber` | `#f59e0b` | Hover `#d97706`, muted `#fffbeb` |
| `rose` | `#f43f5e` | Hover `#e11d48`, muted `#fff1f2` |
| `steel` | `#93a8bf` | Dark override primary `#9db1c6` |
| `stone` | `#adb9a3` | Dark override primary `#b7c1ae` |
| `bronze` | `#bc9972` | Dark override primary `#caa27a` |
| `mulberry` | `#ab91b4` | Dark override primary `#b79bc0` |

`resolveAccentPreset(preset, mode)` returns the light theme for `blue`,
preset overrides otherwise, and mode-aware dark overrides for
steel/stone/bronze/mulberry. `createTheme(overrides, { mode, accentPreset })`
merges base, then accent, then your `DeepPartial<SynthexTheme>`.

```ts
import { createTheme } from "synthex-ui/theme";

const theme = createTheme({ colors: { primary: "#7c3aed" } }, { mode: "dark", accentPreset: "violet" });
```

## ThemeProvider

```tsx
<ThemeProvider mode="dark" accentPreset="emerald" theme={{ colors: { primary: "#8b5cf6" }, radius: { md: 8 } }}>
```

Serializes via `themeToCssVariables`. Web syncs to the document root with
save/restore; native applies a `flex: 1` host view.

## CSS-only theming

```css
[data-theme="custom"] {
  --sx-color-primary: #8b5cf6;
  --sx-color-background: #09090b;
  --sx-radius-md: 8px;
}
```

```html
<div data-theme="custom">...</div>
```
