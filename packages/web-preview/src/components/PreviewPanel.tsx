import type { PanelNode } from "@synthex/core";

export interface PreviewPanelProps {
  readonly panel: PanelNode;
  readonly isSelected: boolean;
}

export function PreviewPanel({ panel, isSelected }: PreviewPanelProps) {
  return (
    <div
      className={`workbench-panel workbench-panel-${panel.panelType} ${
        isSelected ? "workbench-panel-selected" : ""
      }`}
    >
      <div className="workbench-panel-header">
        <div>
          <div className="workbench-panel-kicker">{panel.panelType}</div>
          <h4>{panel.title ?? panel.panelType}</h4>
        </div>
        <div className="workbench-panel-pill">{isSelected ? "Selected" : panel.id}</div>
      </div>

      <div className="workbench-panel-body">{renderPanelBody(panel)}</div>

      <div className="workbench-panel-footer">
        <span>{panel.title ?? panel.panelType}</span>
        <span>{panel.panelType}</span>
      </div>
    </div>
  );
}

function renderPanelBody(panel: PanelNode) {
  switch (panel.panelType) {
    case "schematic":
      return (
        <div className="workbench-canvas-surface">
          <div className="workbench-grid-overlay" />
          <div className="workbench-canvas-label">Sheet A1</div>
          <div className="workbench-canvas-node workbench-canvas-node-source">VIN</div>
          <div className="workbench-canvas-node workbench-canvas-node-gate">U4</div>
          <div className="workbench-canvas-node workbench-canvas-node-output">OUT</div>
          <div className="workbench-canvas-trace workbench-canvas-trace-horizontal" />
          <div className="workbench-canvas-trace workbench-canvas-trace-vertical" />
        </div>
      );

    case "pcb":
      return (
        <div className="workbench-board-surface">
          <div className="workbench-board-chip">MCU</div>
          <div className="workbench-board-via workbench-board-via-a" />
          <div className="workbench-board-via workbench-board-via-b" />
          <div className="workbench-board-trace workbench-board-trace-a" />
          <div className="workbench-board-trace workbench-board-trace-b" />
        </div>
      );

    case "properties":
      return (
        <dl className="workbench-property-list">
          <div>
            <dt>Reference</dt>
            <dd>U4</dd>
          </div>
          <div>
            <dt>Library</dt>
            <dd>power/linear</dd>
          </div>
          <div>
            <dt>Footprint</dt>
            <dd>QFN-48</dd>
          </div>
          <div>
            <dt>Net class</dt>
            <dd>High speed</dd>
          </div>
        </dl>
      );

    case "console":
      return (
        <div className="workbench-console">
          <div>[build] Running layout validation...</div>
          <div>[build] Ratios normalized for split inspectors</div>
          <div>[sim] Waveform engine idle</div>
          <div>[cli] History checkpoint saved</div>
        </div>
      );

    case "netlist":
      return (
        <div className="workbench-netlist">
          <div>.subckt buck_core VIN SW FB GND</div>
          <div>R12 FB VOUT 10k</div>
          <div>C4 VOUT GND 22u</div>
          <div>L1 SW VOUT 1uH</div>
          <div>.ends buck_core</div>
        </div>
      );

    default:
      return (
        <div className="workbench-generic-panel">
          <p>New panel inserted through the reducer.</p>
          <p>Use splits and selection to validate layout mutations.</p>
        </div>
      );
  }
}
