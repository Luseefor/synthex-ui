import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
const state = vi.hoisted(() => ({ frames: new Map<string, { x: number; y: number; width: number; height: number }>(), dismiss: vi.fn() }));
vi.mock("react-native", () => {
  const R = require("react") as typeof React;
  const host = (tag: string) => R.forwardRef(({ children, ...props }: any, ref: any) => R.createElement(tag, { ...props, ref }, children));
  const flatten = (v: any): any => Array.isArray(v) ? Object.assign({}, ...v.filter(Boolean).map(flatten)) : v ?? {};
  return { Pressable: host("rn-pressable"), View: host("rn-view"), Text: host("rn-text"), TextInput: host("rn-input"), SafeAreaView: host("rn-safe"),
    KeyboardAvoidingView: host("rn-kav"), ScrollView: host("rn-scroll"),
    Modal: ({ children, visible, ...props }: any) => visible ? R.createElement("rn-modal", props, children) : null,
    useWindowDimensions: () => ({ width: 400, height: 700, scale: 1, fontScale: 1 }),
    Platform: { OS: "ios" }, Keyboard: { dismiss: state.dismiss }, StyleSheet: { flatten, create: (v: any) => v } };
});
vi.mock("../icons/index.native", () => ({ CheckIcon: () => null, ChevronRightIcon: () => null, SearchIcon: () => null }));
import { Pressable, Text, StyleSheet } from "react-native";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem,
  ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSub, ContextMenuSubTrigger } from "../context-menu/context-menu.native";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../hover-card/hover-card.native";
import { Tooltip, TooltipTrigger, TooltipContent } from "../tooltip/tooltip.native";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "../navigation-menu/navigation-menu.native";
import { Command, CommandItem, CommandEmpty } from "../command/command.native";
import { NativeDirectionContext } from "./direction-context.native";

type RootProps = React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; dir?: "ltr" | "rtl" }>;
function NavRoot({ children, open, defaultOpen, onOpenChange, dir }: RootProps) {
  return <NavigationMenu dir={dir} value={open === undefined ? undefined : open ? "item" : ""}
    defaultValue={defaultOpen ? "item" : ""} onValueChange={v => onOpenChange?.(v !== "")}>
    <NavigationMenuItem value="item">{children}</NavigationMenuItem>
  </NavigationMenu>;
}
const families = [
  { name: "context-menu", Root: ContextMenu, Trigger: ContextMenuTrigger, Content: ContextMenuContent, activation: "onLongPress", text: false },
  { name: "hover-card", Root: HoverCard, Trigger: HoverCardTrigger, Content: HoverCardContent, activation: "onPress", text: false },
  { name: "tooltip", Root: Tooltip, Trigger: TooltipTrigger, Content: TooltipContent, activation: "onPress", text: true },
  { name: "navigation-menu", Root: NavRoot, Trigger: NavigationMenuTrigger, Content: NavigationMenuContent, activation: "onPress", text: false },
] as const;
const trees = new Set<TestRenderer.ReactTestRenderer>();
function render(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element, { createNodeMock: element => {
    const id = (element.props as { testID?: string }).testID ?? "";
    return { id, kind: element.type, measureInWindow(callback: (x: number, y: number, w: number, h: number) => void) {
      const f = state.frames.get(id) ?? { x: 0, y: 0, width: 400, height: 700 }; callback(f.x, f.y, f.width, f.height);
    } };
  } }); });
  trees.add(tree); return tree;
}
function hosts(tree: TestRenderer.ReactTestRenderer, id: string) {
  return tree.root.findAll(n => typeof n.type === "string" && n.props.testID === id);
}
function host(tree: TestRenderer.ReactTestRenderer, id: string) {
  const result = hosts(tree, id)[0]; if (!result) throw new Error("Missing host " + id); return result;
}
function event() { return { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } }; }
function fire(tree: TestRenderer.ReactTestRenderer, id: string, action = "onPress") { act(() => host(tree, id).props[action]?.(event())); }
function layout(tree: TestRenderer.ReactTestRenderer, id: string, width = 180, height = 100) {
  act(() => host(tree, id).props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width, height } } }));
}
function dirProbe() { return <Text testID="dir-probe">{React.useContext(NativeDirectionContext).dir}</Text>; }
const DirProbe = dirProbe;
beforeEach(() => { state.frames.clear(); state.dismiss.mockClear(); state.frames.set("trigger", { x: 100, y: 120, width: 80, height: 40 }); });
afterEach(() => { act(() => { for (const tree of trees) tree.unmount(); }); trees.clear(); });

for (const { name, Root, Trigger, Content, activation, text } of families) {
  const surface = text ? "content-surface" : "content";
  describe(`${name} native overlay contracts`, () => {
    it("opens an anchored modal with forwarded side/align/offset props and no in-flow content", () => {
      const tree = render(<Root><Trigger testID="trigger"><Text>Open</Text></Trigger>
        <Content testID="content" side="right" align="end" sideOffset={10} alignOffset={3}
          {...(text ? { containerStyle: { width: 180 } } : { style: { width: 180 } })}><Text>Body</Text></Content>
      </Root>);
      expect(hosts(tree, surface + "-modal")).toHaveLength(0);
      fire(tree, "trigger", activation); layout(tree, surface);
      expect(host(tree, surface + "-modal").props).toMatchObject({ transparent: true, presentationStyle: "overFullScreen" });
      expect(host(tree, surface + "-positioner").props.style).toMatchObject({ left: 190, top: 63, width: 180, maxHeight: 100 });
      expect(host(tree, "trigger").props.accessibilityState).toMatchObject({ disabled: false, expanded: true });
    });
    it.each(["outside", "back", "escape"] as const)("dismisses through %s", via => {
      const changed = vi.fn();
      const tree = render(<Root onOpenChange={changed}><Trigger testID="trigger"><Text>Open</Text></Trigger><Content testID="content"><Text>Body</Text></Content></Root>);
      fire(tree, "trigger", activation);
      if (via === "outside") fire(tree, surface + "-overlay");
      else if (via === "back") act(() => host(tree, surface + "-modal").props.onRequestClose(event()));
      else act(() => host(tree, surface).props.onAccessibilityEscape());
      expect(hosts(tree, surface + "-modal")).toHaveLength(0);
      expect(changed.mock.calls).toEqual([[true], [false]]); expect(state.dismiss).toHaveBeenCalledOnce();
    });
    it("guards disabled before callers and preserves accessibility metadata", () => {
      const caller = vi.fn(), changed = vi.fn();
      const tree = render(<Root onOpenChange={changed}><Trigger testID="trigger" disabled
        {...{ [activation]: caller }} accessibilityState={{ busy: true, disabled: false, expanded: true }}><Text>Open</Text></Trigger>
        <Content testID="content"><Text>Body</Text></Content></Root>);
      fire(tree, "trigger", activation);
      expect(caller).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
      expect(host(tree, "trigger").props.accessibilityState).toMatchObject({ busy: true, disabled: true, expanded: false });
    });
    it("honors normal caller cancellation before changing state", () => {
      const changed = vi.fn();
      const tree = render(<Root onOpenChange={changed}><Trigger testID="trigger" {...{ [activation]: (e: ReturnType<typeof event>) => e.preventDefault() }}><Text>Open</Text></Trigger>
        <Content testID="content"><Text>Body</Text></Content></Root>);
      fire(tree, "trigger", activation); expect(changed).not.toHaveBeenCalled(); expect(hosts(tree, surface + "-modal")).toHaveLength(0);
    });
    it.each(["none", "child", "parent"] as const)("composes asChild activation with %s cancellation", canceller => {
      const order: string[] = [];
      const handler = (who: "child" | "parent") => (e: ReturnType<typeof event>) => { order.push(who); if (who === canceller) e.preventDefault(); };
      const tree = render(<Root onOpenChange={() => order.push("state")}><Trigger asChild {...{ [activation]: handler("parent") }}>
        <Pressable testID="trigger" {...{ [activation]: handler("child") }}><Text>Open</Text></Pressable>
      </Trigger><Content testID="content"><Text>Body</Text></Content></Root>);
      fire(tree, "trigger", activation);
      expect(order).toEqual(canceller === "child" ? ["child"] : canceller === "parent" ? ["child", "parent"] : ["child", "parent", "state"]);
    });
    it("ORs child disabled and preserves its ref, role and styles", () => {
      const caller = vi.fn(), changed = vi.fn(), ref = React.createRef<React.ElementRef<typeof Pressable>>();
      const tree = render(<Root onOpenChange={changed}><Trigger asChild style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        <Pressable testID="trigger" ref={ref} disabled accessibilityRole="link" style={({ pressed }) => ({ backgroundColor: pressed ? "red" : "blue" })}
          {...{ [activation]: caller }}><Text>Open</Text></Pressable>
      </Trigger><Content testID="content"><Text>Body</Text></Content></Root>);
      fire(tree, "trigger", activation); expect(caller).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
      expect(ref.current).not.toBeNull(); expect(host(tree, "trigger").props.accessibilityRole).toBe("link");
      expect(StyleSheet.flatten(host(tree, "trigger").props.style({ pressed: true }))).toMatchObject({ opacity: 0.5, backgroundColor: "red" });
      act(() => tree.unmount()); trees.delete(tree); expect(ref.current).toBeNull();
    });
    it("composes cleanup and void refs without detaching on direction changes", () => {
      const parent = vi.fn((_node: unknown) => {}), cleanup = vi.fn(), child = vi.fn(() => cleanup);
      const view = (dir: "ltr" | "rtl") => <Root dir={dir}><Trigger asChild ref={parent}><Pressable testID="trigger" ref={child}><Text>Open</Text></Pressable></Trigger><Content testID="content"><Text>Body</Text></Content></Root>;
      const tree = render(view("ltr"));
      expect(parent).toHaveBeenCalledOnce(); expect(child).toHaveBeenCalledOnce();
      act(() => tree.update(view("rtl"))); expect(cleanup).not.toHaveBeenCalled();
      act(() => tree.unmount()); trees.delete(tree);
      expect(cleanup).toHaveBeenCalledOnce(); expect(parent.mock.calls.at(-1)).toEqual([null]); expect(child).toHaveBeenCalledOnce();
    });
    it("honors controlled requests without mutating rendered state", () => {
      const changed = vi.fn();
      const view = (open: boolean) => <Root open={open} onOpenChange={changed}><Trigger testID="trigger"><Text>Open</Text></Trigger><Content testID="content"><Text>Body</Text></Content></Root>;
      const tree = render(view(false)); fire(tree, "trigger", activation);
      expect(changed).toHaveBeenCalledWith(true); expect(hosts(tree, surface + "-modal")).toHaveLength(0);
      act(() => tree.update(view(true))); fire(tree, surface + "-overlay");
      expect(changed).toHaveBeenLastCalledWith(false); expect(hosts(tree, surface + "-modal")).toHaveLength(1);
    });
    it("inherits explicit RTL into the surface, trigger and nested context", () => {
      const tree = render(<Root defaultOpen dir="rtl"><Trigger testID="trigger"><Text>Open</Text></Trigger><Content testID="content"><DirProbe /></Content></Root>);
      expect(StyleSheet.flatten(host(tree, surface).props.style).direction).toBe("rtl");
      const triggerStyle = host(tree, "trigger").props.style;
      expect(StyleSheet.flatten(typeof triggerStyle === "function" ? triggerStyle({ pressed: false }) : triggerStyle).direction).toBe("rtl");
      expect(host(tree, "dir-probe").props.children).toBe("rtl");
    });
    it("preserves the public content host ref (Text for Tooltip, View for other families)", () => {
      const ref = React.createRef<any>();
      const tree = render(<Root defaultOpen><Trigger testID="trigger"><Text>Open</Text></Trigger><Content testID="content" ref={ref}><Text>Body</Text></Content></Root>);
      expect(ref.current).toMatchObject({ id: "content", kind: text ? "rn-text" : "rn-view" });
      act(() => tree.unmount()); trees.delete(tree); expect(ref.current).toBeNull();
    });
  });
}

describe("native activation and multi-item navigation", () => {
  it("routes Tooltip escape through its portable surface after the caller observer", () => {
    const order: string[] = [];
    const tree = render(<Tooltip defaultOpen onOpenChange={() => order.push("close")}>
      <TooltipTrigger><Text>Help</Text></TooltipTrigger>
      <TooltipContent testID="tip" onAccessibilityEscape={() => order.push("caller")}>Hint</TooltipContent>
    </Tooltip>);
    expect(host(tree, "tip").props.onAccessibilityEscape).toBeUndefined();
    act(() => host(tree, "tip-surface").props.onAccessibilityEscape());
    expect(order).toEqual(["caller", "close"]);
    expect(hosts(tree, "tip-surface-modal")).toHaveLength(0);
    expect(state.dismiss).toHaveBeenCalledOnce();
  });
  it("keeps ContextMenu long-press only", () => {
    const tree = render(<ContextMenu><ContextMenuTrigger testID="trigger"><Text>Menu</Text></ContextMenuTrigger><ContextMenuContent testID="content" /></ContextMenu>);
    fire(tree, "trigger", "onPress"); expect(hosts(tree, "content-modal")).toHaveLength(0);
    fire(tree, "trigger", "onLongPress"); expect(hosts(tree, "content-modal")).toHaveLength(1);
  });
  it.each(["tooltip", "hover-card"] as const)("uses tap toggle for %s without press-in/hover takeover or phantom long-press", name => {
    const item = families.find(f => f.name === name)!;
    const { Root, Trigger, Content } = item;
    const inObserver = vi.fn(), outObserver = vi.fn(), hoverObserver = vi.fn();
    const tree = render(<Root><Trigger testID="trigger" onPressIn={inObserver} onPressOut={outObserver} onHoverIn={hoverObserver}><Text>Info</Text></Trigger><Content testID="content"><Text>Info</Text></Content></Root>);
    fire(tree, "trigger", "onPressIn"); fire(tree, "trigger", "onPressOut"); fire(tree, "trigger", "onHoverIn");
    expect(inObserver).toHaveBeenCalledOnce(); expect(outObserver).toHaveBeenCalledOnce(); expect(hoverObserver).toHaveBeenCalledOnce();
    expect(hosts(tree, (item.text ? "content-surface" : "content") + "-modal")).toHaveLength(0);
    expect(host(tree, "trigger").props.onLongPress).toBeUndefined();
    fire(tree, "trigger"); fire(tree, "trigger");
    expect(hosts(tree, (item.text ? "content-surface" : "content") + "-modal")).toHaveLength(0);
  });
  it("anchors each NavigationMenu item to its own trigger, including externally switched selection", () => {
    state.frames.set("first", { x: 20, y: 40, width: 80, height: 40 });
    state.frames.set("second", { x: 220, y: 140, width: 80, height: 40 });
    const view = (value: string, dir: "ltr" | "rtl" = "ltr") => <NavigationMenu value={value} dir={dir} orientation="vertical">
      <NavigationMenuList testID="list">{["first", "second"].map(id => <NavigationMenuItem key={id} value={id}>
        <NavigationMenuTrigger testID={id}>{id}</NavigationMenuTrigger>
        <NavigationMenuContent testID={id + "-content"} style={{ width: 100 }}><Text>{id}</Text></NavigationMenuContent>
      </NavigationMenuItem>)}</NavigationMenuList>
    </NavigationMenu>;
    const tree = render(view("first")); layout(tree, "first-content", 100, 60);
    expect(host(tree, "first-content-positioner").props.style).toMatchObject({ left: 20, top: 88 });
    expect(StyleSheet.flatten(host(tree, "list").props.style).flexDirection).toBe("column");
    act(() => tree.update(view("second", "rtl"))); layout(tree, "second-content", 100, 60);
    expect(hosts(tree, "first-content-modal")).toHaveLength(0);
    expect(host(tree, "second-content-positioner").props.style).toMatchObject({ left: 200, top: 188 });
  });
  it.each(["disabled", "cancelled", "enabled"] as const)("guards %s NavigationMenuLink and composes asChild ref/handler order", mode => {
    const order: string[] = [], ref = React.createRef<React.ElementRef<typeof NavigationMenuLink>>();
    const tree = render(<NavigationMenu defaultValue="item" onValueChange={() => order.push("close")}><NavigationMenuItem value="item">
      <NavigationMenuTrigger>Open</NavigationMenuTrigger><NavigationMenuContent testID="content">
        <NavigationMenuLink asChild ref={ref} disabled={mode === "disabled"} onPress={e => { order.push("parent"); if (mode === "cancelled") e.preventDefault(); }}>
          <Pressable testID="link" onPress={() => order.push("child")}><Text>Destination</Text></Pressable>
        </NavigationMenuLink>
      </NavigationMenuContent></NavigationMenuItem></NavigationMenu>);
    expect(ref.current).not.toBeNull(); expect(host(tree, "link").props.accessibilityRole).toBe("link");
    fire(tree, "link"); expect(order).toEqual(mode === "disabled" ? [] : mode === "cancelled" ? ["child", "parent"] : ["child", "parent", "close"]);
    expect(hosts(tree, "content-modal")).toHaveLength(mode === "enabled" ? 0 : 1);
  });
  it.each(["disabled", "cancelled", "enabled"] as const)("guards %s ContextMenuItem selection", mode => {
    const caller = vi.fn(e => { if (mode === "cancelled") e.preventDefault(); });
    const tree = render(<ContextMenu defaultOpen><ContextMenuTrigger>Menu</ContextMenuTrigger><ContextMenuContent testID="content">
      <ContextMenuItem testID="item" disabled={mode === "disabled"} onPress={caller}>Action</ContextMenuItem>
    </ContextMenuContent></ContextMenu>);
    fire(tree, "item"); expect(caller).toHaveBeenCalledTimes(mode === "disabled" ? 0 : 1);
    expect(hosts(tree, "content-modal")).toHaveLength(mode === "enabled" ? 0 : 1);
  });
  it.each(["checkbox", "radio", "submenu"] as const)("guards cancelled and disabled ContextMenu %s aliases before state changes", kind => {
    const changed = vi.fn();
    const view = (disabled: boolean) => <ContextMenu defaultOpen><ContextMenuContent>
      {kind === "checkbox" ? <ContextMenuCheckboxItem testID="item" disabled={disabled} onCheckedChange={changed} onPress={e => e.preventDefault()}>Check</ContextMenuCheckboxItem>
        : kind === "radio" ? <ContextMenuRadioGroup defaultValue="one" onValueChange={changed}><ContextMenuRadioItem testID="item" value="two" disabled={disabled} onPress={e => e.preventDefault()}>Two</ContextMenuRadioItem></ContextMenuRadioGroup>
          : <ContextMenuSub onOpenChange={changed}><ContextMenuSubTrigger testID="item" disabled={disabled} onPress={e => e.preventDefault()}>Sub</ContextMenuSubTrigger></ContextMenuSub>}
    </ContextMenuContent></ContextMenu>;
    const tree = render(view(true)); fire(tree, "item"); expect(changed).not.toHaveBeenCalled();
    act(() => tree.update(view(false))); fire(tree, "item"); expect(changed).not.toHaveBeenCalled();
  });
});

describe("native Command inline contract", () => {
  it("stays inline, honors shouldFilter=false and counts all rendered items", () => {
    const tree = render(<Command query="no-match" shouldFilter={false} label="Inline commands" testID="command">
      <CommandItem testID="one" value="one">One</CommandItem><CommandItem testID="two" value="two">Two</CommandItem>
      <CommandEmpty testID="empty">Nothing</CommandEmpty>
    </Command>);
    expect(hosts(tree, "one")).toHaveLength(1); expect(hosts(tree, "two")).toHaveLength(1); expect(hosts(tree, "empty")).toHaveLength(0);
    expect(host(tree, "command").props.accessibilityLabel).toBe("Inline commands");
    expect(tree.root.findAll(n => n.type as unknown === "rn-modal")).toHaveLength(0);
  });
  it("uses custom filtering and preserves explicit accessibility-label priority", () => {
    const filter = vi.fn((value: string, _query: string, _keywords?: string[]) => value === "two" ? 1 : 0);
    const tree = render(<Command query="not-literal" filter={filter} label="fallback" accessibilityLabel="Caller label" testID="command">
      <CommandItem testID="one" value="one">One</CommandItem><CommandItem testID="two" value="two" keywords={["second"]}>Two</CommandItem>
    </Command>);
    expect(hosts(tree, "one")).toHaveLength(0); expect(hosts(tree, "two")).toHaveLength(1);
    expect(filter).toHaveBeenCalledWith("two", "not-literal", ["second"]);
    expect(host(tree, "command").props.accessibilityLabel).toBe("Caller label");
  });
  it.each(["disabled", "cancelled", "enabled"] as const)("guards %s inline selection before invoking onCommandSelect", mode => {
    const order: string[] = [];
    const tree = render(<Command><CommandItem testID="item" value="action" disabled={mode === "disabled"}
      accessibilityState={{ busy: true, disabled: false }}
      onPress={e => { order.push("press"); if (mode === "cancelled") e.preventDefault(); }}
      onCommandSelect={v => order.push(v)}>Action</CommandItem></Command>);
    fire(tree, "item"); expect(order).toEqual(mode === "disabled" ? [] : mode === "cancelled" ? ["press"] : ["press", "action"]);
    expect(host(tree, "item").props.accessibilityState).toMatchObject({ busy: true, disabled: mode === "disabled" });
  });
});
