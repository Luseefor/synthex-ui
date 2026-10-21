import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme/index.web";
import { Input } from "./input.web";

describe("Input contracts", () => {
  it("forwards refs and supports programmatic focus", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <ThemeProvider>
        <Input ref={ref} aria-label="Username" placeholder="ada" />
      </ThemeProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it("supports controlled values", () => {
    function Controlled() {
      const [value, setValue] = React.useState("a");
      return (
        <ThemeProvider>
          <Input aria-label="Controlled" value={value} onChange={(e) => setValue(e.target.value)} />
        </ThemeProvider>
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText("Controlled") as HTMLInputElement;
    expect(input).toHaveValue("a");
    fireEvent.change(input, { target: { value: "ab" } });
    expect(input).toHaveValue("ab");
  });

  it("supports uncontrolled defaultValue and native form reset", () => {
    render(
      <ThemeProvider>
        <form data-testid="form">
          <Input aria-label="Nickname" defaultValue="ada" />
          <button type="reset">Reset</button>
        </form>
      </ThemeProvider>,
    );

    const input = screen.getByLabelText("Nickname") as HTMLInputElement;
    expect(input).toHaveValue("ada");
    fireEvent.change(input, { target: { value: "changed" } });
    expect(input).toHaveValue("changed");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(input).toHaveValue("ada");
  });

  it("submits its name/value with a native form and honors disabled", () => {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    render(
      <ThemeProvider>
        <form data-testid="form" onSubmit={onSubmit}>
          <Input aria-label="Email" name="email" defaultValue="a@example.com" />
          <Input aria-label="Blocked" name="blocked" defaultValue="x" disabled />
          <button type="submit">Save</button>
        </form>
      </ThemeProvider>,
    );

    const blocked = screen.getByLabelText("Blocked");
    expect(blocked).toBeDisabled();
    expect(blocked).toHaveAttribute("disabled");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const form = screen.getByTestId("form") as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("email")).toBe("a@example.com");
    expect(data.get("blocked")).toBeNull();
  });

  it("reflects invalid as aria-invalid", () => {
    render(
      <ThemeProvider>
        <Input aria-label="Search" invalid placeholder="Search" />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("Search")).toHaveAttribute("aria-invalid", "true");
  });
});
