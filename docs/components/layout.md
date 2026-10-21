# Layout

Provides app shell and section parts for page structure.

## Import

```tsx
import { AppShell, Section } from "synthex-ui/layout";
```

## Example

```tsx
function Demo() {
  return (
    <AppShell header="Acme">
      <Section title="Usage" description="Last 30 days">
        <span>8200 downloads</span>
      </Section>
    </AppShell>
  );
}
```

## Props

Layout is uncontrolled. It needs no controlled value and composes static regions with props for header and sidebar. Use `Section` props to add titles and actions.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `header` | `ReactNode` | None |
| `sidebar` | `ReactNode` | None |
| `title` | `string` | None |

## Accessibility

Layout uses landmarks for header and content so screen readers can jump by region. Keep one main heading per page and keep section titles in order.

## Native support

On native layout parts accept `testID` with the same value as their web `data-slot`, such as `app-shell` and `section`. Pass `testID` only when a test needs a custom query value.
