/**
 * Moat axe checks (web) — dialog/select/menu/calendar.
 *
 * These mirror the already-passing web a11y configurations (see
 * dialog-a11y.test.tsx) and prove no regressions. Uses jest-axe.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog/dialog.web";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select/select.web";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu/dropdown-menu.web";
import { Calendar } from "./calendar/calendar.web";

expect.extend(toHaveNoViolations);

// Component-level axe: `region` (landmark containment) only passes for full
// pages or modal dialogs. Select/menu/calendar render inline or in portals
// without a page landmark, so disable `region` there (standard for
// component tests). Dialog stays strict (modal is a landmark).
const axeWithoutRegion = (el: HTMLElement) =>
  axe(el, { rules: { region: { enabled: false } } });

describe("Moat axe (web)", () => {
  it("dialog has no violations when open", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <button type="button">Action</button>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("select has no violations when open", async () => {
    render(
      <Select defaultOpen defaultValue="apple">
        <SelectTrigger aria-label="Fruit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(await axeWithoutRegion(document.body)).toHaveNoViolations();
  });

  it("menu (dropdown) has no violations when open", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Schematic</DropdownMenuItem>
          <DropdownMenuItem>Console</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    // Radix renders menu in a portal; role=menu appears when open.
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(await axeWithoutRegion(document.body)).toHaveNoViolations();
    // Close via Escape to avoid leaking portals into other tests.
    fireEvent.keyDown(menu, { key: "Escape" });
  });

  it("calendar has no violations", async () => {
    render(<Calendar defaultValue={new Date(2026, 2, 12)} />);
    expect(
      screen.getByRole("button", { name: "Next month" }),
    ).toBeInTheDocument();
    expect(await axeWithoutRegion(document.body)).toHaveNoViolations();
  });
});
