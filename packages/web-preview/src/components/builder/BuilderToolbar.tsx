interface BuilderToolbarProps {
  readonly nodeCount: number;
  readonly preview: boolean;
  readonly grid: boolean;
  readonly canClear: boolean;
  readonly onHome: () => void;
  readonly onGrid: () => void;
  readonly onClear: () => void;
  readonly onPreview: () => void;
}

export function BuilderToolbar({ nodeCount, preview, grid, canClear, onHome, onGrid, onClear, onPreview }: BuilderToolbarProps) {
  return (
    <header className="bld-tb">
      <div className="bld-tb-l"><button className="bld-b" onClick={onHome} style={{ marginRight: 4 }}>← Home</button><div className="bld-tb-brand"><img className="bld-tb-logo" src="/logo.png" alt="Synthex UI" /><div className="bld-tb-copy"><span className="bld-tb-t">Synthex Builder</span><span className="bld-tb-sub">Interactive canvas</span></div></div><span className="bld-tb-c">{nodeCount}</span></div>
      <div className="bld-tb-r"><button className={`bld-b ${grid ? "bld-b-on" : ""}`} onClick={onGrid}>{grid ? "⊞ Grid" : "⊟ Grid"}</button>{canClear && <button className="bld-b bld-b-red" onClick={onClear}>Clear</button>}<button className={`bld-b ${preview ? "bld-b-pri" : ""}`} onClick={onPreview}>{preview ? "← Edit" : "▶ Preview"}</button></div>
    </header>
  );
}
