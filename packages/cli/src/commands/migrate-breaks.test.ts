import { describe, expect, it } from "vitest";
import {
  collectManualReviewWarnings,
  transformBreaks,
  transformMenubar,
  transformToastAction,
} from "./migrate";

describe("toast codemod", () => {
  it("adds altText from text children", () => {
    expect(transformToastAction("<ToastAction>Undo</ToastAction>")).toBe(
      '<ToastAction altText="Undo">Undo</ToastAction>',
    );
  });

  it("preserves props and skips existing altText", () => {
    expect(
      transformToastAction(
        '<ToastAction className="x">Undo delete</ToastAction>',
      ),
    ).toBe(
      '<ToastAction className="x" altText="Undo delete">Undo delete</ToastAction>',
    );
    const already = '<ToastAction altText="Undo">Undo</ToastAction>';
    expect(transformToastAction(already)).toBe(already);
  });
});

describe("menubar codemod", () => {
  it("moves single literal value to parent Menubar", () => {
    const input = [
      "<Menubar>",
      '  <MenubarMenu value="file" open>',
      "    <MenubarTrigger>File</MenubarTrigger>",
      "  </MenubarMenu>",
      "</Menubar>",
    ].join("\n");
    const result = transformMenubar(input, "menu.tsx");

    expect(result.source).toContain('<Menubar value="file">');
    expect(result.source).toContain('<MenubarMenu value="file">');
    expect(result.source).not.toContain(" open");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns with file:line when ambiguous (multiple open menus)", () => {
    const input = [
      "<Menubar>",
      '  <MenubarMenu value="file" open>',
      "  </MenubarMenu>",
      '  <MenubarMenu value="edit" defaultOpen>',
      "  </MenubarMenu>",
      "</Menubar>",
    ].join("\n");
    const result = transformMenubar(input, "menu.tsx");

    expect(result.source).not.toContain("open");
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    for (const warning of result.warnings) {
      expect(warning).toMatch(/^menu\.tsx:\d+:/);
    }
  });

  it("warns with file:line when value cannot be inferred", () => {
    const input = [
      "<Menubar>",
      "  <MenubarMenu open>",
      "  </MenubarMenu>",
      "</Menubar>",
    ].join("\n");
    const result = transformMenubar(input, "app/menu.tsx");

    expect(result.source).not.toContain(" open");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/^app\/menu\.tsx:2:/);
  });
});

describe("report-only checks", () => {
  it("flags SelectTrigger role without rewriting", () => {
    const input = '<SelectTrigger role="button">Pick</SelectTrigger>';
    const warnings = collectManualReviewWarnings(input, "select.tsx");

    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0]).toMatch(/^select\.tsx:1:/);
    expect(warnings[0]).toContain("combobox");
    expect(transformBreaks(input, "select.tsx").source).toBe(input);
  });

  it("flags Tabs missing orientation and activationMode without rewriting", () => {
    const input = [
      '<Tabs defaultValue="account">',
      "  <TabsList>",
      '    <TabsTrigger value="account">Account</TabsTrigger>',
      "  </TabsList>",
      '  <TabsContent value="account">Body</TabsContent>',
      "</Tabs>",
    ].join("\n");
    const warnings = collectManualReviewWarnings(input, "tabs.tsx");

    expect(warnings.some((w) => w.includes("orientation"))).toBe(true);
    expect(warnings.some((w) => w.includes("activationMode"))).toBe(true);
    for (const warning of warnings) {
      expect(warning).toMatch(/^tabs\.tsx:\d+:/);
    }
    expect(transformBreaks(input, "tabs.tsx").source).toBe(input);
  });
});
