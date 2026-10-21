# Pagination

Renders page links with previous and next controls.

## Import

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext>Next</PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## Props

Pagination is uncontrolled by default. It needs no controlled value for static links, and accepts link props for active state. Drive the active page from router state when pages change.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `isActive` | `boolean` | `false` |

## Accessibility

Pagination uses a `nav` landmark with an aria label. The active page uses `aria-current="page"` and prev plus next keep text labels. Keep page counts stable while loading.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `pagination-link` and `pagination-next`. Pass `testID` only when a test needs a custom query value.
