import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { SplitNode } from "@synthex/core";

export interface SplitViewProps {
  readonly split: SplitNode;
  readonly children: readonly ReactNode[];
  readonly selectedNodeId?: string | null;
  readonly onResize?: (sizes: readonly number[]) => void;
}

const containerBaseStyle: CSSProperties = {
  display: "flex",
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  gap: "6px",
};

export function SplitView({ split, children, selectedNodeId, onResize }: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isHorizontal = split.direction === "horizontal";

  return (
    <div
      ref={containerRef}
      style={{
        ...containerBaseStyle,
        flexDirection: isHorizontal ? "row" : "column",
        outline: selectedNodeId === split.id ? "1px solid #60a5fa" : "none",
        outlineOffset: 0,
      }}
    >
      {children.map((child, index) => {
        const ratio = split.sizes[index] ?? 1 / children.length;

        return (
          <FragmentWithHandle
            key={split.children[index]?.id ?? index}
            index={index}
            ratio={ratio}
            isHorizontal={isHorizontal}
            childCount={children.length}
            onResize={onResize}
            split={split}
            containerRef={containerRef}
          >
            {child}
          </FragmentWithHandle>
        );
      })}
    </div>
  );
}

interface FragmentWithHandleProps {
  readonly childCount: number;
  readonly children: ReactNode;
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
  readonly index: number;
  readonly isHorizontal: boolean;
  readonly onResize?: (sizes: readonly number[]) => void;
  readonly ratio: number;
  readonly split: SplitNode;
}

function FragmentWithHandle({
  childCount,
  children,
  containerRef,
  index,
  isHorizontal,
  onResize,
  ratio,
  split,
}: FragmentWithHandleProps) {
  const isLast = index === childCount - 1;

  return (
    <>
      <div
        style={{
          flex: `${ratio} 1 0`,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
        }}
      >
        {children}
      </div>
      {!isLast ? (
        <button
          type="button"
          aria-label="Resize split"
          onMouseDown={(event) => {
            event.preventDefault();

            const container = containerRef.current;

            if (!container || !onResize) {
              return;
            }

            const rect = container.getBoundingClientRect();
            const totalSize = isHorizontal ? rect.width : rect.height;

            if (totalSize <= 0) {
              return;
            }

            const startPointer = isHorizontal ? event.clientX : event.clientY;
            const initialSizes = [...split.sizes];

            const handlePointerMove = (moveEvent: MouseEvent) => {
              const currentPointer = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
              const deltaRatio = (currentPointer - startPointer) / totalSize;
              const nextSizes = [...initialSizes];
              const first = Math.max(0.1, initialSizes[index]! + deltaRatio);
              const second = Math.max(0.1, initialSizes[index + 1]! - deltaRatio);
              const total = first + second;
              nextSizes[index] =
                (first / total) * (initialSizes[index]! + initialSizes[index + 1]!);
              nextSizes[index + 1] =
                (second / total) * (initialSizes[index]! + initialSizes[index + 1]!);
              onResize(nextSizes);
            };

            const handlePointerUp = () => {
              window.removeEventListener("mousemove", handlePointerMove);
              window.removeEventListener("mouseup", handlePointerUp);
            };

            window.addEventListener("mousemove", handlePointerMove);
            window.addEventListener("mouseup", handlePointerUp, { once: true });
          }}
          style={{
            flex: "0 0 auto",
            width: isHorizontal ? "6px" : "100%",
            height: isHorizontal ? "100%" : "6px",
            border: 0,
            background: "#d4d4d8",
            cursor: isHorizontal ? "col-resize" : "row-resize",
            padding: 0,
          }}
        />
      ) : null}
    </>
  );
}
