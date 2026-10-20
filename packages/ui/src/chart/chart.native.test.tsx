/**
 * Chart (native) — testID == web data-slot parity.
 *
 * Web slots (chart.web.tsx): chart, chart-legend, chart-legend-content,
 * chart-tooltip-wrapper, chart-tooltip-content, chart-frame.
 * Native mirrors each; Line/Area/Bar frames use chart-frame with
 * accessibilityLabel (web ChartFrame role=img).
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const mock = (name: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(`mock-${name}`, { ...props, ref }, children),
    );
  return {
    Pressable: mock("pressable"),
    Text: mock("text"),
    View: mock("view"),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: {
      OS: "ios",
      select: (options: any) => options.ios ?? options.default,
    },
  };
});

vi.mock("react-native-svg", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const mockSvg = (name: string) =>
    ({ children, ...props }: any) =>
      ReactMock.createElement(`mock-svg-${name}`, props, children);
  return {
    default: mockSvg("svg"),
    Circle: mockSvg("circle"),
    Line: mockSvg("line"),
    Path: mockSvg("path"),
    Polyline: mockSvg("polyline"),
    Rect: mockSvg("rect"),
    Text: mockSvg("text"),
  };
});

import TestRenderer from "react-test-renderer";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
} from "./chart.native";

const series = [
  {
    key: "visitors",
    label: "Visitors",
    data: [
      { label: "Mon", value: 16 },
      { label: "Tue", value: 24 },
      { label: "Wed", value: 20 },
    ],
  },
];

describe("Chart (native testID parity)", () => {
  it("exposes container/legend/tooltip testIDs matching web data-slot", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ChartContainer>
          <ChartLegend series={series} />
          <ChartLegendContent series={series} />
          <ChartTooltip>
            <ChartTooltipContent
              items={[{ label: "Visitors", value: 24 }]}
              label="Tuesday"
            />
          </ChartTooltip>
        </ChartContainer>,
      );
    });
    const expected = [
      "chart",
      "chart-legend",
      "chart-legend-content",
      "chart-tooltip-wrapper",
      "chart-tooltip-content",
    ];
    for (const testID of expected) {
      expect(
        tree!.root.findAllByProps({ testID }).length,
        `expected testID "${testID}" (web data-slot)`,
      ).toBeGreaterThan(0);
    }
  });

  it("renders line/area/bar frames with chart-frame testID", () => {
    for (const Chart of [LineChart, AreaChart, BarChart]) {
      let tree: TestRenderer.ReactTestRenderer | undefined;
      TestRenderer.act(() => {
        tree = TestRenderer.create(
          <Chart ariaLabel="Traffic chart" series={series} />,
        );
      });
      const frame = tree!.root.findByProps({ testID: "chart-frame" });
      expect(frame.props.accessibilityLabel).toBe("Traffic chart");
    }
  });
});
