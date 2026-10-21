import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme/index.web";
import { Textarea } from "./textarea.web";

describe("Textarea contracts", () => {
  it("forwards refs and supports programmatic focus", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(
      <ThemeProvider>
        <Textarea ref={ref} aria-label="Bio" placeholder="Tell us more" />
      </ThemeProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it("supports controlled values", () => {
    function Controlled() {
      const [value, setValue] = React.useState("hi");
      return (
        <ThemeProvider>
          <Textarea aria-label="Controlled" value={value} onChange={(e) => setValue(e.target.value)} />
        </ThemeProvider>
      );
    }
    render(<Controlled />);
    const area = screen.getByLabelText("Controlled") as HTMLTextAreaElement;
    expect(area).toHaveValue("hi");
    fireEvent.change(area, { target: { value: "hello" } });
    expect(area).toHaveValue("hello");
  });

  it("supports uncontrolled defaultValue and native form reset", () => {
    render(
      <ThemeProvider>
        <form>
          <Textarea aria-label="Notes" defaultValue="draft" />
          <button type="reset">Reset</button>
        </form>
      </ThemeProvider>,
    );

    const area = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    expect(area).toHaveValue("draft");
    fireEvent.change(area, { target: { value: "edited" } });
    expect(area).toHaveValue("edited");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(area).toHaveValue("draft");
  });

  it("submits its name/value with a native form and honors disabled", () => {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    render(
      <ThemeProvider>
        <form data-testid="form" onSubmit={onSubmit}>
          <Textarea aria-label="Notes" name="notes" defaultValue="hello" />
          <Textarea aria-label="Blocked" name="blocked" defaultValue="x" disabled />
          <button type="submit">Save</button>
        </form>
      </ThemeProvider>,
    );

    const blocked = screen.getByLabelText("Blocked");
    expect(blocked).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("notes")).toBe("hello");
    expect(new FormData(form).get("blocked")).toBeNull();
  });

  it("reflects invalid as aria-invalid", () => {
    render(
      <ThemeProvider>
        <Textarea aria-label="Notes" invalid />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("Notes")).toHaveAttribute("aria-invalid", "true");
  });
});
