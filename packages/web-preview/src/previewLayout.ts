import type { LayoutNode } from "@synthex/core";

export const previewLayout: LayoutNode = {
  id: "preview-root",
  type: "split",
  direction: "horizontal",
  sizes: [0.68, 0.32],
  children: [
    {
      id: "workspace-tabs",
      type: "tabs",
      activePanelId: "schematic",
      children: [
        {
          id: "schematic",
          type: "panel",
          panelType: "schematic",
          title: "Schematic",
        },
        {
          id: "pcb",
          type: "panel",
          panelType: "pcb",
          title: "PCB",
        },
      ],
    },
    {
      id: "inspectors",
      type: "split",
      direction: "vertical",
      sizes: [0.55, 0.45],
      children: [
        {
          id: "inspector-tabs",
          type: "tabs",
          activePanelId: "properties",
          children: [
            {
              id: "properties",
              type: "panel",
              panelType: "properties",
              title: "Properties",
            },
            {
              id: "netlist",
              type: "panel",
              panelType: "netlist",
              title: "Netlist",
            },
          ],
        },
        {
          id: "console",
          type: "panel",
          panelType: "console",
          title: "Console",
        },
      ],
    },
  ],
};
