import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.web";

describe("DropdownMenu extras", () => {
  it("opens submenu on trigger click and closes sub only on Escape", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Root item</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.queryByText("Sub item")).toBeNull();

    fireEvent.click(screen.getByRole("menuitem", { name: /more/i }));
    expect(screen.getByText("Sub item")).toBeTruthy();

    const subTrigger = screen.getByRole("menuitem", { name: /more/i });
    expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
    expect(subTrigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(screen.getByText("Sub item"), { key: "Escape" });
    expect(screen.queryByText("Sub item")).toBeNull();
    expect(screen.getByText("Root item")).toBeTruthy();
  });

  it("opens submenu on ArrowRight and closes on ArrowLeft", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("menuitem", { name: /more/i });
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    expect(screen.getByText("Sub item")).toBeTruthy();

    fireEvent.keyDown(screen.getByText("Sub item"), { key: "ArrowLeft" });
    expect(screen.queryByText("Sub item")).toBeNull();
  });

  it("toggles checkbox item without closing and reports aria-checked", () => {
    const onCheckedChange = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem onCheckedChange={onCheckedChange}>
            Notify me
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole("menuitemcheckbox", { name: /notify me/i });
    expect(item).toHaveAttribute("aria-checked", "false");

    fireEvent.click(item);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(item).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Notify me")).toBeTruthy();
  });

  it("selects radio item via group onValueChange", () => {
    const onValueChange = vi.fn();
    function Harness() {
      const [value, setValue] = React.useState("a");
      return (
        <DropdownMenu defaultOpen>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                setValue(next);
                onValueChange(next);
              }}
            >
              <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Harness />);

    const optionA = screen.getByRole("menuitemradio", { name: "Option A" });
    const optionB = screen.getByRole("menuitemradio", { name: "Option B" });
    expect(optionA).toHaveAttribute("aria-checked", "true");
    expect(optionB).toHaveAttribute("aria-checked", "false");

    fireEvent.click(optionB);
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("menuitemradio", { name: "Option B" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("renders shortcut with muted ml-auto styling and decorative arrow", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuArrow data-testid="menu-arrow" />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const shortcut = screen.getByText("⌘S");
    expect(shortcut.tagName.toLowerCase()).toBe("span");
    expect(shortcut.className).toMatch(/ml-auto/);

    const arrow = screen.getByTestId("menu-arrow");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
  });
});
