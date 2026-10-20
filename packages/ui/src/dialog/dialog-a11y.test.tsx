import * as React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog.web";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../sheet/sheet.web";

expect.extend(toHaveNoViolations);

function Harness() {
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Test title</DialogTitle>
        <DialogDescription>Test description</DialogDescription>
        <button type="button">Inner action</button>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog a11y", () => {
  it("exposes role dialog, aria-modal, and labelledby/describedby wiring", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Open dialog"));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const labelledBy = dialog.getAttribute("aria-labelledby");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();

    const title = screen.getByText("Test title");
    const description = screen.getByText("Test description");
    expect(title.getAttribute("id")).toBe(labelledBy);
    expect(description.getAttribute("id")).toBe(describedBy);

    const trigger = screen.getByText("Open dialog");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger.getAttribute("aria-controls")).toBe(dialog.getAttribute("id"));
  });

  it("closes on Escape", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("traps Tab and restores focus to trigger on close", () => {
    render(<Harness />);
    const trigger = screen.getByText("Open dialog") as HTMLElement;
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    const innerButton = screen.getByText("Inner action") as HTMLElement;
    const closeButton = screen.getByLabelText("Close dialog") as HTMLElement;

    // Tab on last focusable wraps to first
    innerButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(closeButton);

    // Shift+Tab on first focusable wraps to last
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(innerButton);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("has no axe violations for open DialogContent", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Test title</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
          <button type="button">Inner action</button>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations for open SheetContent", async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
          <button type="button">Sheet action</button>
        </SheetContent>
      </Sheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
