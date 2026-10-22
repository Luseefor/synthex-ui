/**
 * Carousel (native) — testID == web data-slot parity (extra moat coverage).
 *
 * Web slots (carousel.web.tsx): carousel, carousel-content, carousel-track,
 * carousel-item, carousel-previous, carousel-next. Native renders all slides
 * in a paging ScrollView (no track); track has no native equivalent — gap
 * documented.
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
    ScrollView: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({
        scrollTo: () => {},
      }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-scrollview", rest, children);
    }),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: {
      OS: "ios",
      select: (options: any) => options.ios ?? options.default,
    },
    AccessibilityInfo: {
      isReduceMotionEnabled: () => Promise.resolve(false),
      addEventListener: () => ({ remove: () => {} }),
    },
  };
});

vi.mock("../button/button.native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  return {
    Button: ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement("mock-button", { ...props, ref }, children),
    ),
  };
});

import TestRenderer from "react-test-renderer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel.native";
import type { NativeCarouselApi } from "./carousel.types.native";

describe("Carousel (native testID parity)", () => {
  it("exposes testIDs matching web data-slot", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Slide one</CarouselItem>
            <CarouselItem>Slide two</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>,
      );
    });
    for (const testID of [
      "carousel",
      "carousel-content",
      "carousel-item",
      "carousel-previous",
      "carousel-next",
    ]) {
      expect(
        tree!.root.findAllByProps({ testID }).length,
        `expected testID "${testID}"`,
      ).toBeGreaterThan(0);
    }
  });

  it("keeps all slides mounted and advances selected snap via next/previous", () => {
    let api: NativeCarouselApi | undefined;
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Carousel setApi={(next) => { api = next; }}>
          <CarouselContent>
            <CarouselItem>Slide one</CarouselItem>
            <CarouselItem>Slide two</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>,
      );
    });
    expect(api?.selectedScrollSnap()).toBe(0);
    // Both slides stay mounted (paging, not single active view).
    expect(
      tree!.root.findAll(
        (node) =>
          (node.type as unknown as string) === "mock-view" &&
          (node.props as any).testID === "carousel-item",
      ).length,
    ).toBe(2);
    expect(tree!.root.findAllByProps({ children: "Slide one" }).length).toBeGreaterThan(0);
    expect(tree!.root.findAllByProps({ children: "Slide two" }).length).toBeGreaterThan(0);
    const next = tree!.root.findByProps({ testID: "carousel-next" });
    TestRenderer.act(() => {
      next.props.onPress({ defaultPrevented: false });
    });
    expect(api?.selectedScrollSnap()).toBe(1);
    expect(
      tree!.root.findAll(
        (node) =>
          (node.type as unknown as string) === "mock-view" &&
          (node.props as any).testID === "carousel-item",
      ).length,
    ).toBe(2);
    const previous = tree!.root.findByProps({ testID: "carousel-previous" });
    TestRenderer.act(() => {
      previous.props.onPress({ defaultPrevented: false });
    });
    expect(api?.selectedScrollSnap()).toBe(0);
  });
});
