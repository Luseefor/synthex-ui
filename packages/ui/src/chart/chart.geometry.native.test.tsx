/**
 * Chart bar geometry (native B1) — bars share category centers with
 * line/area points and axis labels.
 *
 * Before the fix, BarChart used `step = plotWidth / n` from origin 48 while
 * line/area/labels used `step = plotWidth / (n - 1)` from origin 40, so
 * labels drifted right of their bar groups (n=3: last label 184 units off).
 * These tests read mocked SVG host props (`mock-svg-rect` / `mock-svg-text`)
 * and fail against that layout.
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
import { AreaChart, BarChart, LineChart } from "./chart.native";
import type { ChartSeries } from "./chart.shared";

const THREE_CATS: readonly ChartSeries[] = [
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

const TWO_SERIES: readonly ChartSeries[] = [
  THREE_CATS[0]!,
  {
    key: "signups",
    label: "Signups",
    data: [
      { label: "Mon", value: 8 },
      { label: "Tue", value: 0 },
      { label: "Wed", value: 12 },
    ],
  },
];

function render(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function hostNodes(tree: TestRenderer.ReactTestRenderer, type: string) {
  return tree.root.findAll((node) => node.type === type);
}

function rectsOf(tree: TestRenderer.ReactTestRenderer) {
  return hostNodes(tree, "mock-svg-rect").map((node) => node.props as {
    x: number;
    y: number;
    width: number;
    height: number;
  });
}

function labelXsOf(tree: TestRenderer.ReactTestRenderer) {
  return hostNodes(tree, "mock-svg-text").map((node) => node.props.x as number);
}

function circlesOf(tree: TestRenderer.ReactTestRenderer) {
  return hostNodes(tree, "mock-svg-circle").map((node) => node.props as {
    cx: number;
    cy: number;
  });
}

describe("Chart bar geometry (native B1)", () => {
  it("centers single-series bar groups on axis labels (3 categories)", () => {
    const tree = render(<BarChart series={THREE_CATS} />);
    const rects = rectsOf(tree);
    const labelXs = labelXsOf(tree);
    expect(rects).toHaveLength(3);
    expect(labelXs).toHaveLength(3);

    const centers = rects.map((r) => r.x + r.width / 2).sort((a, b) => a - b);
    const sortedLabels = [...labelXs].sort((a, b) => a - b);
    for (let i = 0; i < sortedLabels.length; i++) {
      // Old layout put bar origins at 48/240/432 against labels at
      // 40/328/616 — pairwise this missed by up to 184 units.
      expect(Math.abs(centers[i]! - sortedLabels[i]!)).toBeLessThanOrEqual(1e-6);
    }
  });

  it("centers multi-series groups on labels without overlap (2 series x 3 categories)", () => {
    const tree = render(<BarChart series={TWO_SERIES} />);
    const rects = rectsOf(tree);
    const labelXs = [...labelXsOf(tree)].sort((a, b) => a - b);
    expect(rects).toHaveLength(6);
    expect(labelXs).toHaveLength(3);

    for (const labelX of labelXs) {
      const group = rects
        .filter((r) => Math.abs(r.x + r.width / 2 - labelX) < 200)
        .sort((a, b) => a.x - b.x);
      expect(group).toHaveLength(2);
      const mean =
        group.reduce((sum, r) => sum + r.x + r.width / 2, 0) / group.length;
      expect(Math.abs(mean - labelX)).toBeLessThanOrEqual(1e-6);
      // Bars within a group sit side by side, not stacked on each other.
      expect(group[1]!.x).toBeGreaterThanOrEqual(group[0]!.x + group[0]!.width);
    }
  });

  it("centers the bar on its label for a single category", () => {
    const single: readonly ChartSeries[] = [
      { key: "only", label: "Only", data: [{ label: "Mon", value: 10 }] },
    ];
    const tree = render(<BarChart series={single} />);
    const rects = rectsOf(tree);
    const labelXs = labelXsOf(tree);
    expect(rects).toHaveLength(1);
    expect(labelXs).toHaveLength(1);
    expect(
      Math.abs(rects[0]!.x + rects[0]!.width / 2 - labelXs[0]!),
    ).toBeLessThanOrEqual(1e-6);
  });

  it("renders no bars or labels for zero categories", () => {
    const empty: readonly ChartSeries[] = [];
    const emptyData: readonly ChartSeries[] = [
      { key: "none", label: "None", data: [] },
    ];
    for (const series of [empty, emptyData]) {
      const tree = render(<BarChart series={series} />);
      expect(rectsOf(tree)).toHaveLength(0);
      expect(labelXsOf(tree)).toHaveLength(0);
      expect(
        tree.root.findByProps({ testID: "chart-frame" }),
      ).toBeTruthy();
    }
  });

  it("emits finite coordinates and nonnegative heights (incl. zero values)", () => {
    const tree = render(<BarChart series={TWO_SERIES} />);
    for (const r of rectsOf(tree)) {
      for (const v of [r.x, r.y, r.width, r.height]) {
        expect(Number.isFinite(v)).toBe(true);
      }
      expect(r.width).toBeGreaterThan(0);
      expect(r.height).toBeGreaterThanOrEqual(0);
    }
    for (const x of labelXsOf(tree)) {
      expect(Number.isFinite(x)).toBe(true);
    }
    for (const c of circlesOf(render(<LineChart series={TWO_SERIES} />))) {
      expect(Number.isFinite(c.cx)).toBe(true);
      expect(Number.isFinite(c.cy)).toBe(true);
    }
  });

  it("renders all-zero series flat on the baseline without NaN", () => {
    const zeros: readonly ChartSeries[] = [
      {
        key: "a",
        label: "A",
        data: [
          { label: "Mon", value: 0 },
          { label: "Tue", value: 0 },
          { label: "Wed", value: 0 },
        ],
      },
      {
        key: "b",
        label: "B",
        data: [
          { label: "Mon", value: 0 },
          { label: "Tue", value: 0 },
          { label: "Wed", value: 0 },
        ],
      },
    ];
    // 0 / 0 previously produced NaN y for every point.
    const line = render(<LineChart series={zeros} />);
    expect(circlesOf(line).map((c) => c.cy)).toEqual([212, 212, 212, 212, 212, 212]);
    const polyline = hostNodes(line, "mock-svg-polyline");
    expect(polyline).toHaveLength(2);
    for (const node of polyline) {
      expect(node.props.points).toBe("40,212 328,212 616,212");
    }

    // Zero values must not acquire a visible minimum-height bar.
    const bars = render(<BarChart series={zeros} />);
    const rects = rectsOf(bars);
    expect(rects).toHaveLength(6);
    for (const r of rects) {
      expect(Number.isFinite(r.y)).toBe(true);
      expect(r.y).toBe(212);
      expect(r.height).toBe(0);
    }
    const labelXs = [...labelXsOf(bars)].sort((a, b) => a - b);
    expect(labelXs).toEqual([40, 328, 616]);
  });

  it("keeps dense charts centered without overlap (4 series x 12 categories)", () => {
    const labels = Array.from({ length: 12 }, (_, i) => `D${i + 1}`);
    const dense: readonly ChartSeries[] = Array.from({ length: 4 }, (_, s) => ({
      key: `s${s}`,
      label: `S${s}`,
      data: labels.map((label, i) => ({
        label,
        value: ((i * 7 + s * 3) % 29) + 1,
      })),
    }));
    const tree = render(<BarChart series={dense} />);
    const labelXs = [...labelXsOf(tree)].sort((a, b) => a - b);
    expect(labelXs).toHaveLength(12);

    // Slots are narrower than the inter-bar gap here, so bars tile their
    // group; a fixed minimum width would overflow slots and overlap.
    const byX = [...rectsOf(tree)].sort((a, b) => a.x - b.x);
    expect(byX).toHaveLength(48);
    for (let g = 0; g < 12; g++) {
      const group = byX.slice(g * 4, g * 4 + 4);
      const mean =
        group.reduce((sum, r) => sum + r.x + r.width / 2, 0) / group.length;
      expect(Math.abs(mean - labelXs[g]!)).toBeLessThanOrEqual(1e-6);
      for (const r of group) {
        expect(Number.isFinite(r.x)).toBe(true);
        expect(r.width).toBeGreaterThan(0);
      }
      for (let k = 1; k < group.length; k++) {
        expect(group[k]!.x).toBeGreaterThanOrEqual(
          group[k - 1]!.x + group[k - 1]!.width,
        );
      }
    }
  });

  it("preserves line/area geometry for the shared series", () => {
    // Pre-B1 line/area coordinates (height 240, max 24): x = 40/328/616,
    // y = 84/20/52. The fix must not move these.
    const line = render(<LineChart series={THREE_CATS} />);
    const polyline = hostNodes(line, "mock-svg-polyline");
    expect(polyline).toHaveLength(1);
    expect(polyline[0]!.props.points).toBe("40,84 328,20 616,52");
    expect(circlesOf(line).map((c) => c.cx)).toEqual([40, 328, 616]);
    expect(circlesOf(line).map((c) => c.cy)).toEqual([84, 20, 52]);

    const area = render(<AreaChart series={THREE_CATS} />);
    const path = hostNodes(area, "mock-svg-path");
    expect(path).toHaveLength(1);
    expect(path[0]!.props.d).toBe(
      "M 40 212 L 40 84 L 328 20 L 616 52 L 616 212 Z",
    );

    // Line points sit on the same centers the bar groups now use.
    const bars = render(<BarChart series={THREE_CATS} />);
    const labelXs = [...labelXsOf(bars)].sort((a, b) => a - b);
    expect(labelXs).toEqual([40, 328, 616]);
  });
});
