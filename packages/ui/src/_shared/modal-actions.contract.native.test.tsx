import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import TestRenderer, { act } from "react-test-renderer";

vi.mock("react-native", async () => {
  const R = await import("react");
  const host = (name: string) => R.forwardRef<unknown, Record<string, unknown>>(({ children, ...props }, ref) => {
    R.useImperativeHandle(ref, () => ({ kind: name, id: props.testID }), []);
    return R.createElement(`mock-${name}`, props, children as React.ReactNode);
  });
  return { View: host("view"), Pressable: host("pressable"), Text: host("text"), Modal: host("modal") };
});
vi.mock("../icons/index.native", () => ({ CloseIcon: () => null }));

import { Pressable, Text } from "react-native";
import { Sheet, SheetTrigger, SheetClose, SheetContent } from "../sheet/sheet.native";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent } from "../drawer/drawer.native";
import { NativeDirectionContext } from "./direction-context.native";

function render(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element); });
  return tree;
}
function hosts(tree: TestRenderer.ReactTestRenderer, id: string) {
  return tree.root.findAll(node => typeof node.type === "string" && node.props.testID === id);
}
function host(tree: TestRenderer.ReactTestRenderer, id: string) {
  const result = hosts(tree, id)[0];
  if (!result) throw new Error(`Missing native host ${id}`);
  return result;
}
function event() {
  return { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
}
function press(tree: TestRenderer.ReactTestRenderer, id: string) {
  act(() => host(tree, id).props.onPress(event()));
}
function flatten(style: unknown): Record<string, unknown> {
  if (!style) return {};
  return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style as Record<string, unknown>;
}
function hostParent(node: TestRenderer.ReactTestInstance) {
  let parent = node.parent;
  while (parent && typeof parent.type !== "string") parent = parent.parent;
  return parent;
}
function DirectionProbe() {
  return <Text testID="dir-probe">{React.useContext(NativeDirectionContext).dir}</Text>;
}

const families = [
  { name: "sheet", Root: Sheet, Trigger: SheetTrigger, Close: SheetClose, Content: SheetContent },
  { name: "drawer", Root: Drawer, Trigger: DrawerTrigger, Close: DrawerClose, Content: DrawerContent },
] as const;

for (const { name, Root, Trigger, Close, Content } of families) {
  describe(`${name} native interaction contracts`, () => {
    it("opens/closes uncontrolled state and exposes live trigger accessibility state", () => {
      const changed = vi.fn();
      const tree = render(<Root onOpenChange={changed}>
        <Trigger testID="trigger"><Text>Open</Text></Trigger>
        <Content><Close testID="explicit"><Text>Close</Text></Close></Content>
      </Root>);
      expect(host(tree, "trigger").props.accessibilityState).toEqual({ disabled: false, expanded: false });
      press(tree, "trigger");
      expect(hosts(tree, `${name}-content`)).toHaveLength(1);
      expect(host(tree, "trigger").props.accessibilityState.expanded).toBe(true);
      press(tree, "explicit");
      expect(hosts(tree, `${name}-content`)).toHaveLength(0);
      expect(changed.mock.calls).toEqual([[true], [false]]);
      act(() => tree.unmount());
    });

    it.each(["trigger", "close"] as const)("guards a disabled %s before caller callbacks", action => {
      const caller = vi.fn(), changed = vi.fn();
      const Action = action === "trigger" ? Trigger : Close;
      const tree = render(<Root defaultOpen={action === "close"} onOpenChange={changed}>
        <Action testID="action" disabled onPress={caller} accessibilityState={{ busy: true, disabled: false }}><Text>Action</Text></Action>
        <Content />
      </Root>);
      press(tree, "action");
      expect(caller).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
      expect(host(tree, "action").props.accessibilityState).toMatchObject({ busy: true, disabled: true });
      act(() => tree.unmount());
    });

    it.each(["trigger", "close"] as const)("honors caller cancellation on %s before changing state", action => {
      const caller = vi.fn(e => e.preventDefault()), changed = vi.fn();
      const Action = action === "trigger" ? Trigger : Close;
      const tree = render(<Root defaultOpen={action === "close"} onOpenChange={changed}>
        <Action testID="action" onPress={caller}><Text>Action</Text></Action><Content />
      </Root>);
      press(tree, "action");
      expect(caller).toHaveBeenCalledOnce();
      expect(changed).not.toHaveBeenCalled();
      expect(hosts(tree, `${name}-content`)).toHaveLength(action === "close" ? 1 : 0);
      act(() => tree.unmount());
    });

    it.each(["trigger", "close"] as const)("composes child, parent, state in order for asChild %s", action => {
      const order: string[] = [];
      const Action = action === "trigger" ? Trigger : Close;
      const tree = render(<Root defaultOpen={action === "close"} onOpenChange={() => order.push("state")}>
        <Action asChild onPress={() => order.push("parent")}>
          <Pressable testID="child" onPress={() => order.push("child")}><Text>Action</Text></Pressable>
        </Action><Content />
      </Root>);
      press(tree, "child");
      expect(order).toEqual(["child", "parent", "state"]);
      act(() => tree.unmount());
    });

    it.each(["child", "parent"] as const)("stops the asChild chain when %s cancels", canceller => {
      const order: string[] = [], changed = vi.fn();
      const tree = render(<Root onOpenChange={changed}>
        <Trigger asChild onPress={e => { order.push("parent"); if (canceller === "parent") e.preventDefault(); }}>
          <Pressable testID="child" onPress={e => { order.push("child"); if (canceller === "child") e.preventDefault(); }}><Text>Open</Text></Pressable>
        </Trigger><Content />
      </Root>);
      press(tree, "child");
      expect(order).toEqual(canceller === "child" ? ["child"] : ["child", "parent"]);
      expect(changed).not.toHaveBeenCalled();
      act(() => tree.unmount());
    });

    it.each(["child", "parent"] as const)("ORs %s disabled into asChild guards and preserves accessibility metadata", disabledAt => {
      const child = vi.fn(), parent = vi.fn(), changed = vi.fn();
      const tree = render(<Root onOpenChange={changed}>
        <Trigger asChild disabled={disabledAt === "parent"} onPress={parent} accessibilityState={{ busy: true, expanded: true }}>
          <Pressable testID="child" disabled={disabledAt === "child"} accessibilityRole="link"
            accessibilityState={{ selected: true, disabled: false }} onPress={child}><Text>Open</Text></Pressable>
        </Trigger><Content />
      </Root>);
      press(tree, "child");
      expect(child).not.toHaveBeenCalled(); expect(parent).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
      expect(host(tree, "child").props.accessibilityRole).toBe("link");
      expect(host(tree, "child").props.accessibilityState).toEqual({ selected: true, busy: true, disabled: true, expanded: false });
      act(() => tree.unmount());
    });

    it("evaluates both functional asChild styles with the same press state", () => {
      const parent = vi.fn(({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.4 : 1 }));
      const child = vi.fn(({ pressed }: { pressed: boolean }) => ({ backgroundColor: pressed ? "red" : "blue" }));
      const tree = render(<Root><Trigger asChild style={parent}>
        <Pressable testID="child" style={child}><Text>Open</Text></Pressable>
      </Trigger><Content /></Root>);
      const state = { pressed: true };
      expect(flatten(host(tree, "child").props.style(state))).toEqual({ opacity: 0.4, backgroundColor: "red", direction: "ltr" });
      expect(parent).toHaveBeenCalledExactlyOnceWith(state); expect(child).toHaveBeenCalledExactlyOnceWith(state);
      act(() => tree.unmount());
    });

    it("forwards both asChild refs and performs React 19 cleanup exactly once", () => {
      const object = React.createRef<React.ElementRef<typeof Pressable>>();
      const cleanup = vi.fn(), childRef = vi.fn(() => cleanup);
      const tree = render(<Root><Trigger asChild ref={object}>
        <Pressable testID="child" ref={childRef}><Text>Open</Text></Pressable>
      </Trigger><Content /></Root>);
      expect(object.current).toEqual({ kind: "pressable", id: "child" });
      expect(childRef).toHaveBeenCalledOnce();
      act(() => tree.unmount());
      expect(object.current).toBeNull(); expect(cleanup).toHaveBeenCalledOnce(); expect(childRef).toHaveBeenCalledOnce();
    });

    it("detaches a void callback ref while honoring a different cleanup callback", () => {
      const parentRef = vi.fn((_node: unknown) => {}), cleanup = vi.fn();
      const childRef = vi.fn(() => cleanup);
      const tree = render(<Root><Trigger asChild ref={parentRef}>
        <Pressable testID="child" ref={childRef}><Text>Open</Text></Pressable>
      </Trigger><Content /></Root>);
      act(() => tree.unmount());
      expect(parentRef.mock.calls).toEqual([[{ kind: "pressable", id: "child" }], [null]]);
      expect(cleanup).toHaveBeenCalledOnce();
    });

    it("notifies controlled requests without changing the rendered open prop", () => {
      const changed = vi.fn();
      const view = (open: boolean) => <Root open={open} onOpenChange={changed}>
        <Trigger testID="trigger"><Text>Open</Text></Trigger><Content><Close testID="explicit"><Text>Close</Text></Close></Content>
      </Root>;
      const tree = render(view(false));
      press(tree, "trigger"); expect(changed).toHaveBeenLastCalledWith(true); expect(hosts(tree, `${name}-content`)).toHaveLength(0);
      act(() => tree.update(view(true)));
      press(tree, "explicit"); expect(changed).toHaveBeenLastCalledWith(false); expect(hosts(tree, `${name}-content`)).toHaveLength(1);
      act(() => tree.unmount());
    });

    it("keeps caller Modal observers and composes system dismissal instead of replacing it", () => {
      const request = vi.fn(), show = vi.fn(), dismiss = vi.fn(), changed = vi.fn();
      const tree = render(<Root defaultOpen onOpenChange={changed}><Content modalProps={{ onRequestClose: request, onShow: show, onDismiss: dismiss, animationType: "slide" }} /></Root>);
      const modal = host(tree, `${name}-modal`);
      expect(modal.props).toMatchObject({ transparent: true, visible: true, animationType: "slide", onShow: show, onDismiss: dismiss });
      const e = event(); act(() => modal.props.onRequestClose(e));
      expect(request).toHaveBeenCalledExactlyOnceWith(e); expect(changed).toHaveBeenCalledExactlyOnceWith(false);
      expect(hosts(tree, `${name}-content`)).toHaveLength(0);
      act(() => tree.unmount());
    });

    it("honors cancellation of system dismissal", () => {
      const changed = vi.fn();
      const tree = render(<Root defaultOpen onOpenChange={changed}>
        <Content modalProps={{ onRequestClose: e => e.preventDefault() }} />
      </Root>);
      act(() => host(tree, `${name}-modal`).props.onRequestClose(event()));
      expect(changed).not.toHaveBeenCalled(); expect(hosts(tree, `${name}-content`)).toHaveLength(1);
      act(() => tree.unmount());
    });

    it("blocks ambient dismissal while retaining an explicit close path", () => {
      const request = vi.fn(), escape = vi.fn(), changed = vi.fn();
      const tree = render(<Root defaultOpen onOpenChange={changed}>
        <Content dismissible={false} onAccessibilityEscape={escape} modalProps={{ onRequestClose: request }}>
          <Close testID="explicit"><Text>Close</Text></Close>
        </Content>
      </Root>);
      press(tree, `${name}-overlay`);
      act(() => host(tree, `${name}-modal`).props.onRequestClose(event()));
      act(() => host(tree, `${name}-content`).props.onAccessibilityEscape());
      expect(request).toHaveBeenCalledOnce(); expect(escape).toHaveBeenCalledOnce(); expect(changed).not.toHaveBeenCalled();
      press(tree, "explicit"); expect(changed).toHaveBeenCalledExactlyOnceWith(false);
      act(() => tree.unmount());
    });

    it.each(["backdrop", "escape"] as const)("dismisses through %s when allowed", via => {
      const escape = vi.fn();
      const tree = render(<Root defaultOpen><Content onAccessibilityEscape={escape} /></Root>);
      if (via === "backdrop") press(tree, `${name}-overlay`);
      else act(() => host(tree, `${name}-content`).props.onAccessibilityEscape());
      expect(hosts(tree, `${name}-content`)).toHaveLength(0);
      expect(escape).toHaveBeenCalledTimes(via === "escape" ? 1 : 0);
      act(() => tree.unmount());
    });

    it("renders backdrop and content as siblings and keeps content refs on the panel", () => {
      const ref = React.createRef<React.ElementRef<typeof SheetContent>>();
      const tree = render(<Root defaultOpen><Content ref={ref}><Text>Body</Text></Content></Root>);
      expect(hostParent(host(tree, `${name}-overlay`))).toBe(hostParent(host(tree, `${name}-content`)));
      expect(ref.current).toEqual({ kind: "view", id: `${name}-content` });
      expect(host(tree, `${name}-content`).props.accessibilityViewIsModal).toBe(true);
      act(() => tree.unmount()); expect(ref.current).toBeNull();
    });

    it("labels the close action, supports hiding it, and keeps explicit close available", () => {
      const tree = render(<Root defaultOpen><Content closeLabel="Dismiss surface" /></Root>);
      expect(host(tree, `${name}-close`).props.accessibilityLabel).toBe("Dismiss surface");
      act(() => tree.update(<Root defaultOpen><Content hideClose><Close testID="explicit"><Text>Done</Text></Close></Content></Root>));
      expect(hosts(tree, `${name}-close`)).toHaveLength(0);
      press(tree, "explicit"); expect(hosts(tree, `${name}-content`)).toHaveLength(0);
      act(() => tree.unmount());
    });

    it("inherits direction, updates explicit RTL, and keeps physical side right", () => {
      const inherited = { dir: "rtl" as const, setDir: vi.fn(), toggleDir: vi.fn() };
      const view = (dir?: "ltr" | "rtl") => <NativeDirectionContext.Provider value={inherited}>
        <Root defaultOpen dir={dir}><Trigger testID="directed-trigger"><Text>Open</Text></Trigger><Content side="right"><DirectionProbe /></Content></Root>
      </NativeDirectionContext.Provider>;
      const tree = render(view());
      expect(flatten(host(tree, `${name}-content`).props.style)).toMatchObject({ right: 0, direction: "rtl", borderLeftWidth: 1 });
      expect(flatten(host(tree, `${name}-close`).props.style)).toMatchObject({ left: 16 });
      expect(host(tree, "dir-probe").props.children).toBe("rtl");
      expect(flatten(host(tree, "directed-trigger").props.style).direction).toBe("rtl");
      act(() => tree.update(view("ltr")));
      expect(flatten(host(tree, `${name}-content`).props.style)).toMatchObject({ right: 0, direction: "ltr" });
      expect(flatten(host(tree, `${name}-close`).props.style)).toMatchObject({ right: 16 });
      expect(host(tree, "dir-probe").props.children).toBe("ltr");
      expect(flatten(host(tree, "directed-trigger").props.style).direction).toBe("ltr");
      act(() => tree.unmount());
    });
  });
}

describe("Drawer native root configuration", () => {
  it.each(["top", "right", "bottom", "left"] as const)("honors root direction %s and updates without remounting", side => {
    const tree = render(<Drawer defaultOpen direction="bottom"><DrawerContent /></Drawer>);
    act(() => tree.update(<Drawer defaultOpen direction={side}><DrawerContent /></Drawer>));
    const style = flatten(host(tree, "drawer-content").props.style);
    expect(style[side]).toBe(0);
    expect(style.position).toBe("absolute");
    expect(style[side === "left" || side === "right" ? "maxWidth" : "maxHeight"]).toBe(side === "left" || side === "right" ? 420 : "100%");
    act(() => tree.unmount());
  });
  it("lets content side override root direction", () => {
    const tree = render(<Drawer defaultOpen direction="left"><DrawerContent side="top" /></Drawer>);
    expect(flatten(host(tree, "drawer-content").props.style)).toMatchObject({ top: 0, left: 0, right: 0, maxHeight: "100%" });
    act(() => tree.unmount());
  });
  it("honors root dismissible and lets an explicit content override restore dismissal", () => {
    const tree = render(<Drawer defaultOpen dismissible={false}><DrawerContent /></Drawer>);
    press(tree, "drawer-overlay"); expect(hosts(tree, "drawer-content")).toHaveLength(1);
    act(() => tree.update(<Drawer defaultOpen dismissible={false}><DrawerContent dismissible /></Drawer>));
    press(tree, "drawer-overlay"); expect(hosts(tree, "drawer-content")).toHaveLength(0);
    act(() => tree.unmount());
  });
});
