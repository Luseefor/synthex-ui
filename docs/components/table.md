# Table

Renders rows and cells with header semantics.

## Import

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell>Ada</TableCell></TableRow></TableBody>
    </Table>
  );
}
```

## Props

Table is uncontrolled. It needs no controlled value and composes static row parts. Use `TableCaption` for a visible summary of the data.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `children` | `ReactNode` | Required |

## Accessibility

Table uses native table semantics with `th` scope and header association. Keyboard users move through cells with normal focus order. Keep headers concise and unique.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `table-row` and `table-cell`. Pass `testID` only when a test needs a custom query value.
