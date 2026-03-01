import type { LayoutNode } from "@synthex/core";

export const previewLayout: LayoutNode = {
  id: "preview-root",
  type: "split",
  direction: "horizontal",
  sizes: [0.2, 0.8],
  children: [
    {
      id: "sidebar-tabs",
      type: "tabs",
      activePanelId: "navigator",
      children: [
        {
          id: "navigator",
          type: "panel",
          panelType: "navigator",
          title: "Project",
        },
        {
          id: "search",
          type: "panel",
          panelType: "search",
          title: "Search",
        },
      ],
    },
    {
      id: "workspace-stack",
      type: "split",
      direction: "vertical",
      sizes: [0.8, 0.2],
      children: [
        {
          id: "workspace-main",
          type: "split",
          direction: "horizontal",
          sizes: [0.72, 0.28],
          children: [
            {
              id: "main-tabs",
              type: "tabs",
              activePanelId: "document",
              children: [
                {
                  id: "document",
                  type: "panel",
                  panelType: "document",
                  title: "Document",
                },
                {
                  id: "preview",
                  type: "panel",
                  panelType: "preview",
                  title: "Preview",
                },
              ],
            },
            {
              id: "detail-tabs",
              type: "tabs",
              activePanelId: "inspector",
              children: [
                {
                  id: "inspector",
                  type: "panel",
                  panelType: "inspector",
                  title: "Inspector",
                },
                {
                  id: "outline",
                  type: "panel",
                  panelType: "outline",
                  title: "Outline",
                },
              ],
            },
          ],
        },
        {
          type: "panel",
          id: "console",
          panelType: "console",
          title: "Console",
        },
      ],
    },
  ],
};
