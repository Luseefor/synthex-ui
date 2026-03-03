import type { DragEvent, PointerEvent, RefObject } from "react";
import { CanvasNode } from "./CanvasNode";
import type { BuilderNode } from "./types";

interface CanvasStageProps {
  readonly canvasRef: RefObject<HTMLDivElement | null>;
  readonly stageRef: RefObject<HTMLDivElement | null>;
  readonly preview: boolean;
  readonly grid: boolean;
  readonly nodes: BuilderNode[];
  readonly selectedId: string | null;
  readonly stageSnapshot: { width: number; height: number };
  readonly previewScale: number;
  readonly onDrop: (e: DragEvent) => void;
  readonly onCanvasClick: () => void;
  readonly onPointerMove: (e: PointerEvent) => void;
  readonly onPointerUp: () => void;
  readonly onSelect: (id: string) => void;
  readonly onDrag: (id: string, ox: number, oy: number) => void;
  readonly onResize: (id: string, sx: number, sy: number, sw: number, sh: number) => void;
}

export function CanvasStage(props: CanvasStageProps) {
  const stage = props.preview ? <div className="bld-preview-wrap"><div className="bld-preview-scale" style={{ transform: `scale(${props.previewScale})` }}><div className="bld-preview-frame" style={{ width: props.stageSnapshot.width, height: props.stageSnapshot.height }}>{props.nodes.map((node) => <CanvasNode key={node.id} n={node} isSel={false} pv={true} onSel={() => undefined} onDrag={() => undefined} onResize={() => undefined} />)}</div></div></div> : <>{props.nodes.length === 0 && <div className="bld-mt"><div className="bld-mt-i">✦</div><div className="bld-mt-t">Drop components anywhere</div><div className="bld-mt-d">Search and drag from the left panel</div></div>}{props.nodes.map((node) => <CanvasNode key={node.id} n={node} isSel={props.selectedId === node.id} pv={false} onSel={() => props.onSelect(node.id)} onDrag={(ox, oy) => props.onDrag(node.id, ox, oy)} onResize={(sx, sy) => props.onResize(node.id, sx, sy, node.w, node.h)} />)}</>;

  return <main ref={props.canvasRef} className={`bld-cv ${props.preview ? "bld-cv-pv" : ""}`} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }} onDrop={props.onDrop} onClick={props.onCanvasClick} onPointerMove={props.onPointerMove} onPointerUp={props.onPointerUp} onPointerLeave={props.onPointerUp}><div className={`bld-cv-shell ${props.preview ? "bld-cv-shell-pv" : ""}`}><div ref={props.stageRef} className={`bld-stage ${props.grid && !props.preview ? "bld-stage-grid" : ""} ${props.preview ? "bld-stage-pv" : ""}`}>{stage}</div></div></main>;
}
