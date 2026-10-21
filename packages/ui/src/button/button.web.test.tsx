import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button.web";

describe("Button web contracts", () => {
  it("forwards its ref, focuses the button and defaults to a non-submit type", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(<form onSubmit={submit}><Button ref={ref}>Action</Button><Button type="submit">Submit</Button></form>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Action" }));
    ref.current!.focus();
    expect(ref.current).toHaveFocus();
    fireEvent.click(ref.current!);
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("composes child handlers and classes with a forwarded ref when enabled", () => {
    const child = vi.fn();
    const parent = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button asChild ref={ref} className="parent-class" onClick={parent}><a href="#target" className="child-class" onClick={child}>Link</a></Button>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(ref.current).toBe(link);
    expect(link).toHaveClass("parent-class", "child-class");
    fireEvent.click(link);
    expect(child).toHaveBeenCalledTimes(1);
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it("blocks disabled slotted links, including child handlers and keyboard activation", () => {
    const child = vi.fn();
    const parent = vi.fn();
    const capture = vi.fn();
    render(<Button asChild disabled onClick={parent}><a href="#target" onClick={child} onClickCapture={capture}>Unavailable</a></Button>);
    const link = screen.getByRole("link", { name: "Unavailable" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(fireEvent.click(link)).toBe(false);
    expect(fireEvent.keyDown(link, { key: "Enter" })).toBe(false);
    expect(child).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it("retains the child's handlers after becoming enabled", () => {
    const click = vi.fn();
    const view = render(<Button asChild disabled><a href="#target" onClick={click}>Toggleable</a></Button>);
    fireEvent.click(screen.getByRole("link"));
    expect(click).not.toHaveBeenCalled();
    view.rerender(<Button asChild><a href="#target" onClick={click}>Toggleable</a></Button>);
    fireEvent.click(screen.getByRole("link"));
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-disabled");
  });
});
