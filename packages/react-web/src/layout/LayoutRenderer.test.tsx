import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createLayoutEngine, type PanelNode } from "@synthex/core";
import { LayoutRenderer } from "./LayoutRenderer";
import { useSynthex } from "./useSynthex";

describe("@synthex/react-web", () => {
  it("dispatches tab activation actions through the renderer", () => {
    const onAction = vi.fn();

    render(
      <LayoutRenderer
        layout={{
          id: "tabs",
          type: "tabs",
          activePanelId: "inspector",
          children: [
            { id: "inspector", type: "panel", panelType: "inspector", title: "Inspector" },
            { id: "console", type: "panel", panelType: "console", title: "Console" },
          ],
        }}
        onAction={onAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Console" }));

    expect(onAction).toHaveBeenCalledWith({
      type: "SET_ACTIVE_PANEL",
      tabsId: "tabs",
      panelId: "console",
    });
  });

  it("wires split resize handles back to layout actions", () => {
    const onAction = vi.fn();

    render(
      <LayoutRenderer
        layout={{
          id: "root",
          type: "split",
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [
            { id: "left", type: "panel", panelType: "editor", title: "Editor" },
            { id: "right", type: "panel", panelType: "inspector", title: "Inspector" },
          ],
        }}
        onAction={onAction}
      />,
    );

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 400,
      height: 400,
      left: 0,
      right: 1000,
      toJSON: () => ({}),
      top: 0,
      width: 1000,
      x: 0,
      y: 0,
    });

    fireEvent.mouseDown(screen.getByLabelText("Resize split"), { clientX: 400 });
    fireEvent.mouseMove(window, { clientX: 520 });
    fireEvent.mouseUp(window);

    expect(onAction).toHaveBeenCalled();
    expect(onAction.mock.calls.at(-1)?.[0]).toMatchObject({
      type: "RESIZE_SPLIT",
      splitId: "root",
    });
  });

  it("subscribes to store updates via useSynthex", () => {
    const initialLayout: PanelNode = {
      id: "panel-a",
      type: "panel",
      panelType: "editor",
      title: "Editor",
    };
    const engine = createLayoutEngine(initialLayout);

    function LayoutTitle() {
      const layout = useSynthex(engine);
      return <div>{layout.type === "panel" ? layout.title : layout.id}</div>;
    }

    render(<LayoutTitle />);
    expect(screen.getByText("Editor")).toBeInTheDocument();

    act(() => {
      engine.dispatch({
        type: "SET_LAYOUT",
        layout: {
          id: "panel-b",
          type: "panel",
          panelType: "inspector",
          title: "Inspector",
        },
      });
    });

    expect(screen.getByText("Inspector")).toBeInTheDocument();
  });
});
