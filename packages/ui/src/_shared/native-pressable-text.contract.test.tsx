import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("react-native", () => {
  const R = require("react") as typeof React;
  const host = (name: string) => R.forwardRef(({ children, ...props }: any, ref: any) => R.createElement(name, { ...props, ref }, children));
  return { Pressable: host("native-pressable"), Text: host("native-text"), View: host("native-view") };
});
import { View } from "react-native";
import { NativePressableAction } from "./pressable.native";

function violations(node: any): string[] {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(violations);
  return (node.children ?? []).flatMap((child: any): string[] =>
    typeof child === "string" ? node.type === "native-text" ? [] : [child] : violations(child));
}

for (const activation of ["press", "longPress"] as const) {
  describe(`native ${activation} action labels`, () => {
    it("wraps fragment text while preserving icons and activation", () => {
      const onAction = vi.fn();
      let tree!: TestRenderer.ReactTestRenderer;
      act(() => { tree = TestRenderer.create(
        <NativePressableAction defaultTestID="action" activation={activation} onAction={onAction}>
          <>Open {2}<View testID="icon" /></>
        </NativePressableAction>,
      ); });
      expect(violations(tree.toJSON())).toEqual([]);
      const pressable = tree.root.find(node => String(node.type) === "native-pressable");
      act(() => { pressable.props[activation === "press" ? "onPress" : "onLongPress"]({ defaultPrevented: false }); });
      expect(onAction).toHaveBeenCalledOnce();
      const texts = tree.root.findAll(node => String(node.type) === "native-text");
      expect(texts).toHaveLength(1);
      expect(texts[0]!.findAll(node => String(node.type) === "native-view")).toHaveLength(0);
      act(() => { tree.unmount(); });
    });
  });
}
