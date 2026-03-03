import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createLayoutEngine, type PanelNode } from "@luseefor/synthex-core";
import { LayoutRenderer } from "./LayoutRenderer";
import { useSynthex } from "./useSynthex";

describe("@luseefor/synthex-react-web", () => {
  it("dispatches tab activation actions through the renderer", () => {
    const onAction = vi.fn();
    const renderTabLabel = vi.fn((panel: PanelNode) => `Panel: ${panel.title ?? panel.panelType}`);

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
        renderTabLabel={renderTabLabel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Panel: Console" }));

    expect(onAction).toHaveBeenCalledWith({
      type: "SET_ACTIVE_PANEL",
      tabsId: "tabs",
      panelId: "console",
    });
    expect(renderTabLabel).toHaveBeenCalledTimes(2);
  });

  it("wires split resize handles back to layout actions and exposes layout direction", () => {
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

    expect(screen.getByLabelText("Resize split").parentElement).toHaveAttribute(
      "data-layout-direction",
      "horizontal",
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

  it("applies a custom neutral renderer theme to split and tab surfaces", () => {
    const { container } = render(
      <LayoutRenderer
        layout={{
          id: "root",
          type: "split",
          direction: "vertical",
          sizes: [0.5, 0.5],
          children: [
            {
              id: "tabs",
              type: "tabs",
              activePanelId: "schematic",
              children: [
                { id: "schematic", type: "panel", panelType: "schematic", title: "Schematic" },
                { id: "netlist", type: "panel", panelType: "netlist", title: "Netlist" },
              ],
            },
            { id: "console", type: "panel", panelType: "console", title: "Console" },
          ],
        }}
        selectedNodeId="tabs"
        theme={{
          canvasBackground: "rgb(10, 14, 22)",
          surfaceBackground: "rgb(18, 24, 38)",
          tabActiveBackground: "rgb(27, 36, 56)",
          selectedBorderColor: "rgb(96, 165, 250)",
        }}
      />,
    );

    const tabsContainer = container.querySelector("[data-tabs-id='tabs']");

    expect(tabsContainer).not.toBeNull();
    expect(tabsContainer).toHaveStyle({
      background: "rgb(18, 24, 38)",
    });
    expect(tabsContainer).toHaveStyle({
      border: "1px solid rgb(96, 165, 250)",
    });
    expect(screen.getByRole("button", { name: "Schematic" })).toHaveStyle({
      background: "rgb(27, 36, 56)",
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

  it("coalesces consecutive split resize commands into one undo step", async () => {
    const engine = createLayoutEngine({
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [
        { id: "left", type: "panel", panelType: "editor", title: "Editor" },
        { id: "right", type: "panel", panelType: "inspector", title: "Inspector" },
      ],
    });

    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [0.55, 0.45],
    });
    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [0.61, 0.39],
    });
    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [0.68, 0.32],
    });

    expect(engine.commands.getHistoryState()).toMatchObject({
      undoDepth: 1,
      redoDepth: 0,
    });
    expect(engine.getState()).toMatchObject({
      id: "root",
      type: "split",
      sizes: [0.68, 0.32],
    });

    await engine.commands.undo();

    expect(engine.getState()).toMatchObject({
      id: "root",
      type: "split",
      sizes: [0.5, 0.5],
    });
    expect(engine.commands.getHistoryState()).toMatchObject({
      undoDepth: 0,
      redoDepth: 1,
    });
  });
});
