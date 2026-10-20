---
"synthex-ui": minor
---

Migrate DataTable to TanStack Table with accessorKey/accessorFn columns, controlled sorting/globalFilter/pagination state and defaultSorting/defaultPagination/onSortingChange/onPaginationChange props.
Legacy accessor/searchValue/cell renderers keep working via toTanStackColumns mapping.
See docs/migration.md DataTable section and run node scripts/migrate-shadcn.mjs --dry-run <dir> to preview rewrites.
