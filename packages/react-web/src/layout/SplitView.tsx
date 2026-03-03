import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { SplitNode } from "@luseefor/synthex-core";
import { resolveWorkbenchSurface, resolveWorkbenchTheme, type LayoutRendererThemeProps } from "./theme";

export interface SplitViewProps extends LayoutRendererThemeProps {
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
};

export function SplitView({ split, children, selectedNodeId, onResize, theme: themeOverrides }: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const theme = resolveWorkbenchTheme(themeOverrides);
  const isHorizontal = split.direction === "horizontal";

  return (
    <div
      ref={containerRef}
      data-layout-direction={split.direction}
      style={{
        ...containerBaseStyle,
        flexDirection: isHorizontal ? "row" : "column",
        background: resolveWorkbenchSurface(theme, "canvas"),
        outline: selectedNodeId === split.id ? `1px solid ${theme.selectedBorderColor}` : "none",
        boxShadow: selectedNodeId === split.id ? `inset 0 0 0 1px ${theme.selectedBorderColor}` : "none",
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
            theme={theme}
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
  readonly theme: ReturnType<typeof resolveWorkbenchTheme>;
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
  theme,
}: FragmentWithHandleProps) {
  const isLast = index === childCount - 1;
  const [isHovered, setIsHovered] = useState(false);

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
            width: isHorizontal ? "14px" : "100%",
            height: isHorizontal ? "100%" : "14px",
            border: 0,
            background: theme.resizeHandleBackground,
            cursor: isHorizontal ? "col-resize" : "row-resize",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: isHorizontal ? "2px" : "28px",
              height: isHorizontal ? "28px" : "2px",
              borderRadius: 999,
              background: isHovered ? theme.resizeHandleHoverColor : theme.resizeHandleColor,
              transition: "background-color 120ms ease",
            }}
          />
        </button>
      ) : null}
    </>
  );
}
