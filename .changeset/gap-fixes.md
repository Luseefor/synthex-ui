---
"synthex-ui": minor
---

Fix DropdownMenu/ContextMenu testIDs to mirror web data-slot values, standardize motion tokens (var(--sx-motion-fast)) and wire dir/RTL through Select/DropdownMenu/Menubar roots.
Select trigger keeps role combobox with aria-expanded/controls from Radix.
See docs/migration.md Select section and run node scripts/migrate-shadcn.mjs --dry-run <dir> to preview rewrites.
