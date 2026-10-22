import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "./combobox.web";

function ClosedDefaultHarness() {
  return (
    <Combobox defaultValue="rijan" placeholder="Select owner">
      <ComboboxTrigger>
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxItem value="rijan">Rijan</ComboboxItem>
          <ComboboxItem value="luseefor">Luseefor</ComboboxItem>
          <ComboboxItem value="release-bot">Release bot</ComboboxItem>
          <ComboboxEmpty>No matching owner.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function ControlledHarness({ value }: { readonly value: string }) {
  return (
    <Combobox value={value} placeholder="Select owner">
      <ComboboxTrigger>
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxItem value="rijan">Rijan</ComboboxItem>
          <ComboboxItem value="luseefor">Luseefor</ComboboxItem>
          <ComboboxItem value="release-bot">Release bot</ComboboxItem>
          <ComboboxEmpty>No matching owner.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox web contract", () => {
  it("shows the default value label while closed before any open", () => {
    render(<ClosedDefaultHarness />);
    expect(screen.getByRole("button", { name: "Rijan" })).toBeInTheDocument();
  });

  it("reflects a controlled value change while closed against known labels", () => {
    const { rerender } = render(<ControlledHarness value="rijan" />);
    expect(screen.getByRole("button", { name: "Rijan" })).toBeInTheDocument();
    rerender(<ControlledHarness value="luseefor" />);
    expect(screen.getByRole("button", { name: "Luseefor" })).toBeInTheDocument();
  });

  it("keeps open, search, choose, and Escape behavior intact", () => {
    render(<ClosedDefaultHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Rijan" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.change(screen.getByPlaceholderText("Search options"), { target: { value: "lus" } });
    fireEvent.click(screen.getByRole("option", { name: "Luseefor" }));
    expect(screen.getByRole("button", { name: "Luseefor" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Luseefor" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Luseefor" })).toBeInTheDocument();
  });

  it("stays hidden while closed even when a caller passes hidden and display overrides", () => {
    const { container } = render(
      <Combobox defaultValue="rijan" placeholder="Select owner">
        <ComboboxTrigger>
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxContent hidden={false} className="block" style={{ display: "flex" }}>
          <ComboboxInput />
          <ComboboxList>
            <ComboboxItem value="rijan">Rijan</ComboboxItem>
            <ComboboxItem value="luseefor">Luseefor</ComboboxItem>
            <ComboboxItem value="release-bot">Release bot</ComboboxItem>
            <ComboboxEmpty>No matching owner.</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    expect(screen.getByRole("button", { name: "Rijan" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    const content = container.querySelector('[data-slot="combobox-content"]');
    expect(content).not.toBeVisible();
    expect(content?.querySelector("input")).not.toBeVisible();
  });

  it("keeps closed content inert and out of roles and tab order", () => {
    const { container } = render(<ClosedDefaultHarness />);
    expect(screen.queryByRole("dialog")).toBeNull();
    const contents = container.querySelectorAll('[data-slot="combobox-content"]');
    expect(contents.length).toBeLessThanOrEqual(1);
    const content = container.querySelector('[data-slot="combobox-content"]');
    if (content) {
      expect(content).not.toBeVisible();
      const input = content.querySelector("input");
      if (input) expect(input).not.toBeVisible();
    }
    const ids = new Set<string>();
    container.querySelectorAll("[id]").forEach((node) => ids.add(node.getAttribute("id")!));
    const allIds = Array.from(container.querySelectorAll("[id]")).map((node) =>
      node.getAttribute("id"),
    );
    expect(allIds.length).toBe(ids.size);
  });
});
