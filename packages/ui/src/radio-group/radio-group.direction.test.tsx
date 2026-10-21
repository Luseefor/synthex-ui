/**
 * RadioGroup keyboard + direction contracts (web).
 *
 * Strict focus assertions (toHaveFocus); no fallback pointer clicks for
 * keyboard moves. Radix roving focus defers the focus change with
 * setTimeout, so positive moves await it via waitFor; negative assertions
 * assert synchronously.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { DirectionProvider } from "../direction/direction.web";
import { RadioGroup, RadioGroupItem } from "./radio-group.web";

function renderRadio({
  dir = "ltr",
  ...groupProps
}: {
  readonly dir?: "ltr" | "rtl";
} & Omit<React.ComponentProps<typeof RadioGroup>, "dir"> = {}) {
  const onValueChange = vi.fn();
  render(
    <DirectionProvider dir={dir}>
      <RadioGroup defaultValue="a" onValueChange={onValueChange} {...groupProps}>
        <RadioGroupItem value="a">Alpha</RadioGroupItem>
        <RadioGroupItem value="b">Bravo</RadioGroupItem>
        <RadioGroupItem value="c">Charlie</RadioGroupItem>
      </RadioGroup>
    </DirectionProvider>,
  );

  return {
    a: screen.getByRole("radio", { name: "Alpha" }),
    b: screen.getByRole("radio", { name: "Bravo" }),
    c: screen.getByRole("radio", { name: "Charlie" }),
    onValueChange,
  };
}

describe("RadioGroup keyboard + direction (web)", () => {
  it("ltr horizontal: ArrowRight moves next and checks it", async () => {
    const { a, b, onValueChange } = renderRadio({ dir: "ltr" });

    a.focus();
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    await waitFor(() => expect(b).toHaveFocus());
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(b).toHaveAttribute("aria-checked", "true");
  });

  it("rtl horizontal under DirectionProvider: ArrowLeft next, ArrowRight prev", async () => {
    const { a, b, c, onValueChange } = renderRadio({ dir: "rtl" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    await waitFor(() => expect(b).toHaveFocus());
    expect(onValueChange).toHaveBeenCalledWith("b");

    fireEvent.keyDown(b, { key: "ArrowLeft" });
    await waitFor(() => expect(c).toHaveFocus());

    fireEvent.keyDown(c, { key: "ArrowRight" });
    await waitFor(() => expect(b).toHaveFocus());
  });

  it("ltr horizontal: ArrowLeft moves prev with wrap", async () => {
    const { a, c } = renderRadio({ dir: "ltr" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    await waitFor(() => expect(c).toHaveFocus());
  });

  it("Home/End jump to first/last", async () => {
    const { a, c } = renderRadio({ dir: "ltr" });

    a.focus();
    fireEvent.keyDown(a, { key: "End" });
    await waitFor(() => expect(c).toHaveFocus());

    fireEvent.keyDown(c, { key: "Home" });
    await waitFor(() => expect(a).toHaveFocus());
  });

  it("vertical orientation: ArrowDown/Up move, ArrowLeft/Right ignored", async () => {
    const { a, b } = renderRadio({ dir: "rtl", orientation: "vertical" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    await waitFor(() => expect(b).toHaveFocus());

    fireEvent.keyDown(b, { key: "ArrowUp" });
    await waitFor(() => expect(a).toHaveFocus());

    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(a).toHaveFocus();
  });

  it("disabled items are skipped by arrow navigation", async () => {
    const onValueChange = vi.fn();
    render(
      <DirectionProvider dir="ltr">
        <RadioGroup defaultValue="a" onValueChange={onValueChange}>
          <RadioGroupItem value="a">Alpha</RadioGroupItem>
          <RadioGroupItem value="b" disabled>
            Bravo
          </RadioGroupItem>
          <RadioGroupItem value="c">Charlie</RadioGroupItem>
        </RadioGroup>
      </DirectionProvider>,
    );
    const a = screen.getByRole("radio", { name: "Alpha" });
    const c = screen.getByRole("radio", { name: "Charlie" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    await waitFor(() => expect(c).toHaveFocus());
    expect(onValueChange).toHaveBeenCalledWith("c");
  });

  it("uses logical text alignment (text-start, not text-left)", () => {
    const { a } = renderRadio({ dir: "rtl" });

    expect(a.className).toContain("text-start");
    expect(a.className).not.toContain("text-left");
  });

  it("forwards refs and refs focus the correct element", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLButtonElement>();
    render(
      <DirectionProvider dir="ltr">
        <RadioGroup defaultValue="a" ref={rootRef}>
          <RadioGroupItem value="a" ref={itemRef}>
            Alpha
          </RadioGroupItem>
          <RadioGroupItem value="b">Bravo</RadioGroupItem>
        </RadioGroup>
      </DirectionProvider>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current).toHaveAttribute("data-slot", "radio-group");
    expect(itemRef.current).toBeInstanceOf(HTMLButtonElement);

    itemRef.current!.focus();
    expect(itemRef.current).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBe(itemRef.current);
  });
});
