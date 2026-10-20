---
"synthex-ui": minor
---

Migrate Toast/Sonner to Radix Toast plus sonner Toaster (ToastAction now requires altText), and Calendar, Carousel and Chart to shadcn-compatible controlled props with data-slot parts.
Native keeps the same actionLabel/value contracts with Button/RN equivalents.
See docs/migration.md ToastAction section and run node scripts/migrate-shadcn.mjs --dry-run <dir> to preview rewrites.
