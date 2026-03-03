import { PropsPanel } from "./PropsPanel";
import type { BuilderNode } from "./types";

interface InspectorSidebarProps {
  readonly selected: BuilderNode | null;
  readonly onDelete: () => void;
  readonly onSetProps: (props: Record<string, any>) => void;
  readonly onUpdateNode: (node: Partial<BuilderNode>) => void;
}

export function InspectorSidebar({ selected, onDelete, onSetProps, onUpdateNode }: InspectorSidebarProps) {
  return (
    <aside className="bld-s bld-sr">
      <div className="bld-sh"><span>Properties</span>{selected && <button className="bld-del" onClick={onDelete}>Delete</button>}</div>
      <div className="bld-ss">{selected ? <PropsPanel n={selected} set={onSetProps} upd={onUpdateNode} /> : <div className="bld-ns"><div className="bld-ns-i">⊡</div><div>Select an element</div></div>}</div>
    </aside>
  );
}
