/**
 * Carousel (native) — testID == web data-slot parity (extra moat coverage).
 *
 * Web slots (carousel.web.tsx): carousel, carousel-content, carousel-track,
 * carousel-item, carousel-previous, carousel-next. Native renders the active
 * slide only (no track); track has no native equivalent — gap documented.
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

  it("advances via next/previous onPress", () => {
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
    // Initially first slide.
    expect(
      tree!.root.findAllByProps({ children: "Slide one" }).length,
    ).toBeGreaterThan(0);
    const next = tree!.root.findByProps({ testID: "carousel-next" });
    TestRenderer.act(() => {
      next.props.onPress();
    });
    expect(
      tree!.root.findAllByProps({ children: "Slide two" }).length,
    ).toBeGreaterThan(0);
  });
});
