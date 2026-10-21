import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../theme/index.web";
import { Input } from "../input/input.web";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form.web";

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("FormControl contracts", () => {
  it("preserves custom IDs and explicit required/ARIA opt-outs", () => {
    render(<FormField name="custom" required error="Error"><FormItem>
      <FormLabel htmlFor="custom-id">Custom ID</FormLabel>
      <FormControl id="custom-id" required={false} aria-required={false} aria-invalid={false}><Input /></FormControl>
      <FormMessage />
    </FormItem></FormField>);
    const input = screen.getByRole("textbox", { name: "Custom ID" });
    expect(input).toHaveAttribute("id", "custom-id");
    expect(input).not.toBeRequired();
    expect(input).toHaveAttribute("aria-required", "false");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("links children-only descriptions/messages and removes the links on unmount", () => {
    function Field({ show }: { show: boolean }) {
      return <FormField name="custom"><FormItem><FormLabel>Custom</FormLabel>
        <FormControl><Input /></FormControl>
        {show ? <><FormDescription>Child helper</FormDescription><FormMessage>Child message</FormMessage></> : null}
      </FormItem></FormField>;
    }
    const view = render(<Field show />);
    const input = screen.getByRole("textbox", { name: "Custom" });
    const ids = input.getAttribute("aria-describedby")!.split(/\s+/);
    expect(ids).toContain(screen.getByText("Child helper").id);
    expect(ids).toContain(screen.getByText("Child message").id);
    view.rerender(<Field show={false} />);
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("merges a caller-supplied aria-describedby with generated description/message ids", () => {
    renderWithTheme(
      <Form>
        <FormField
          name="email"
          description="We only use this for updates."
          error="Email is required."
        >
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl aria-describedby="custom-hint">
              <Input aria-label="Email input" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>,
    );

    const input = screen.getByLabelText("Email input");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    const tokens = describedBy.split(/\s+/).filter(Boolean);

    expect(tokens).toContain("custom-hint");
    // Generated ids must survive the caller-supplied value.
    const descriptionEl = screen.getByText("We only use this for updates.");
    const messageEl = screen.getByText("Email is required.");
    expect(tokens).toContain(descriptionEl.getAttribute("id"));
    expect(tokens).toContain(messageEl.getAttribute("id"));
  });

  it("preserves a child-supplied aria-describedby alongside generated ids", () => {
    renderWithTheme(
      <Form>
        <FormField name="email" description="Helper text." error="Bad value.">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input aria-label="Email input" aria-describedby="child-hint" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>,
    );

    const input = screen.getByLabelText("Email input");
    const tokens = (input.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    expect(tokens).toContain("child-hint");
    expect(tokens).toContain(screen.getByText("Helper text.").getAttribute("id"));
    expect(tokens).toContain(screen.getByText("Bad value.").getAttribute("id"));
  });

  it("does not reference a dangling description id when no description is rendered", () => {
    renderWithTheme(
      <Form>
        <FormField name="nickname">
          <FormItem>
            <FormLabel>Nickname</FormLabel>
            <FormControl>
              <Input aria-label="Nickname input" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>,
    );

    const input = screen.getByLabelText("Nickname input");
    // No description and no error: no dangling pointer.
    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("references only the message id when there is an error but no description", () => {
    renderWithTheme(
      <Form>
        <FormField name="nickname" error="Nickname is required.">
          <FormItem>
            <FormLabel>Nickname</FormLabel>
            <FormControl>
              <Input aria-label="Nickname input" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>,
    );

    const input = screen.getByLabelText("Nickname input");
    const messageId = screen.getByText("Nickname is required.").getAttribute("id");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBe(messageId);
  });

  it("exposes required as required + aria-required and wires label/error association", () => {
    renderWithTheme(
      <Form>
        <FormField
          name="email"
          required
          description="Helper text."
          error="Email is required."
        >
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input aria-label="Email input" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>,
    );

    const input = screen.getByLabelText("Email input") as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");

    const label = screen.getByText("Email");
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
    expect(input.getAttribute("id")).toBeTruthy();

    // Every id referenced by aria-describedby must resolve to a rendered node.
    const tokens = (input.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      expect(document.getElementById(token)).not.toBeNull();
    }
  });

  it("keeps label association usable via keyboard focus", () => {
    renderWithTheme(
      <Form>
        <FormField name="email" description="Helper.">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input aria-label="Email input" />
            </FormControl>
            <FormDescription />
          </FormItem>
        </FormField>
      </Form>,
    );

    const input = screen.getByLabelText("Email input") as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.change(input, { target: { value: "ada@example.com" } });
    expect(input).toHaveValue("ada@example.com");
  });
});
