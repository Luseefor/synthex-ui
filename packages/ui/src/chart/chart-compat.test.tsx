import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
} from "./chart.web";
import type { ChartConfig } from "./chart.shared";

const config: ChartConfig = {
  visitors: { label: "Visitors", color: "#2563eb" },
  signups: { label: "Signups", color: "#0f766e" },
};

describe("chart shadcn compat (web, no recharts)", () => {
  it("applies config colors as CSS vars on ChartContainer", () => {
    const { container } = render(
      <ChartContainer config={config} data-testid="chart-root" id="traffic">
        <span>body</span>
      </ChartContainer>,
    );

    const root = screen.getByTestId("chart-root");
    expect(root).toHaveAttribute("data-chart", "traffic");
    expect(root.style.getPropertyValue("--color-visitors")).toBe("#2563eb");
    expect(root.style.getPropertyValue("--color-signups")).toBe("#0f766e");
    expect(container.textContent).toContain("body");
  });

  it("renders ChartStyle mapping config colors to CSS vars", () => {
    const { container } = render(<ChartStyle config={config} id="traffic" />);
    const style = container.querySelector("style[data-chart-style='traffic']");

    expect(style).not.toBeNull();
    expect(style?.textContent).toContain("--color-visitors: #2563eb");
    expect(style?.textContent).toContain("--color-signups: #0f766e");
  });

  it("renders tooltip indicators and resolves labelKey via config", () => {
    const { rerender } = render(
      <ChartTooltipContent
        config={config}
        indicator="dashed"
        items={[{ label: "Visitors", value: 24, color: "#2563eb" }]}
        labelKey="visitors"
      />,
    );

    expect(screen.getAllByText("Visitors").length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector('[data-indicator="dashed"]')).not.toBeNull();

    rerender(
      <ChartTooltipContent
        indicator="line"
        items={[{ label: "Signups", value: 12 }]}
        label="Tuesday"
      />,
    );

    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(document.querySelector('[data-indicator="line"]')).not.toBeNull();
  });

  it("renders ChartLegendContent for API parity", () => {
    render(
      <ChartLegendContent
        series={[
          {
            key: "visitors",
            label: "Visitors",
            data: [{ label: "Mon", value: 4 }],
          },
        ]}
      />,
    );

    expect(screen.getByText("Visitors")).toBeInTheDocument();
  });
});
