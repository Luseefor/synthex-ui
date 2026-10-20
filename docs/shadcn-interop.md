# shadcn interop

`components.json` (repo root) exposes this repo to the shadcn CLI using the
standard shadcn schema (`$schema`, `style`, `tailwind`, `aliases`). The source
of truth stays `registry.json`, generated from `packages/ui/src`; the compat
guard runs standalone (no `package.json` script):

```sh
node scripts/shadcn-compat.mjs
```

It fails when a registry component lacks a `files[]`/`deps[]` entry, when a
listed file is missing on disk, or when `aliases.components`/`aliases.utils`
stop pointing at `packages/ui/src`. A missing `tailwind.config.js` is only a
warning: tokens are CSS-first (`packages/ui/src/styles.css`).

## Token aliases

`styles.css` defines `--sx-color-*` tokens and re-exports them under shadcn
names, so classes like `bg-background` or `text-muted-foreground` work as-is.
Import the surface once:

```sh
import "synthex-ui/styles.css";
```

| shadcn var | Synthex var |
|---|---|
| `--background` / `--foreground` | `--sx-color-background` / `--sx-color-foreground` |
| `--card` / `--card-foreground` | `--sx-color-surface` / `--sx-color-foreground` |
| `--popover` / `--popover-foreground` | `--sx-color-surface` / `--sx-color-foreground` |
| `--primary` / `--primary-foreground` | `--sx-color-primary` / `--sx-color-foreground-on-brand` |
| `--secondary` / `--secondary-foreground` | `--sx-color-secondary` / `--sx-color-foreground` |
| `--muted` / `--muted-foreground` | `--sx-color-surface-muted` / `--sx-color-foreground-muted` |
| `--accent` / `--accent-foreground` | `--sx-color-accent` / `--sx-color-foreground` |
| `--destructive` / `--destructive-foreground` | `--sx-color-destructive` / `--sx-color-foreground-on-brand` |
| `--border` / `--input` / `--ring` | `--sx-color-border` / `--sx-color-border` / `--sx-color-ring` |
| `--radius` | `--sx-radius-lg` |

## cva / defineVariants compat

Web implementations (e.g. `button.web.tsx`) call `cva` from
`class-variance-authority` with the same `variant`/`size` names shadcn uses, so
variant props pass through unchanged. The platform-agnostic definitions live in
`*.shared.ts` via `defineVariants` (`packages/ui/src/_shared/variants.ts`),
and `cn` from that same module is the same `clsx` + `tailwind-merge` helper as
shadcn's `@/lib/utils` (wired as `aliases.utils` in `components.json`).

## Slot

`asChild` works exactly like shadcn: components render
`Slot` from `@radix-ui/react-slot` (re-exported by
`packages/ui/src/_shared/slot.web.tsx`), so triggers and menu items keep
their `asChild` passthrough.

## Translation example (10 lines)

```tsx
import { Button } from "synthex-ui/components"; // was: @/components/ui/button
import { cn } from "@/lib/utils"; // -> packages/ui/src/_shared (components.json)
import { Slot } from "@radix-ui/react-slot"; // same primitive
// tokens: bg-background text-foreground border-input ring-ring
// --background etc. alias --sx-color-* (see styles.css)
const cx = cn("bg-primary text-primary-foreground", "hover:bg-primary/90");
export function Action({ asChild }: { asChild?: boolean }) {
  const Comp = asChild ? Slot : Button; // asChild passthrough, same API
  return <Comp variant="outline" size="sm" className={cx}>Save</Comp>;
}
```
