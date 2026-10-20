import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme";
import { DataTable } from "./data-table.web";

type Row = Record<string, unknown> & { package: string; status: string; downloads: number };

const rows: Row[] = [
  { package: "synthex-ui", status: "Stable", downloads: 8200 },
  { package: "@luseefor/synthex-core", status: "Stable", downloads: 6400 },
  { package: "@luseefor/synthex-react-web", status: "Preview", downloads: 2300 },
];

function renderTable(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("DataTable (tanstack)", () => {
  it("keeps data-slot and filters with legacy searchKey + accessor", () => {
    const { container } = renderTable(
      <DataTable
        columns={[
          { id: "package", header: "Package", accessor: "package" },
          { id: "status", header: "Status", accessor: "status" },
        ]}
        data={rows}
        searchKey="package"
      />,
    );

    expect(container.querySelector('[data-slot="data-table"]')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter table rows"), { target: { value: "core" } });
    expect(screen.getByText("@luseefor/synthex-core")).toBeInTheDocument();
    expect(screen.queryByText("synthex-ui")).not.toBeInTheDocument();
  });

  it("sorts with accessorKey columns through the TanStack row model", () => {
    renderTable(
      <DataTable
        columns={[
          { id: "package", header: "Package", accessorKey: "package" },
          { id: "downloads", header: "Downloads", accessorKey: "downloads", sortable: true },
        ]}
        data={rows}
        pageSize={10}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Downloads/ }));
    let bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("@luseefor/synthex-react-web");

    fireEvent.click(screen.getByRole("button", { name: /Downloads/ }));
    bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("synthex-ui");
  });

  it("filters globally across accessorFn columns when no searchKey is set", () => {
    renderTable(
      <DataTable
        columns={[
          { id: "package", header: "Package", accessorKey: "package" },
          {
            id: "upper-status",
            header: "Status",
            accessorFn: (row: Row) => row.status.toUpperCase(),
          },
        ]}
        data={rows}
        pageSize={10}
      />,
    );

    fireEvent.change(screen.getByLabelText("Filter table rows"), { target: { value: "preview" } });
    expect(screen.getByText("@luseefor/synthex-react-web")).toBeInTheDocument();
    expect(screen.queryByText("synthex-ui")).not.toBeInTheDocument();
  });

  it("supports controlled sorting and globalFilter", () => {
    const onSortingChange = vi.fn();
    const onGlobalFilterChange = vi.fn();

    const { rerender } = render(
      <ThemeProvider>
        <DataTable
          columns={[
            { id: "package", header: "Package", accessorKey: "package" },
            { id: "downloads", header: "Downloads", accessorKey: "downloads", sortable: true },
          ]}
          data={rows}
          onGlobalFilterChange={onGlobalFilterChange}
          onSortingChange={onSortingChange}
          pageSize={10}
        />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Downloads/ }));
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "downloads", desc: false }]);

    fireEvent.change(screen.getByLabelText("Filter table rows"), { target: { value: "stable" } });
    expect(onGlobalFilterChange).toHaveBeenCalledWith("stable");

    rerender(
      <ThemeProvider>
        <DataTable
          columns={[
            { id: "package", header: "Package", accessorKey: "package" },
            { id: "downloads", header: "Downloads", accessorKey: "downloads", sortable: true },
          ]}
          data={rows}
          globalFilter="core"
          pageSize={10}
          sorting={[{ id: "downloads", desc: true }]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("@luseefor/synthex-core")).toBeInTheDocument();
    expect(screen.queryByText("synthex-ui")).not.toBeInTheDocument();
    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("@luseefor/synthex-core");
  });

  it("paginates with legacy pageSize and controlled pagination", () => {
    const onPaginationChange = vi.fn();
    renderTable(
      <DataTable
        columns={[{ id: "package", header: "Package", accessorKey: "package" }]}
        data={rows}
        onPaginationChange={onPaginationChange}
        pageSize={2}
      />,
    );

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("synthex-ui")).toBeInTheDocument();
    expect(screen.queryByText("@luseefor/synthex-react-web")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("@luseefor/synthex-react-web")).toBeInTheDocument();
    expect(onPaginationChange).toHaveBeenCalledWith(
      expect.objectContaining({ pageIndex: 1, pageSize: 2 }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });
});
