/**
 * Accordion keyboard + direction contracts (web).
 *
 * Strict focus assertions (toHaveFocus); no fallback pointer clicks for
 * keyboard moves. Accordion handles its own keydown (no roving-focus
 * setTimeout), so moves assert synchronously; waitFor is not needed.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { DirectionProvider } from "../direction/direction.web";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion.web";

function renderVerticalAccordion({ dir = "ltr" }: { readonly dir?: "ltr" | "rtl" } = {}) {
  render(
    <DirectionProvider dir={dir}>
      <Accordion type="single" collapsible defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Alpha</AccordionTrigger>
          <AccordionContent>Content alpha</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Bravo</AccordionTrigger>
          <AccordionContent>Content bravo</AccordionContent>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionTrigger>Charlie</AccordionTrigger>
          <AccordionContent>Content charlie</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DirectionProvider>,
  );

  return {
    a: screen.getByRole("button", { name: "Alpha" }),
    b: screen.getByRole("button", { name: "Bravo" }),
    c: screen.getByRole("button", { name: "Charlie" }),
  };
}

function renderHorizontalAccordion({ dir = "ltr" }: { readonly dir?: "ltr" | "rtl" } = {}) {
  render(
    <DirectionProvider dir={dir}>
      <Accordion type="single" collapsible orientation="horizontal" defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Alpha</AccordionTrigger>
          <AccordionContent>Content alpha</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Bravo</AccordionTrigger>
          <AccordionContent>Content bravo</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DirectionProvider>,
  );

  return {
    a: screen.getByRole("button", { name: "Alpha" }),
    b: screen.getByRole("button", { name: "Bravo" }),
  };
}

describe("Accordion keyboard + direction (web)", () => {
  it("vertical (default): ArrowDown moves next, ArrowUp moves prev", () => {
    const { a, b, c } = renderVerticalAccordion({ dir: "ltr" });

    a.focus();
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(b).toHaveFocus();

    fireEvent.keyDown(b, { key: "ArrowDown" });
    expect(c).toHaveFocus();

    fireEvent.keyDown(c, { key: "ArrowUp" });
    expect(b).toHaveFocus();
  });

  it("vertical: Home/End jump to first/last", () => {
    const { a, c } = renderVerticalAccordion({ dir: "ltr" });

    a.focus();
    fireEvent.keyDown(a, { key: "End" });
    expect(c).toHaveFocus();

    fireEvent.keyDown(c, { key: "Home" });
    expect(a).toHaveFocus();
  });

  it("vertical: ArrowLeft/Right are ignored", () => {
    const { a } = renderVerticalAccordion({ dir: "ltr" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(a).toHaveFocus();
  });

  it("ltr horizontal: ArrowRight moves next, ArrowLeft moves prev", () => {
    const { a, b } = renderHorizontalAccordion({ dir: "ltr" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(b).toHaveFocus();

    fireEvent.keyDown(b, { key: "ArrowLeft" });
    expect(a).toHaveFocus();
  });

  it("rtl horizontal under DirectionProvider: arrows swap (ArrowLeft next, ArrowRight prev)", () => {
    const { a, b } = renderHorizontalAccordion({ dir: "rtl" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(b).toHaveFocus();

    fireEvent.keyDown(b, { key: "ArrowRight" });
    expect(a).toHaveFocus();
  });

  it("rtl horizontal: ArrowUp/Down are ignored", () => {
    const { a } = renderHorizontalAccordion({ dir: "rtl" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: "ArrowUp" });
    expect(a).toHaveFocus();
  });

  it("disabled items are skipped by arrow navigation", () => {
    render(
      <DirectionProvider dir="ltr">
        <Accordion type="single" collapsible defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>Alpha</AccordionTrigger>
            <AccordionContent>Content alpha</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b" disabled>
            <AccordionTrigger>Bravo</AccordionTrigger>
            <AccordionContent>Content bravo</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>Charlie</AccordionTrigger>
            <AccordionContent>Content charlie</AccordionContent>
          </AccordionItem>
        </Accordion>
      </DirectionProvider>,
    );
    const a = screen.getByRole("button", { name: "Alpha" });
    const c = screen.getByRole("button", { name: "Charlie" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(c).toHaveFocus();
  });

  it("forwards refs and refs focus the correct trigger", () => {
    const triggerRef = React.createRef<HTMLButtonElement>();
    render(
      <DirectionProvider dir="ltr">
        <Accordion type="single" collapsible defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger ref={triggerRef}>Alpha</AccordionTrigger>
            <AccordionContent>Content alpha</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Bravo</AccordionTrigger>
            <AccordionContent>Content bravo</AccordionContent>
          </AccordionItem>
        </Accordion>
      </DirectionProvider>,
    );

    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current).toHaveTextContent("Alpha");

    triggerRef.current!.focus();
    expect(triggerRef.current).toHaveFocus();
  });
});
