import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastProvider, Toaster } from "synthex-ui/components";
import { useMobile } from "synthex-ui/hooks";
import { BuilderToolbar } from "./BuilderToolbar";
import { CanvasStage } from "./CanvasStage";
import { ComponentSidebar } from "./ComponentSidebar";
import { defaults } from "./defaults";
import { InspectorSidebar } from "./InspectorSidebar";
import { BUILDER_CSS } from "./styles";
import type { BuilderNode } from "./types";
import { snap } from "./utils";

export function Builder() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [preview, setPreview] = useState(false);
  const [grid, setGrid] = useState(true);
  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [stageSnapshot, setStageSnapshot] = useState({ width: 1200, height: 760 });
  const [previewScale, setPreviewScale] = useState(1);
  const [mobilePanel, setMobilePanel] = useState<"components" | "inspector" | null>(null);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; sx: number; sy: number; sw: number; sh: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const minStageWidth = isMobile ? 320 : 640;
  const minStageHeight = isMobile ? 520 : 420;

  const updateNode = useCallback(
    (id: string, patch: Partial<BuilderNode>) =>
      setNodes((list) => list.map((node) => (node.id === id ? { ...node, ...patch } : node))),
    [],
  );

  const updateProps = useCallback(
    (id: string, props: Record<string, any>) =>
      setNodes((list) =>
        list.map((node) =>
          node.id === id ? { ...node, props: { ...node.props, ...props } } : node,
        ),
      ),
    [],
  );

  const addNode = useCallback(
    (type: string, point?: { x: number; y: number }) => {
      const preset = defaults(type);
      const stageWidth = stageRef.current?.clientWidth ?? stageSnapshot.width;
      const usableWidth = Math.max(180, stageWidth - (isMobile ? 24 : 48));
      const width = Math.min(preset.w, usableWidth);
      const x = point
        ? Math.max(0, snap(point.x - width / 2))
        : Math.max(0, snap(isMobile ? 12 : 32 + (nodes.length % 3) * 28));
      const y = point
        ? Math.max(0, snap(point.y - preset.h / 2))
        : Math.max(0, snap(20 + (nodes.length % 5) * 28));
      const node = {
        id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        type,
        props: preset.props,
        x,
        y,
        w: width,
        h: preset.h,
      };

      setNodes((list) => [...list, node]);
      setSelectedId(node.id);

      if (isMobile) {
        setMobilePanel(null);
      }
    },
    [isMobile, nodes.length, stageSnapshot.width],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("sx/type");
      if (!type || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      addNode(type, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [addNode],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      if (drag) {
        updateNode(drag.id, {
          x: Math.max(0, snap(e.clientX - rect.left - drag.ox)),
          y: Math.max(0, snap(e.clientY - rect.top - drag.oy)),
        });
      }
      if (resize) {
        updateNode(resize.id, {
          w: Math.max(40, snap(resize.sw + e.clientX - resize.sx)),
          h: Math.max(20, snap(resize.sh + e.clientY - resize.sy)),
        });
      }
    },
    [drag, resize, updateNode],
  );

  const onPointerUp = useCallback(() => {
    setDrag(null);
    setResize(null);
  }, []);

  useLayoutEffect(() => {
    if (preview || !stageRef.current) return;

    const update = () =>
      stageRef.current &&
      setStageSnapshot({
        width: Math.max(minStageWidth, Math.round(stageRef.current.clientWidth)),
        height: Math.max(minStageHeight, Math.round(stageRef.current.clientHeight)),
      });

    update();
    const observer = new ResizeObserver(update);
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [minStageHeight, minStageWidth, preview]);

  useLayoutEffect(() => {
    if (!preview || !canvasRef.current) {
      setPreviewScale(1);
      return;
    }

    const update = () => {
      if (!canvasRef.current) return;
      const bounds = canvasRef.current.getBoundingClientRect();
      const padding = isMobile ? 24 : 48;
      setPreviewScale(
        Math.max(
          0.1,
          Math.min(
            (bounds.width - padding) / stageSnapshot.width,
            (bounds.height - padding) / stageSnapshot.height,
          ),
        ),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [isMobile, preview, stageSnapshot]);

  const handleDeleteSelected = useCallback(() => {
    if (!selected) return;
    setNodes((list) => list.filter((node) => node.id !== selected.id));
    setSelectedId(null);
    if (isMobile) {
      setMobilePanel(null);
    }
  }, [isMobile, selected]);

  return (
    <ToastProvider>
      <div className="bld">
        <BuilderToolbar
          nodeCount={nodes.length}
          isMobile={isMobile}
          preview={preview}
          grid={grid}
          canClear={!preview && nodes.length > 0}
          hasSelection={Boolean(selected)}
          mobilePanel={mobilePanel}
          onHome={() => navigate("/")}
          onGrid={() => setGrid((value) => !value)}
          onClear={() => {
            setNodes([]);
            setSelectedId(null);
            if (isMobile) {
              setMobilePanel(null);
            }
          }}
          onPreview={() => {
            if (!preview && stageRef.current) {
              setStageSnapshot({
                width: Math.max(minStageWidth, Math.round(stageRef.current.clientWidth)),
                height: Math.max(minStageHeight, Math.round(stageRef.current.clientHeight)),
              });
            }
            setPreview((value) => !value);
            setSelectedId(null);
            setMobilePanel(null);
          }}
          onToggleComponents={() =>
            setMobilePanel((value) => (value === "components" ? null : "components"))
          }
          onToggleInspector={() =>
            setMobilePanel((value) => (value === "inspector" ? null : "inspector"))
          }
        />

        <div className="bld-bd">
          {!preview && !isMobile ? (
            <ComponentSidebar
              search={search}
              collapsed={collapsed}
              onSearch={setSearch}
              onToggle={(category) =>
                setCollapsed((state) => ({ ...state, [category]: !state[category] }))
              }
              onInsert={addNode}
            />
          ) : null}

          <CanvasStage
            canvasRef={canvasRef}
            stageRef={stageRef}
            isMobile={isMobile}
            preview={preview}
            grid={grid}
            nodes={nodes}
            selectedId={selectedId}
            stageSnapshot={stageSnapshot}
            previewScale={previewScale}
            onDrop={onDrop}
            onCanvasClick={() => {
              if (!preview) {
                setSelectedId(null);
              }
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onSelect={setSelectedId}
            onDrag={(id, ox, oy) => setDrag({ id, ox, oy })}
            onResize={(id, sx, sy, sw, sh) => setResize({ id, sx, sy, sw, sh })}
          />

          {!preview && !isMobile ? (
            <InspectorSidebar
              selected={selected}
              onDelete={handleDeleteSelected}
              onSetProps={(props) => selected && updateProps(selected.id, props)}
              onUpdateNode={(node) => selected && updateNode(selected.id, node)}
            />
          ) : null}

          {!preview && isMobile && mobilePanel ? (
            <>
              <button
                type="button"
                aria-label="Close panel"
                className="bld-panel-backdrop"
                onClick={() => setMobilePanel(null)}
              />
              <section className="bld-panel-shell">
                <div className="bld-panel-head">
                  <div className="bld-panel-copy">
                    <span className="bld-panel-eyebrow">Builder</span>
                    <strong>{mobilePanel === "components" ? "Components" : "Properties"}</strong>
                  </div>
                  <button
                    type="button"
                    className="bld-panel-close"
                    onClick={() => setMobilePanel(null)}
                  >
                    Close
                  </button>
                </div>

                {mobilePanel === "components" ? (
                  <ComponentSidebar
                    search={search}
                    collapsed={collapsed}
                    onSearch={setSearch}
                    onToggle={(category) =>
                      setCollapsed((state) => ({ ...state, [category]: !state[category] }))
                    }
                    onInsert={addNode}
                  />
                ) : (
                  <InspectorSidebar
                    selected={selected}
                    onDelete={handleDeleteSelected}
                    onSetProps={(props) => selected && updateProps(selected.id, props)}
                    onUpdateNode={(node) => selected && updateNode(selected.id, node)}
                  />
                )}
              </section>
            </>
          ) : null}
        </div>

        <style>{BUILDER_CSS}</style>
        <Toaster />
      </div>
    </ToastProvider>
  );
}
