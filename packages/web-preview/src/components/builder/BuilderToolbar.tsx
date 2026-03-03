interface BuilderToolbarProps {
  readonly nodeCount: number;
  readonly isMobile: boolean;
  readonly preview: boolean;
  readonly grid: boolean;
  readonly canClear: boolean;
  readonly hasSelection: boolean;
  readonly mobilePanel: "components" | "inspector" | null;
  readonly onHome: () => void;
  readonly onGrid: () => void;
  readonly onClear: () => void;
  readonly onPreview: () => void;
  readonly onToggleComponents: () => void;
  readonly onToggleInspector: () => void;
}

export function BuilderToolbar({
  nodeCount,
  isMobile,
  preview,
  grid,
  canClear,
  hasSelection,
  mobilePanel,
  onHome,
  onGrid,
  onClear,
  onPreview,
  onToggleComponents,
  onToggleInspector,
}: BuilderToolbarProps) {
  return (
    <header className="bld-tb">
      <div className="bld-tb-l"><button className="bld-b" onClick={onHome} style={{ marginRight: 4 }}>← Home</button><div className="bld-tb-brand"><img className="bld-tb-logo" src="/logo.png" alt="Synthex UI" /><div className="bld-tb-copy"><span className="bld-tb-t">Synthex Builder</span><span className="bld-tb-sub">Interactive canvas</span></div></div><span className="bld-tb-c">{nodeCount}</span></div>
      <div className="bld-tb-r">{isMobile && !preview ? <button className={`bld-b ${mobilePanel === "components" ? "bld-b-on" : ""}`} onClick={onToggleComponents}>◫ Components</button> : null}{isMobile && !preview ? <button className={`bld-b ${mobilePanel === "inspector" ? "bld-b-on" : ""}`} onClick={onToggleInspector} disabled={!hasSelection}>◪ Properties</button> : null}<button className={`bld-b ${grid ? "bld-b-on" : ""}`} onClick={onGrid}>{grid ? "⊞ Grid" : "⊟ Grid"}</button>{canClear && <button className="bld-b bld-b-red" onClick={onClear}>Clear</button>}<button className={`bld-b ${preview ? "bld-b-pri" : ""}`} onClick={onPreview}>{preview ? "← Edit" : "▶ Preview"}</button></div>
    </header>
  );
}
