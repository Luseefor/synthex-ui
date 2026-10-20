---
"synthex-ui": minor
---

Migrate Dialog, Sheet, Drawer, AlertDialog, Popover and Tooltip to shadcn-compatible Radix primitives with data-slot parts and controlled open/defaultOpen/onOpenChange/modal props.
Native keeps the same open contract on RN Modal equivalents with matching testIDs.
See docs/migration.md and run node scripts/migrate-shadcn.mjs --dry-run <dir> to preview import rewrites.
