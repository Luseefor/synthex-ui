# Migration guide: Radix / TanStack breaking churn

This covers the controlled-prop churn across the 15 merged PRs. All web parts now expose shadcn-compatible `data-slot` attributes; native exposes the same value as `testID`.

Preview codemod (import rewrites only, manual prop fixes below still apply):

```bash
node scripts/migrate-shadcn.mjs --dry-run ./src
node scripts/migrate-shadcn.mjs ./src
```

| Area | Old | New |
| --- | --- | --- |
| `ToastAction` | `<ToastAction>Undo</ToastAction>` | `<ToastAction altText="Undo">Undo</ToastAction>` (required) |
| `MenubarMenu` | `<MenubarMenu open onOpenChange={...}>` | `<Menubar value={v} onValueChange={setV}><MenubarMenu value="file">` |
| `Select` trigger | custom `role="button"` trigger | Radix trigger, `role="combobox"`, `dir` on root |
| `Tabs` | `defaultValue` only, custom keyboard | `value` / `defaultValue` / `onValueChange` + `orientation` + `activationMode` |
| `DataTable` | `accessor` string only, custom sort/filter | `accessorKey` / `accessorFn`, `sorting` / `globalFilter` / `pagination` |
| `Dialog` / `Sheet` / `Drawer` | custom `visible` / style props | Radix `open` / `defaultOpen` / `onOpenChange` / `modal` |

## 1. ToastAction `altText` (required)

Old:

```tsx
import { ToastAction } from "synthex-ui/components";

export function UndoToast() {
  return <ToastAction>Undo</ToastAction>;
}
```

New:

```tsx
import { ToastAction } from "synthex-ui/components";

export function UndoToast() {
  return <ToastAction altText="Undo delete">Undo</ToastAction>;
}
```

Radix requires `altText` for screen readers. The viewport store already passes `toast.actionLabel` as `altText`; only direct `<ToastAction>` usage needs the fix.

## 2. MenubarMenu `open` -> Menubar `value`

Old:

```tsx
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent } from "synthex-ui/components";

export function AppMenu() {
  return (
    <Menubar>
      <MenubarMenu open>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>...</MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

New:

```tsx
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent } from "synthex-ui/components";

export function AppMenu() {
  return (
    <Menubar value="file">
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>...</MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

`MenubarMenu` only accepts Radix `value`. Control the open menu with `value` / `defaultValue` / `onValueChange` on `<Menubar>`. `MenubarSub` still accepts `open` / `defaultOpen` / `onOpenChange`.

## 3. Select trigger `role="combobox"`

Old:

```tsx
import { Select, SelectTrigger, SelectValue } from "synthex-ui/components";

export function FruitPicker() {
  return (
    <Select>
      <SelectTrigger role="button">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
    </Select>
  );
}
```

New:

```tsx
import { Select, SelectTrigger, SelectValue } from "synthex-ui/components";

export function FruitPicker() {
  return (
    <Select dir="ltr">
      <SelectTrigger>
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
    </Select>
  );
}
```

Do not override `role` on the trigger: Radix renders `role="combobox"` with `aria-expanded` / `aria-controls` automatically. Put `dir="ltr" | "rtl"` on `<Select>` instead of the trigger. Native `SelectTrigger` keeps the same children contract with `testID="select-trigger"`.

## 4. Tabs `value` + `activationMode`

Old:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "synthex-ui/components";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="account">...</TabsContent>
    </Tabs>
  );
}
```

New:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "synthex-ui/components";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="account" orientation="horizontal" activationMode="automatic">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="account">...</TabsContent>
    </Tabs>
  );
}
```

Use `value` + `onValueChange` for controlled tabs, `orientation="horizontal" | "vertical"` for arrow-key navigation, and `activationMode="automatic" | "manual"` (manual requires Space/Enter to select). `TabsContent` accepts `forceMount` for animation libraries.

## 5. DataTable TanStack props

Old:

```tsx
import { DataTable } from "synthex-ui/components";

const columns = [{ id: "name", header: "Name", accessor: "name" }];
const data = [{ name: "Ada" }];

export function PeopleTable() {
  return <DataTable columns={columns} data={data} />;
}
```

New:

```tsx
import { DataTable } from "synthex-ui/components";

type Row = { name: string; downloads: number };
const columns = [
  { id: "name", header: "Name", accessorKey: "name" as const },
  { id: "downloads", header: "Downloads", accessorKey: "downloads" as const, sortable: true },
];
const data: Row[] = [{ name: "synthex-ui", downloads: 8200 }];

export function PeopleTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      sorting={[{ id: "downloads", desc: true }]}
      globalFilter=""
      pagination={{ pageIndex: 0, pageSize: 10 }}
    />
  );
}
```

Prefer `accessorKey` / `accessorFn` over legacy `accessor`; `sortable` maps to TanStack `enableSorting`. Controlled state uses `sorting` / `defaultSorting` / `onSortingChange`, `globalFilter` / `defaultGlobalFilter` / `onGlobalFilterChange`, and `pagination` / `defaultPagination` / `onPaginationChange` (or legacy `pageIndex` / `pageSize`).

## 6. Dialog / Sheet / Drawer Radix props

Old:

```tsx
import { Dialog, DialogContent, DialogTrigger } from "synthex-ui/components";

export function Confirm() {
  return (
    <Dialog>
      <DialogTrigger>Delete</DialogTrigger>
      <DialogContent visible>Are you sure?</DialogContent>
    </Dialog>
  );
}
```

New:

```tsx
import { Dialog, DialogContent, DialogTrigger } from "synthex-ui/components";

export function Confirm() {
  return (
    <Dialog open onOpenChange={(next) => console.log(next)}>
      <DialogTrigger>Delete</DialogTrigger>
      <DialogContent>Are you sure?</DialogContent>
    </Dialog>
  );
}
```

`Dialog`, `Sheet`, `Drawer` and `AlertDialog` roots take `open` / `defaultOpen` / `onOpenChange` / `modal`. Content parts render in a Portal with `data-slot` and animate on `data-[state=open]`. Native uses the same `open` contract on an RN `Modal` with matching `testID`.
