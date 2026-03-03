import {
  AreaChart,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  DataTable,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Progress,
  Skeleton,
} from "synthex-ui/components";

export function DataShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data and feedback</CardTitle>
        <CardDescription>Charts, tables, empty states, and loading primitives that stay inside the library surface.</CardDescription>
      </CardHeader>
      <CardContent className="preview-section-stack">
        <ChartContainer><AreaChart ariaLabel="Stability" height={200} series={[{ key: "stability", label: "Stability", data: [{ label: "Jan", value: 42 }, { label: "Feb", value: 56 }, { label: "Mar", value: 64 }, { label: "Apr", value: 71 }] }]} /></ChartContainer>
        <DataTable columns={[{ id: "package", header: "Package", accessor: "package" }, { id: "surface", header: "Surface", accessor: "surface" }, { id: "status", header: "Status", accessor: "status", align: "right" }]} data={[{ package: "synthex-ui", surface: "Design system", status: "Stable" }, { package: "@luseefor/synthex-core", surface: "Engine", status: "Stable" }, { package: "@luseefor/synthex-react-web", surface: "Workbench", status: "Ready" }]} pageSize={3} searchKey="package" searchPlaceholder="Filter packages" />
        <div className="preview-grid-2">
          <div className="preview-section-stack"><Progress value={72} /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-[78%]" /></div>
          <Empty><EmptyHeader><EmptyTitle>No release snapshots</EmptyTitle><EmptyDescription>Generate a preview build to inspect the current package output.</EmptyDescription></EmptyHeader></Empty>
        </div>
      </CardContent>
    </Card>
  );
}
