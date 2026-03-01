import { describe, expect, it, vi } from "vitest";
import * as web from "./index.web";

vi.mock("react-native", () => ({
  Image: "Image",
  Modal: "Modal",
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  Text: "Text",
  TextInput: "TextInput",
  View: "View",
}));

vi.mock("lucide-react-native", () => ({
  Check: "Check",
  ChevronDown: "ChevronDown",
  ChevronLeft: "ChevronLeft",
  ChevronRight: "ChevronRight",
  ChevronUp: "ChevronUp",
  LayoutGrid: "LayoutGrid",
  PanelBottom: "PanelBottom",
  PanelLeft: "PanelLeft",
  PanelRight: "PanelRight",
  PanelTop: "PanelTop",
  Plus: "Plus",
  Redo2: "Redo2",
  Search: "Search",
  Settings: "Settings",
  Undo2: "Undo2",
  X: "X",
}));

describe("package exports", () => {
  it("exposes the web design system surface", () => {
    expect(web.Button).toBeDefined();
    expect(web.Card).toBeDefined();
    expect(web.Input).toBeDefined();
    expect(web.Textarea).toBeDefined();
    expect(web.Alert).toBeDefined();
    expect(web.Avatar).toBeDefined();
    expect(web.Checkbox).toBeDefined();
    expect(web.Progress).toBeDefined();
    expect(web.Skeleton).toBeDefined();
    expect(web.Accordion).toBeDefined();
    expect(web.RadioGroup).toBeDefined();
    expect(web.Switch).toBeDefined();
    expect(web.Toggle).toBeDefined();
    expect(web.Pagination).toBeDefined();
    expect(web.Select).toBeDefined();
    expect(web.Command).toBeDefined();
    expect(web.Combobox).toBeDefined();
    expect(web.DropdownMenu).toBeDefined();
    expect(web.ContextMenu).toBeDefined();
    expect(web.Menubar).toBeDefined();
    expect(web.NavigationMenu).toBeDefined();
    expect(web.Dialog).toBeDefined();
    expect(web.Popover).toBeDefined();
    expect(web.Sheet).toBeDefined();
    expect(web.Tooltip).toBeDefined();
    expect(web.Table).toBeDefined();
    expect(web.Tabs).toBeDefined();
    expect(web.Badge).toBeDefined();
    expect(web.Separator).toBeDefined();
    expect(web.Box).toBeDefined();
    expect(web.Stack).toBeDefined();
    expect(web.Icon).toBeDefined();
    expect(web.useDisclosure).toBeTypeOf("function");
    expect(web.ThemeProvider).toBeTypeOf("function");
  });

  it("resolves the native entry without changing the public contract", async () => {
    const native = await import("./index.native");

    expect(native.Button).toBeDefined();
    expect(native.Card).toBeDefined();
    expect(native.Input).toBeDefined();
    expect(native.Textarea).toBeDefined();
    expect(native.Alert).toBeDefined();
    expect(native.Avatar).toBeDefined();
    expect(native.Checkbox).toBeDefined();
    expect(native.Progress).toBeDefined();
    expect(native.Skeleton).toBeDefined();
    expect(native.Accordion).toBeDefined();
    expect(native.RadioGroup).toBeDefined();
    expect(native.Switch).toBeDefined();
    expect(native.Toggle).toBeDefined();
    expect(native.Pagination).toBeDefined();
    expect(native.Select).toBeDefined();
    expect(native.Command).toBeDefined();
    expect(native.Combobox).toBeDefined();
    expect(native.DropdownMenu).toBeDefined();
    expect(native.ContextMenu).toBeDefined();
    expect(native.Menubar).toBeDefined();
    expect(native.NavigationMenu).toBeDefined();
    expect(native.Dialog).toBeDefined();
    expect(native.Popover).toBeDefined();
    expect(native.Sheet).toBeDefined();
    expect(native.Tooltip).toBeDefined();
    expect(native.Table).toBeDefined();
    expect(native.Tabs).toBeDefined();
    expect(native.Badge).toBeDefined();
    expect(native.Separator).toBeDefined();
    expect(native.Box).toBeDefined();
    expect(native.Icon).toBeDefined();
    expect(native.usePlatformValue).toBeTypeOf("function");
    expect(native.ThemeProvider).toBeTypeOf("function");
  });
});
