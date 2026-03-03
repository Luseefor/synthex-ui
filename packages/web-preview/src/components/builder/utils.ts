import { GRID } from "./catalog";
import type { BuilderNode } from "./types";

export function snap(v: number) {
  return Math.round(v / GRID) * GRID;
}

export function toStringList(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) ? value.map((item) => String(item)) : fallback;
}

export function toTableData(n: BuilderNode) {
  const columns = toStringList(n.props.columns, ["Column"]);
  const rows = Array.isArray(n.props.rows) ? n.props.rows : [];

  return {
    columns,
    data: rows.map((row, rowIndex) => {
      const cells = Array.isArray(row) ? row : [];
      return columns.reduce<Record<string, string>>((acc, column, columnIndex) => {
        acc[column] = String(cells[columnIndex] ?? `Row ${rowIndex + 1}`);
        return acc;
      }, {});
    }),
  };
}
