# Breadcrumb

Renders a trail of navigation links with separators.

## Import

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

## Props

Breadcrumb is uncontrolled. It needs no controlled value and renders plain navigation links. Use `current` on the active link for parity with `BreadcrumbPage`.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `current` | `boolean` | `false` |

## Accessibility

Breadcrumb wraps links in a `nav` with an aria label. Screen readers hear the trail order, and the current page uses `aria-current="page"`. Keep labels short and unique.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `breadcrumb-list` and `breadcrumb-link`. Pass `testID` only when a test needs a custom query value.
