import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme/index.web";
import { Checkbox } from "./checkbox.web";

describe("Checkbox contracts", () => {
  it("forwards refs and supports keyboard focus", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <ThemeProvider>
        <Checkbox ref={ref} aria-label="Autosave" />
      </ThemeProvider>,
    );

    const box = screen.getByRole("checkbox", { name: "Autosave" });
    expect(ref.current).toBe(box);
    (ref.current as HTMLElement | null)?.focus();
    expect(document.activeElement).toBe(box);
  });

  it("supports uncontrolled defaultChecked and native form reset", () => {
    render(
      <ThemeProvider>
        <form>
          <Checkbox aria-label="Marketing" defaultChecked={true} />
          <button type="reset">Reset</button>
        </form>
      </ThemeProvider>,
    );

    const box = screen.getByRole("checkbox", { name: "Marketing" });
    expect(box).toHaveAttribute("aria-checked", "true");
    fireEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("restores defaultChecked=indeterminate after form reset instead of drifting to checked", () => {
    render(
      <ThemeProvider>
        <form>
          <Checkbox aria-label="Select all" defaultChecked="indeterminate" />
          <button type="reset">Reset</button>
        </form>
      </ThemeProvider>,
    );

    const box = screen.getByRole("checkbox", { name: "Select all" });
    expect(box).toHaveAttribute("aria-checked", "mixed");
    expect(box).toHaveAttribute("data-state", "indeterminate");

    fireEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(box).toHaveAttribute("aria-checked", "mixed");
    expect(box).toHaveAttribute("data-state", "indeterminate");
  });

  it("supports controlled checked + onCheckedChange", () => {
    const onCheckedChange = vi.fn();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return (
        <ThemeProvider>
          <Checkbox
            aria-label="Controlled"
            checked={checked}
            onCheckedChange={(next) => {
              setChecked(next);
              onCheckedChange(next);
            }}
          />
        </ThemeProvider>
      );
    }
    render(<Controlled />);
    const box = screen.getByRole("checkbox", { name: "Controlled" });
    expect(box).toHaveAttribute("aria-checked", "false");
    fireEvent.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("honors disabled and submits name/value through its hidden input", () => {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    render(
      <ThemeProvider>
        <form data-testid="form" onSubmit={onSubmit}>
          <Checkbox aria-label="Terms" name="terms" defaultChecked={true} />
          <Checkbox aria-label="Blocked" name="blocked" disabled />
          <button type="submit">Save</button>
        </form>
      </ThemeProvider>,
    );

    const blocked = screen.getByRole("checkbox", { name: "Blocked" });
    expect(blocked).toBeDisabled();
    fireEvent.click(blocked);
    expect(blocked).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const form = screen.getByTestId("form") as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("terms")).toBe("on");
    expect(data.get("blocked")).toBeNull();
  });
});
