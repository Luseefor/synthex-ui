// @vitest-environment node
import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "./_shared/theme/ThemeProvider.web";
import { Button } from "./button/button.web";
import { Input } from "./input/input.web";
import { Checkbox } from "./checkbox/checkbox.web";
import { DirectionProvider } from "./direction/direction.web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs/tabs.web";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form/form.web";

describe("web server-rendering contracts without browser globals", () => {
  it("renders themed controls, form IDs and directional widgets deterministically", () => {
    expect(typeof document).toBe("undefined");
    expect(typeof window).toBe("undefined");
    const tree = <ThemeProvider mode="dark" accentPreset="steel"><DirectionProvider dir="rtl">
      <FormField name="email" description="Contact email" error="Required"><FormItem>
        <FormLabel>Email</FormLabel><FormControl><Input name="email" defaultValue="Ada" /></FormControl>
        <FormDescription /><FormMessage />
      </FormItem></FormField>
      <Checkbox name="updates" defaultChecked aria-label="Updates" />
      <Button>Action</Button>
      <Tabs defaultValue="first"><TabsList aria-label="Tabs"><TabsTrigger value="first">First</TabsTrigger></TabsList><TabsContent value="first">Panel</TabsContent></Tabs>
    </DirectionProvider></ThemeProvider>;
    const server = renderToString(tree);
    expect(renderToString(tree)).toBe(server);
    expect(server).toContain('data-theme="dark"');
    expect(server).toContain('dir="rtl"');
    expect(server).toContain('aria-invalid="true"');
    expect(server).toContain('value="Ada"');
    expect(server).toContain("Contact email");
    expect(server).toContain('role="tablist"');
    const inputId = server.match(/<input[^>]* id="([^"]+)"/)?.[1];
    expect(inputId).toBeTruthy();
    expect(server).toContain(`for="${inputId}"`);
  });
});
