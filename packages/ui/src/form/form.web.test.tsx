import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { ThemeProvider } from "../theme";
import { Button } from "../button/button.web";
import { Input } from "../input/input.web";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form.web";

function RhfHarness({ onSubmit }: { readonly onSubmit: (values: { username: string }) => void }) {
  const form = useForm<{ username: string }>({ defaultValues: { username: "" } });

  return (
    <ThemeProvider>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          rules={{ required: "Username is required." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input aria-label="Username input" placeholder="ada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </Form>
    </ThemeProvider>
  );
}

describe("Form (react-hook-form)", () => {
  it("surfaces RHF validation errors through FormMessage", async () => {
    const onSubmit = vi.fn();
    render(<RhfHarness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Username is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Username input"), { target: { value: "ada" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ username: "ada" }, expect.anything()),
    );
  });

  it("wires labels to controls without react-hook-form", () => {
    render(
      <ThemeProvider>
        <Form>
          <FormField name="email" description="We only use this for updates." error="Email is required.">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input aria-label="Email input" placeholder="name@example.com" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
        </Form>
      </ThemeProvider>,
    );

    const input = screen.getByLabelText("Email input");
    expect(screen.getByText("We only use this for updates.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Email")).toHaveAttribute("for", input.getAttribute("id"));
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  });
});
