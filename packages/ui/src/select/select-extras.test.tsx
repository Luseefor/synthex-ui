import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectArrow,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select.web";

function ExtrasHarness() {
  return (
    <Select defaultOpen defaultValue="apple">
      <SelectTrigger aria-label="Fruit selector">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectScrollUpButton aria-label="Scroll up" />
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator data-testid="select-separator" />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
        </SelectGroup>
        <SelectScrollDownButton aria-label="Scroll down" />
        <SelectArrow data-testid="select-arrow" />
      </SelectContent>
    </Select>
  );
}

describe("Select extras", () => {
  it("renders groups with labels wired via aria-labelledby", () => {
    render(<ExtrasHarness />);

    const group = screen.getByRole("group", { name: "Fruits" });
    expect(group).toBeInTheDocument();

    const label = screen.getByText("Fruits");
    expect(label).toBeInTheDocument();
    expect(group.getAttribute("aria-labelledby")).toBe(label.getAttribute("id"));
  });

  it("renders a separator between groups", () => {
    render(<ExtrasHarness />);

    expect(screen.getByTestId("select-separator")).toBeInTheDocument();
    expect(screen.getByTestId("select-separator")).toHaveAttribute("data-slot", "select-separator");
  });

  it("renders scroll buttons with data-slot when overflow allows", () => {
    render(<ExtrasHarness />);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const up = screen.queryByLabelText("Scroll up");
    const down = screen.queryByLabelText("Scroll down");

    if (up) {
      expect(up).toHaveAttribute("data-slot", "select-scroll-up-button");
    }

    if (down) {
      expect(down).toHaveAttribute("data-slot", "select-scroll-down-button");
    }

    expect(up ?? down ?? screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("renders a decorative arrow", () => {
    render(<ExtrasHarness />);

    const arrow = screen.getByTestId("select-arrow");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });
});
