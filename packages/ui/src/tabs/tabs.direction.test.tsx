/**
 * Tabs keyboard + direction contracts (web).
 *
 * Strict focus assertions (toHaveFocus); no fallback pointer clicks for
 * keyboard moves. Radix roving focus defers the focus change with
 * setTimeout, so positive moves await it via waitFor; negative assertions
 * (key must not move focus) assert synchronously.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { DirectionProvider } from "../direction/direction.web";
import { Tabs, TabsList, TabsTrigger } from "./tabs.web";

function renderHorizontalTabs({
  dir = "ltr",
  ...tabsProps
}: {
  readonly dir?: "ltr" | "rtl";
} & Omit<React.ComponentProps<typeof Tabs>, "dir"> = {}) {
  render(
    <DirectionProvider dir={dir}>
      <Tabs defaultValue="one" {...tabsProps}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
      </Tabs>
    </DirectionProvider>,
  );

  return {
    one: screen.getByRole("tab", { name: "One" }),
    two: screen.getByRole("tab", { name: "Two" }),
    three: screen.getByRole("tab", { name: "Three" }),
  };
}

describe("Tabs keyboard + direction (web)", () => {
  it("ltr horizontal: ArrowRight moves next, ArrowLeft moves prev", async () => {
    const { one, three, two } = renderHorizontalTabs({ dir: "ltr" });

    one.focus();
    expect(one).toHaveFocus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    await waitFor(() => expect(two).toHaveFocus());

    fireEvent.keyDown(two, { key: "ArrowRight" });
    await waitFor(() => expect(three).toHaveFocus());

    fireEvent.keyDown(three, { key: "ArrowLeft" });
    await waitFor(() => expect(two).toHaveFocus());
  });

  it("ltr horizontal: Home/End jump and arrows loop", async () => {
    const { one, three, two } = renderHorizontalTabs({ dir: "ltr" });

    one.focus();
    fireEvent.keyDown(one, { key: "End" });
    await waitFor(() => expect(three).toHaveFocus());

    fireEvent.keyDown(three, { key: "Home" });
    await waitFor(() => expect(one).toHaveFocus());

    // loop: ArrowLeft on first wraps to last
    fireEvent.keyDown(one, { key: "ArrowLeft" });
    await waitFor(() => expect(three).toHaveFocus());

    expect(two).toBeInTheDocument();
  });

  it("rtl horizontal under DirectionProvider: arrows swap (ArrowLeft next, ArrowRight prev)", async () => {
    const { one, three, two } = renderHorizontalTabs({ dir: "rtl" });

    one.focus();
    fireEvent.keyDown(one, { key: "ArrowLeft" });
    await waitFor(() => expect(two).toHaveFocus());

    fireEvent.keyDown(two, { key: "ArrowLeft" });
    await waitFor(() => expect(three).toHaveFocus());

    // ArrowRight moves back (prev in rtl)
    fireEvent.keyDown(three, { key: "ArrowRight" });
    await waitFor(() => expect(two).toHaveFocus());

    // wrap: ArrowRight on first goes to last
    fireEvent.keyDown(one, { key: "ArrowRight" });
    await waitFor(() => expect(three).toHaveFocus());
  });

  it("vertical orientation: ArrowDown/Up move, ArrowLeft/Right ignored", async () => {
    render(
      <DirectionProvider dir="rtl">
        <Tabs defaultValue="one" orientation="vertical">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    );
    const one = screen.getByRole("tab", { name: "One" });
    const two = screen.getByRole("tab", { name: "Two" });

    one.focus();
    fireEvent.keyDown(one, { key: "ArrowDown" });
    await waitFor(() => expect(two).toHaveFocus());

    fireEvent.keyDown(two, { key: "ArrowUp" });
    await waitFor(() => expect(one).toHaveFocus());

    // horizontal keys are ignored in vertical orientation even under rtl
    fireEvent.keyDown(one, { key: "ArrowLeft" });
    expect(one).toHaveFocus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    expect(one).toHaveFocus();
  });

  it("horizontal: ArrowUp/Down are ignored", () => {
    const { one } = renderHorizontalTabs({ dir: "ltr" });

    one.focus();
    fireEvent.keyDown(one, { key: "ArrowDown" });
    expect(one).toHaveFocus();
    fireEvent.keyDown(one, { key: "ArrowUp" });
    expect(one).toHaveFocus();
  });

  it("disabled triggers are skipped by arrow navigation", async () => {
    render(
      <DirectionProvider dir="ltr">
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two" disabled>
              Two
            </TabsTrigger>
            <TabsTrigger value="three">Three</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    );
    const one = screen.getByRole("tab", { name: "One" });
    const three = screen.getByRole("tab", { name: "Three" });

    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    await waitFor(() => expect(three).toHaveFocus());
  });

  it("automatic activation (default): focus selects the tab", async () => {
    const onValueChange = vi.fn();
    render(
      <DirectionProvider dir="ltr">
        <Tabs defaultValue="one" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    );
    const one = screen.getByRole("tab", { name: "One" });
    const two = screen.getByRole("tab", { name: "Two" });

    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    await waitFor(() => expect(two).toHaveFocus());
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(two).toHaveAttribute("aria-selected", "true");
  });

  it("manual activation stays manual until Enter/Space", async () => {
    render(
      <DirectionProvider dir="ltr">
        <Tabs defaultValue="one" activationMode="manual">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    );
    const one = screen.getByRole("tab", { name: "One" });
    const two = screen.getByRole("tab", { name: "Two" });

    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    await waitFor(() => expect(two).toHaveFocus());
    // focus moved but selection stays manual
    expect(one).toHaveAttribute("aria-selected", "true");
    expect(two).toHaveAttribute("aria-selected", "false");

    fireEvent.keyDown(two, { key: "Enter" });
    expect(two).toHaveAttribute("aria-selected", "true");
  });

  it("forwards refs and refs focus the correct element", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    render(
      <DirectionProvider dir="ltr">
        <Tabs defaultValue="one" ref={rootRef}>
          <TabsList>
            <TabsTrigger value="one" ref={triggerRef}>
              One
            </TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current).toHaveAttribute("data-slot", "tabs");
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current).toHaveTextContent("One");

    triggerRef.current!.focus();
    expect(triggerRef.current).toHaveFocus();
  });
});
