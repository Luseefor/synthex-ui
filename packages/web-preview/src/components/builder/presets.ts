import { defaults } from "./defaults";

export const EXPANDED_CANVAS_TYPES = new Set([
  "Select", "Combobox", "DatePicker", "NavigationMenu", "Menubar", "Popover",
  "HoverCard", "DropdownMenu", "ContextMenu", "Tooltip", "Collapsible", "Command",
]);

export const DIRECT_EDIT_TYPES = new Set([
  "Button", "ButtonGroup", "Toggle", "ToggleGroup", "Input", "Textarea", "Checkbox",
  "Switch", "RadioGroup", "Select", "Combobox", "DatePicker", "Slider", "InputOTP",
  "NativeSelect", "Tabs", "Accordion", "Pagination", "NavigationMenu", "Menubar",
  "Dialog", "AlertDialog", "Sheet", "Drawer", "Popover", "HoverCard", "Tooltip",
  "DropdownMenu", "ContextMenu", "Command", "Toast", "Collapsible", "Carousel",
  "ScrollArea", "Resizable", "Sidebar",
]);

export function getAutoSizePresets(type: string): Array<{ label: string; w: number; h: number }> {
  const compact = defaults(type);
  const presets: Record<string, Array<{ label: string; w: number; h: number }>> = {
    Select: [{ label: "Compact", w: 280, h: 180 }, { label: "Comfort", w: 320, h: 220 }, { label: "Expanded", w: 360, h: 260 }],
    Combobox: [{ label: "Compact", w: 300, h: 280 }, { label: "Comfort", w: 340, h: 340 }, { label: "Expanded", w: 380, h: 420 }],
    DatePicker: [{ label: "Compact", w: 320, h: 380 }, { label: "Comfort", w: 360, h: 420 }, { label: "Expanded", w: 400, h: 460 }],
    NavigationMenu: [{ label: "Compact", w: 440, h: 220 }, { label: "Comfort", w: 520, h: 280 }, { label: "Expanded", w: 620, h: 340 }],
    Menubar: [{ label: "Compact", w: 360, h: 180 }, { label: "Comfort", w: 420, h: 220 }, { label: "Expanded", w: 500, h: 280 }],
    Popover: [{ label: "Compact", w: 280, h: 180 }, { label: "Comfort", w: 320, h: 220 }, { label: "Expanded", w: 360, h: 260 }],
    HoverCard: [{ label: "Compact", w: 280, h: 180 }, { label: "Comfort", w: 320, h: 220 }, { label: "Expanded", w: 360, h: 280 }],
    DropdownMenu: [{ label: "Compact", w: 240, h: 220 }, { label: "Comfort", w: 280, h: 260 }, { label: "Expanded", w: 320, h: 320 }],
    ContextMenu: [{ label: "Compact", w: 240, h: 220 }, { label: "Comfort", w: 280, h: 260 }, { label: "Expanded", w: 320, h: 320 }],
    Command: [{ label: "Compact", w: 360, h: 260 }, { label: "Comfort", w: 420, h: 320 }, { label: "Expanded", w: 500, h: 400 }],
    Collapsible: [{ label: "Compact", w: 320, h: 160 }, { label: "Comfort", w: 360, h: 220 }, { label: "Expanded", w: 420, h: 280 }],
    ScrollArea: [{ label: "Compact", w: 320, h: 220 }, { label: "Comfort", w: 380, h: 300 }, { label: "Expanded", w: 460, h: 380 }],
    DataTable: [{ label: "Compact", w: 460, h: 280 }, { label: "Comfort", w: 560, h: 360 }, { label: "Expanded", w: 680, h: 460 }],
    Carousel: [{ label: "Compact", w: 400, h: 240 }, { label: "Comfort", w: 520, h: 320 }, { label: "Expanded", w: 640, h: 400 }],
    Sidebar: [{ label: "Compact", w: 240, h: 300 }, { label: "Comfort", w: 300, h: 360 }, { label: "Expanded", w: 360, h: 420 }],
  };

  return presets[type] ?? [{ label: "Default", w: compact.w, h: compact.h }];
}
