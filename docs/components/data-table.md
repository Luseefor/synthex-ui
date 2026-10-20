# Data table

Renders a controlled table with sorting, filtering and pagination helpers.

## Import

```tsx
import { DataTable } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  const columns = [{ id: "name", header: "Name" }];
  return (
    <DataTable
      columns={columns}
      data={[{ name: "Ada" }]}
    />
  );
}
```

## Props

Data table supports controlled and uncontrolled state for sorting, filter and pagination. Pass `sorting` with `onSortingChange`, or `defaultSorting` for local state. The same pattern applies to pagination and global filter props.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `columns` | `DataTableColumn[]` | Required |
| `data` | `Record[]` | Required |
| `sorting` | `DataTableSorting[]` | None |
| `defaultSorting` | `DataTableSorting[]` | None |

## Accessibility

The table uses native table semantics with `th` scope and sort state exposed through `aria-sort`. Keyboard users sort by activating header buttons, page with normal focus order, and filter through a labeled input. Keep headers concise and unique.

## Native support

On native the table accepts `testID` with the same value as its web `data-slot`, such as `data-table`. Pass `testID` only when a test needs a custom query value.
