import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command.web";

function renderCommand() {
  return render(
    <Command>
      <CommandInput aria-label="palette" />
      <CommandList>
        <CommandGroup heading="Actions">
          <CommandItem value="publish-preview">Publish preview</CommandItem>
          <CommandItem value="open-docs">Open docs</CommandItem>
        </CommandGroup>
        <CommandEmpty>No match.</CommandEmpty>
      </CommandList>
    </Command>,
  );
}

describe("Command web contract", () => {
  it("mounts without an initial selection so inline lists do not auto-scroll the page", () => {
    renderCommand();
    expect(screen.queryByRole("option", { selected: true })).toBeNull();
  });

  it("focus restores first-item selection so initial Enter still works", () => {
    const onCommandSelect = vi.fn();
    render(
      <Command>
        <CommandInput aria-label="palette-focus" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="publish-preview" onCommandSelect={onCommandSelect}>
              Publish preview
            </CommandItem>
            <CommandItem value="open-docs">Open docs</CommandItem>
          </CommandGroup>
          <CommandEmpty>No match.</CommandEmpty>
        </CommandList>
      </Command>,
    );
    expect(screen.queryByRole("option", { selected: true })).toBeNull();
    fireEvent.focus(screen.getByPlaceholderText("Search commands"));
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Publish preview");
    const root = screen.getByPlaceholderText("Search commands").closest('[data-slot="command"]') as HTMLElement;
    fireEvent.keyDown(root, { key: "Enter" });
    expect(onCommandSelect).toHaveBeenCalledWith("publish-preview");
  });

  it("arrow keys still drive selection inside the list", () => {
    const { container } = renderCommand();
    const root = container.querySelector('[data-slot="command"]') as HTMLElement;
    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(screen.getByRole("option", { selected: true })).toBeInTheDocument();
  });

  it("typing still filters by search query", () => {
    renderCommand();
    fireEvent.change(screen.getByPlaceholderText("Search commands"), { target: { value: "docs" } });
    expect(screen.getByRole("option", { name: "Open docs" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Publish preview" })).toBeNull();
  });

  it("focus skips a disabled first item and selects the first enabled one", () => {
    render(
      <Command>
        <CommandInput aria-label="palette-disabled" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="blocked" disabled>
              Blocked
            </CommandItem>
            <CommandItem value="open-docs">Open docs</CommandItem>
          </CommandGroup>
          <CommandEmpty>No match.</CommandEmpty>
        </CommandList>
      </Command>,
    );
    fireEvent.focus(screen.getByPlaceholderText("Search commands"));
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Open docs");
  });

  it("focus respects an initial query and selects the first filtered item", () => {
    render(
      <Command defaultQuery="docs">
        <CommandInput aria-label="palette-query" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="publish-preview">Publish preview</CommandItem>
            <CommandItem value="open-docs">Open docs</CommandItem>
          </CommandGroup>
          <CommandEmpty>No match.</CommandEmpty>
        </CommandList>
      </Command>,
    );
    expect(screen.queryByRole("option", { name: "Publish preview" })).toBeNull();
    fireEvent.focus(screen.getByPlaceholderText("Search commands"));
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Open docs");
  });
});
