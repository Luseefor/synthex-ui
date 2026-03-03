import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ToastProvider, Toaster } from "synthex-ui/components";
import { useNavigate } from "react-router-dom";
import { defaults } from "./defaults";
import { snap } from "./utils";
import type { BuilderNode } from "./types";
import { BuilderToolbar } from "./BuilderToolbar";
import { ComponentSidebar } from "./ComponentSidebar";
import { InspectorSidebar } from "./InspectorSidebar";
import { CanvasStage } from "./CanvasStage";
import { BUILDER_CSS } from "./styles";

export function Builder() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [grid, setGrid] = useState(true);
  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [stageSnapshot, setStageSnapshot] = useState({ width: 1200, height: 760 });
  const [previewScale, setPreviewScale] = useState(1);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; sx: number; sy: number; sw: number; sh: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => nodes.find((node) => node.id === selectedId) ?? null, [nodes, selectedId]);
  const updateNode = useCallback((id: string, patch: Partial<BuilderNode>) => setNodes((list) => list.map((node) => node.id === id ? { ...node, ...patch } : node)), []);
  const updateProps = useCallback((id: string, props: Record<string, any>) => setNodes((list) => list.map((node) => node.id === id ? { ...node, props: { ...node.props, ...props } } : node)), []);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); const type = e.dataTransfer.getData("sx/type"); if (!type || !stageRef.current) return; const rect = stageRef.current.getBoundingClientRect(); const preset = defaults(type); const node = { id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`, type, props: preset.props, x: Math.max(0, snap(e.clientX - rect.left - preset.w / 2)), y: Math.max(0, snap(e.clientY - rect.top - preset.h / 2)), w: preset.w, h: preset.h }; setNodes((list) => [...list, node]); setSelectedId(node.id); }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => { if (!stageRef.current) return; const rect = stageRef.current.getBoundingClientRect(); if (drag) updateNode(drag.id, { x: Math.max(0, snap(e.clientX - rect.left - drag.ox)), y: Math.max(0, snap(e.clientY - rect.top - drag.oy)) }); if (resize) updateNode(resize.id, { w: Math.max(40, snap(resize.sw + e.clientX - resize.sx)), h: Math.max(20, snap(resize.sh + e.clientY - resize.sy)) }); }, [drag, resize, updateNode]);
  const onPointerUp = useCallback(() => { setDrag(null); setResize(null); }, []);

  useLayoutEffect(() => { if (preview || !stageRef.current) return; const update = () => stageRef.current && setStageSnapshot({ width: Math.max(640, Math.round(stageRef.current.clientWidth)), height: Math.max(420, Math.round(stageRef.current.clientHeight)) }); update(); const observer = new ResizeObserver(update); observer.observe(stageRef.current); return () => observer.disconnect(); }, [preview]);
  useLayoutEffect(() => { if (!preview || !canvasRef.current) return void setPreviewScale(1); const update = () => { if (!canvasRef.current) return; const bounds = canvasRef.current.getBoundingClientRect(); setPreviewScale(Math.max(0.1, Math.min((bounds.width - 48) / stageSnapshot.width, (bounds.height - 48) / stageSnapshot.height))); }; update(); const observer = new ResizeObserver(update); observer.observe(canvasRef.current); return () => observer.disconnect(); }, [preview, stageSnapshot]);

  return <ToastProvider><div className="bld"><BuilderToolbar nodeCount={nodes.length} preview={preview} grid={grid} canClear={!preview && nodes.length > 0} onHome={() => navigate("/")} onGrid={() => setGrid((value) => !value)} onClear={() => { setNodes([]); setSelectedId(null); }} onPreview={() => { if (!preview && stageRef.current) setStageSnapshot({ width: Math.max(640, Math.round(stageRef.current.clientWidth)), height: Math.max(420, Math.round(stageRef.current.clientHeight)) }); setPreview((value) => !value); setSelectedId(null); }} /><div className="bld-bd">{!preview && <ComponentSidebar search={search} collapsed={collapsed} onSearch={setSearch} onToggle={(category) => setCollapsed((state) => ({ ...state, [category]: !state[category] }))} />}<CanvasStage canvasRef={canvasRef} stageRef={stageRef} preview={preview} grid={grid} nodes={nodes} selectedId={selectedId} stageSnapshot={stageSnapshot} previewScale={previewScale} onDrop={onDrop} onCanvasClick={() => !preview && setSelectedId(null)} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onSelect={setSelectedId} onDrag={(id, ox, oy) => setDrag({ id, ox, oy })} onResize={(id, sx, sy, sw, sh) => setResize({ id, sx, sy, sw, sh })} />{!preview && <InspectorSidebar selected={selected} onDelete={() => { if (selected) { setNodes((list) => list.filter((node) => node.id !== selected.id)); setSelectedId(null); } }} onSetProps={(props) => selected && updateProps(selected.id, props)} onUpdateNode={(node) => selected && updateNode(selected.id, node)} />}</div><style>{BUILDER_CSS}</style><Toaster /></div></ToastProvider>;
}
