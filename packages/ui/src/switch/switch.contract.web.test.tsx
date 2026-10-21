import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme/index.web";
import { Switch } from "./switch.web";

describe("Switch contracts", () => {
  it("forwards refs and supports keyboard focus", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <ThemeProvider>
        <Switch ref={ref} aria-label="Inspector" />
      </ThemeProvider>,
    );

    const control = screen.getByRole("switch", { name: "Inspector" });
    expect(ref.current).toBe(control);
    (ref.current as HTMLElement | null)?.focus();
    expect(document.activeElement).toBe(control);
  });

  it("supports uncontrolled defaultChecked and native form reset", () => {
    render(
      <ThemeProvider>
        <form>
          <Switch aria-label="Notifications" defaultChecked={true} />
          <button type="reset">Reset</button>
        </form>
      </ThemeProvider>,
    );

    const control = screen.getByRole("switch", { name: "Notifications" });
    expect(control).toHaveAttribute("aria-checked", "true");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("supports controlled checked + onCheckedChange", () => {
    const onCheckedChange = vi.fn();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return (
        <ThemeProvider>
          <Switch
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
    const control = screen.getByRole("switch", { name: "Controlled" });
    expect(control).toHaveAttribute("aria-checked", "false");
    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("honors disabled and submits name/value through its hidden input", () => {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    render(
      <ThemeProvider>
        <form data-testid="form" onSubmit={onSubmit}>
          <Switch aria-label="Alerts" name="alerts" defaultChecked={true} />
          <Switch aria-label="Blocked" name="blocked" disabled />
          <button type="submit">Save</button>
        </form>
      </ThemeProvider>,
    );

    const blocked = screen.getByRole("switch", { name: "Blocked" });
    expect(blocked).toBeDisabled();
    fireEvent.click(blocked);
    expect(blocked).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const form = screen.getByTestId("form") as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("alerts")).toBe("on");
    expect(data.get("blocked")).toBeNull();
  });
});
