import {
  AreaChart,
  BarChart,
  Calendar,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  DataTable,
  LineChart,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function DataShowcase() {
  return (
    <ShowcaseSection
      title="Data"
      description="Charts, tables, and calendar surfaces are shown as fixed reference examples so the docs page reads like a catalog, not a playground."
      includes={["AreaChart", "BarChart", "LineChart", "DataTable", "Calendar", "ChartLegend"]}
    >
      <div className="preview-section-stack">
        <div className="preview-grid-2">
          <ChartContainer><ChartLegend series={[{ key: "stability", label: "Stability", data: [{ label: "Jan", value: 42 }, { label: "Feb", value: 56 }, { label: "Mar", value: 64 }, { label: "Apr", value: 71 }] }]} /><AreaChart ariaLabel="Stability" height={180} series={[{ key: "stability", label: "Stability", data: [{ label: "Jan", value: 42 }, { label: "Feb", value: 56 }, { label: "Mar", value: 64 }, { label: "Apr", value: 71 }] }]} /><ChartTooltip><ChartTooltipContent label="April" items={[{ label: "Stability", value: 71 }]} /></ChartTooltip></ChartContainer>
          <ChartContainer><BarChart ariaLabel="Downloads" height={180} series={[{ key: "downloads", label: "Downloads", data: [{ label: "Jan", value: 9 }, { label: "Feb", value: 14 }, { label: "Mar", value: 18 }] }]} /></ChartContainer>
        </div>
        <ChartContainer><LineChart ariaLabel="Adoption" height={180} series={[{ key: "adoption", label: "Adoption", data: [{ label: "Week 1", value: 12 }, { label: "Week 2", value: 19 }, { label: "Week 3", value: 28 }] }]} /></ChartContainer>
        <div className="preview-table-wrap">
          <DataTable columns={[{ id: "package", header: "Package", accessor: "package" }, { id: "surface", header: "Surface", accessor: "surface" }, { id: "status", header: "Status", accessor: "status", align: "right" }]} data={[{ package: "synthex-ui", surface: "Design system", status: "Stable" }, { package: "@luseefor/synthex-core", surface: "Engine", status: "Stable" }, { package: "@luseefor/synthex-react-web", surface: "Workbench", status: "Ready" }]} pageSize={3} searchKey="package" searchPlaceholder="Filter packages" />
        </div>
        <Calendar defaultValue={new Date(2026, 2, 12)} />
      </div>
    </ShowcaseSection>
  );
}
