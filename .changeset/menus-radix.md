---
"synthex-ui": minor
---

Migrate DropdownMenu, ContextMenu, Menubar and NavigationMenu to Radix with data-slot parts; MenubarMenu now takes only value (open state lives on Menubar value/defaultValue).
Sub, CheckboxItem and RadioItem follow Radix controlled checked/open contracts.
See docs/migration.md Menubar section and run node scripts/migrate-shadcn.mjs --dry-run <dir> before editing.
