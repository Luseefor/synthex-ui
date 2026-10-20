/**
 * Calendar (native) — testID == web data-slot parity.
 *
 * Web slot (calendar.web.tsx): calendar. Native root mirrors it; prev/next
 * nav buttons expose calendar-prev/calendar-next (web uses aria-labels
 * "Previous month"/"Next month" on DayPicker nav).
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

vi.mock("../icons/index.native", () => ({
  ChevronLeftIcon: () => null,
  ChevronRightIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { Calendar } from "./calendar.native";

describe("Calendar (native testID parity)", () => {
  it("exposes testID calendar matching web data-slot", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Calendar defaultValue={new Date(2026, 2, 12)} />,
      );
    });
    expect(
      tree!.root.findByProps({ testID: "calendar" }),
    ).toBeTruthy();
    // Web data-slot is exactly "calendar".
    expect("calendar").toBe("calendar");
  });

  it("renders prev/next nav with accessible labels", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Calendar defaultValue={new Date(2026, 2, 12)} />,
      );
    });
    expect(
      tree!.root.findByProps({ testID: "calendar-prev" }).props
        .accessibilityLabel,
    ).toBe("Previous month");
    expect(
      tree!.root.findByProps({ testID: "calendar-next" }).props
        .accessibilityLabel,
    ).toBe("Next month");
  });

  it("advances month via next button onPress", () => {
    const onMonthChange: Date[] = [];
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Calendar
          defaultValue={new Date(2026, 2, 12)}
          onMonthChange={(d) => onMonthChange.push(d)}
        />,
      );
    });
    const next = tree!.root.findByProps({ testID: "calendar-next" });
    TestRenderer.act(() => {
      next.props.onPress();
    });
    expect(onMonthChange.length).toBe(1);
    expect(onMonthChange[0]!.getMonth()).toBe(3);
  });
});
