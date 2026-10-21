# Sidebar

Renders an app side rail with menu and trigger parts.

## Import

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <SidebarProvider>
      <SidebarTrigger>Menu</SidebarTrigger>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton>Home</SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
```

## Props

Sidebar supports controlled and uncontrolled use. Pass `open` with `onOpenChange` on the provider for controlled state, or `defaultOpen` for uncontrolled state.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `open` | `boolean` | None |
| `defaultOpen` | `boolean` | `true` |
| `onOpenChange` | `(open: boolean) => void` | None |

## Accessibility

Sidebar keeps navigation in a landmark with labeled menu buttons. The trigger exposes `aria-expanded` and keyboard focus stays visible. Keep menu text short and in a stable order.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `sidebar` and `sidebar-trigger`. Pass `testID` only when a test needs a custom query value.
