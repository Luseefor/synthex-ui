import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DirectionProvider, useDirection } from "./direction.web";

function DirReader() {
  const { dir } = useDirection();

  return <span data-testid="dir-value">{dir}</span>;
}

function ToggleHarness() {
  const { dir, toggleDir } = useDirection();

  return (
    <>
      <span data-testid="dir-value">{dir}</span>
      <button type="button" onClick={toggleDir}>
        Toggle direction
      </button>
    </>
  );
}

describe("DirectionProvider (web)", () => {
  it("defaults to ltr and renders a div[dir]", () => {
    const { container } = render(
      <DirectionProvider>
        <DirReader />
      </DirectionProvider>,
    );

    expect(screen.getByTestId("dir-value")).toHaveTextContent("ltr");
    const wrapper = container.firstElementChild;
    expect(wrapper?.tagName).toBe("DIV");
    expect(wrapper).toHaveAttribute("dir", "ltr");
  });

  it("sets dir=rtl from props and exposes it via useDirection", () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <DirReader />
      </DirectionProvider>,
    );

    expect(screen.getByTestId("dir-value")).toHaveTextContent("rtl");
    expect(container.firstElementChild).toHaveAttribute("dir", "rtl");
  });

  it("toggleDir flips ltr to rtl and back", () => {
    render(
      <DirectionProvider>
        <ToggleHarness />
      </DirectionProvider>,
    );

    expect(screen.getByTestId("dir-value")).toHaveTextContent("ltr");

    fireEvent.click(screen.getByRole("button", { name: "Toggle direction" }));
    expect(screen.getByTestId("dir-value")).toHaveTextContent("rtl");

    fireEvent.click(screen.getByRole("button", { name: "Toggle direction" }));
    expect(screen.getByTestId("dir-value")).toHaveTextContent("ltr");
  });

  it("setDir updates context and notifies onDirChange", () => {
    const onDirChange = vi.fn();

    function SetHarness() {
      const { setDir } = useDirection();

      return (
        <button type="button" onClick={() => setDir("rtl")}>
          Set rtl
        </button>
      );
    }

    render(
      <DirectionProvider onDirChange={onDirChange}>
        <DirReader />
        <SetHarness />
      </DirectionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Set rtl" }));

    expect(screen.getByTestId("dir-value")).toHaveTextContent("rtl");
    expect(onDirChange).toHaveBeenCalledWith("rtl");
  });
});
