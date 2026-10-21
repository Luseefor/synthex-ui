/**
 * Dialog (native) — dismissal/host-prop contract.
 *
 * Mocked react-native host only: verifies controller wiring and handler
 * composition. Not device evidence for focus trap/restoration, screen-reader
 * announcements, or real Modal/back-button behavior — those remain pending
 * on-device verification.
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const mock = (name: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(`mock-${name}`, { ...props, ref }, children),
    );
  return {
    Pressable: mock("pressable"),
    Text: mock("text"),
    View: mock("view"),
    Modal: ({ children, visible, ...props }: any) =>
      visible
        ? ReactMock.createElement("mock-modal", props, children)
        : null,
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: {
      OS: "ios",
      select: (options: any) => options.ios ?? options.default,
    },
  };
});

vi.mock("../icons/index.native", () => ({
  CloseIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { Pressable } from "react-native";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./dialog.native";

function createEvent() {
  return { stopPropagation: vi.fn(), defaultPrevented: false };
}

function hostNodes(root: TestRenderer.ReactTestInstance, testID: string) {
  return root.findAll(
    (node) => typeof node.type === "string" && node.props.testID === testID,
  );
}

function hostNode(root: TestRenderer.ReactTestInstance, testID: string) {
  const nodes = hostNodes(root, testID);
  expect(nodes.length).toBeGreaterThan(0);
  const node = nodes[0];
  if (!node) {
    throw new Error(`Missing host node testID="${testID}"`);
  }
  return node;
}

function hostCount(root: TestRenderer.ReactTestInstance, testID: string) {
  return hostNodes(root, testID).length;
}

function modalNode(root: TestRenderer.ReactTestInstance) {
  const nodes = root.findAll(
    (node) => typeof node.type === "string" && String(node.type) === "mock-modal",
  );
  expect(nodes.length).toBeGreaterThan(0);
  const modal = nodes[0];
  if (!modal) {
    throw new Error("Missing mock-modal host");
  }
  return modal;
}

describe("Dialog native trigger/close composition", () => {
  it("trigger opens uncontrolled dialog and composes caller onPress", () => {
    const onOpenChange = vi.fn();
    const callerOnPress = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger onPress={callerOnPress}>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
    const trigger = hostNode(tree!.root, "dialog-trigger");
    const event = createEvent();
    TestRenderer.act(() => {
      trigger.props.onPress(event);
    });
    expect(callerOnPress).toHaveBeenCalledWith(event);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostCount(tree!.root, "dialog-content")).toBe(1);
  });

  it("parent onPress can cancel the default open via defaultPrevented", () => {
    const onOpenChange = vi.fn();
    const callerOnPress = vi.fn((event: { defaultPrevented?: boolean }) => {
      event.defaultPrevented = true;
    });
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger onPress={callerOnPress}>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      hostNode(tree!.root, "dialog-trigger").props.onPress(createEvent());
    });
    expect(callerOnPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
  });

  it("disabled trigger neither notifies nor opens", () => {
    const onOpenChange = vi.fn();
    const callerOnPress = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger disabled onPress={callerOnPress}>
            Open
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const trigger = hostNode(tree!.root, "dialog-trigger");
    expect(trigger.props.disabled).toBe(true);
    TestRenderer.act(() => {
      trigger.props.onPress(createEvent());
    });
    expect(callerOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
  });

  it("asChild runs child then parent then default open, in order", () => {
    const onOpenChange = vi.fn();
    const order: Array<string> = [];
    const childOnPress = vi.fn(() => {
      order.push("child");
    });
    const parentOnPress = vi.fn(() => {
      order.push("parent");
    });
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild onPress={parentOnPress}>
            <Pressable testID="child-trigger" onPress={childOnPress}>
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const event = createEvent();
    TestRenderer.act(() => {
      hostNode(tree!.root, "child-trigger").props.onPress(event);
    });
    expect(order).toEqual(["child", "parent"]);
    expect(childOnPress).toHaveBeenCalledWith(event);
    expect(parentOnPress).toHaveBeenCalledWith(event);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("asChild child cancel skips parent and default open", () => {
    const onOpenChange = vi.fn();
    const parentOnPress = vi.fn();
    const childOnPress = vi.fn((event: { defaultPrevented?: boolean }) => {
      event.defaultPrevented = true;
    });
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild onPress={parentOnPress}>
            <Pressable testID="child-cancel" onPress={childOnPress}>
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      hostNode(tree!.root, "child-cancel").props.onPress(createEvent());
    });
    expect(childOnPress).toHaveBeenCalledTimes(1);
    expect(parentOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
  });

  it("asChild parent cancel skips default open after child runs", () => {
    const onOpenChange = vi.fn();
    const childOnPress = vi.fn();
    const parentOnPress = vi.fn((event: { defaultPrevented?: boolean }) => {
      event.defaultPrevented = true;
    });
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild onPress={parentOnPress}>
            <Pressable testID="child-parent-cancel" onPress={childOnPress}>
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      hostNode(tree!.root, "child-parent-cancel").props.onPress(createEvent());
    });
    expect(childOnPress).toHaveBeenCalledTimes(1);
    expect(parentOnPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
  });

  it("asChild merges callback and object refs and runs cleanup on unmount", () => {
    const onOpenChange = vi.fn();
    const outerCleanup = vi.fn();
    const outerRef = vi.fn((_node: unknown) => outerCleanup);
    const childRef = React.createRef<React.ElementRef<typeof Pressable>>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild ref={outerRef}>
            <Pressable ref={childRef} testID="child-refs">
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
        { createNodeMock: (element) => ({ testID: (element.props as { testID?: string }).testID }) },
      );
    });
    // Both refs attach to the same host node.
    expect(outerRef).toHaveBeenCalled();
    expect(childRef.current).not.toBeNull();
    const firstCall = outerRef.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).toBe(childRef.current);

    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(outerCleanup).toHaveBeenCalled();
    expect(childRef.current).toBeNull();
  });

  it("unmount detaches mixed object ref and void callback ref with null", () => {
    const outerRef = vi.fn();
    const childRef = React.createRef<React.ElementRef<typeof Pressable>>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog>
          <DialogTrigger asChild ref={outerRef}>
            <Pressable ref={childRef} testID="child-mixed-refs">
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
        { createNodeMock: (element) => ({ testID: (element.props as { testID?: string }).testID }) },
      );
    });
    expect(outerRef).toHaveBeenCalled();
    expect(childRef.current).not.toBeNull();
    const firstCall = outerRef.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).toBe(childRef.current);

    TestRenderer.act(() => {
      tree!.unmount();
    });
    // The void callback must still observe detach even though the merged
    // ref returns a composite cleanup for the object ref.
    expect(outerRef).toHaveBeenLastCalledWith(null);
    expect(childRef.current).toBeNull();
  });

  it("unmount runs callback cleanup and still detaches void callback with null", () => {
    const outerCleanup = vi.fn();
    const outerRef = vi.fn((_node: unknown) => outerCleanup);
    const childRef = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog>
          <DialogTrigger asChild ref={outerRef}>
            <Pressable ref={childRef} testID="child-cleanup-refs">
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
        { createNodeMock: (element) => ({ testID: (element.props as { testID?: string }).testID }) },
      );
    });
    expect(outerRef).toHaveBeenCalled();
    expect(childRef).toHaveBeenCalled();
    expect(childRef.mock.calls[0]?.[0]).toBe(
      outerRef.mock.calls[0]?.[0],
    );

    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(outerCleanup).toHaveBeenCalled();
    expect(childRef).toHaveBeenLastCalledWith(null);
  });

  it("asChild disabled blocks both handlers and keeps disabled", () => {
    const onOpenChange = vi.fn();
    const outerOnPress = vi.fn();
    const childOnPress = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild disabled onPress={outerOnPress}>
            <Pressable testID="child-disabled" onPress={childOnPress}>
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const child = hostNode(tree!.root, "child-disabled");
    expect(child.props.disabled).toBe(true);
    TestRenderer.act(() => {
      child.props.onPress(createEvent());
    });
    expect(outerOnPress).not.toHaveBeenCalled();
    expect(childOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("parent disabled={false} must not re-enable a disabled child", () => {
    const onOpenChange = vi.fn();
    const outerOnPress = vi.fn();
    const childOnPress = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild disabled={false} onPress={outerOnPress}>
            <Pressable disabled testID="child-stays-disabled" onPress={childOnPress}>
              Open
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    expect(
      hostNode(tree!.root, "child-stays-disabled").props.disabled,
    ).toBe(true);
    TestRenderer.act(() => {
      hostNode(tree!.root, "child-stays-disabled").props.onPress(createEvent());
    });
    expect(outerOnPress).not.toHaveBeenCalled();
    expect(childOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
  });

  it("close composes caller onPress and notifies close; disabled blocks it", () => {
    const onOpenChange = vi.fn();
    const callerOnPress = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <DialogClose testID="explicit-close" onPress={callerOnPress}>
            Close
          </DialogClose>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const event = createEvent();
    TestRenderer.act(() => {
      hostNode(tree!.root, "explicit-close").props.onPress(event);
    });
    expect(callerOnPress).toHaveBeenCalledWith(event);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    const disabledCalls = vi.fn();
    let disabledTree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      disabledTree = TestRenderer.create(
        <Dialog defaultOpen onOpenChange={disabledCalls}>
          <DialogClose testID="explicit-close-disabled" disabled>
            Close
          </DialogClose>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      hostNode(disabledTree!.root, "explicit-close-disabled").props.onPress(
        createEvent(),
      );
    });
    expect(disabledCalls).not.toHaveBeenCalled();
    expect(hostCount(disabledTree!.root, "dialog-content")).toBe(1);
  });

  it("asChild close cancel skips default close", () => {
    const onOpenChange = vi.fn();
    const parentOnPress = vi.fn();
    const childOnPress = vi.fn((event: { defaultPrevented?: boolean }) => {
      event.defaultPrevented = true;
    });
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <DialogClose asChild onPress={parentOnPress}>
            <Pressable testID="close-cancel" onPress={childOnPress}>
              Close
            </Pressable>
          </DialogClose>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      hostNode(tree!.root, "close-cancel").props.onPress(createEvent());
    });
    expect(childOnPress).toHaveBeenCalledTimes(1);
    expect(parentOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(1);
  });
});

describe("Dialog native controlled/uncontrolled open", () => {
  it("uncontrolled close hides content", () => {
    const onOpenChange = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      const builtIn = hostNodes(tree!.root, "dialog-close").find(
        (node) => node.props.accessibilityLabel === "Close dialog",
      );
      if (!builtIn) {
        throw new Error("Missing built-in close button");
      }
      builtIn.props.onPress(createEvent());
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(hostCount(tree!.root, "dialog-content")).toBe(0);
  });

  it("controlled open stays rendered but still notifies", () => {
    const onOpenChange = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    TestRenderer.act(() => {
      const builtIn = hostNodes(tree!.root, "dialog-close").find(
        (node) => node.props.accessibilityLabel === "Close dialog",
      );
      if (!builtIn) {
        throw new Error("Missing built-in close button");
      }
      builtIn.props.onPress(createEvent());
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Controlled: host keeps rendering until the owner flips `open`.
    expect(hostCount(tree!.root, "dialog-content")).toBe(1);
  });
});

describe("Dialog native Modal dismissal contract", () => {
  function renderContent(props?: {
    dismissible?: boolean;
    modalProps?: React.ComponentProps<typeof DialogContent>["modalProps"];
    onOpenChange?: (open: boolean) => void;
  }) {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen onOpenChange={props?.onOpenChange}>
          <DialogContent
            dismissible={props?.dismissible}
            modalProps={props?.modalProps}
          >
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const rendered = tree;
    if (!rendered) {
      throw new Error("Failed to render dialog content");
    }
    return rendered;
  }

  it("composes modalProps.onRequestClose with built-in dismissal", () => {
    const onOpenChange = vi.fn();
    const callerOnRequestClose = vi.fn();
    const tree = renderContent({
      onOpenChange,
      modalProps: { onRequestClose: callerOnRequestClose },
    });
    const modal = modalNode(tree.root);
    // The mock consumes `visible` (renders null when false); presence of the
    // host modal plus content proves the dialog is open.
    expect(hostCount(tree.root, "dialog-content")).toBe(1);
    const requestEvent = {};
    TestRenderer.act(() => {
      modal.props.onRequestClose(requestEvent);
    });
    expect(callerOnRequestClose).toHaveBeenCalledWith(requestEvent);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(hostCount(tree.root, "dialog-content")).toBe(0);
  });

  it("still notifies caller onRequestClose when dismissible=false without closing", () => {
    const onOpenChange = vi.fn();
    const callerOnRequestClose = vi.fn();
    const tree = renderContent({
      dismissible: false,
      onOpenChange,
      modalProps: { onRequestClose: callerOnRequestClose },
    });
    const requestEvent = {};
    TestRenderer.act(() => {
      modalNode(tree.root).props.onRequestClose(requestEvent);
    });
    expect(callerOnRequestClose).toHaveBeenCalledWith(requestEvent);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(hostCount(tree.root, "dialog-content")).toBe(1);
  });

  it("forces visible/transparent while preserving caller animationType", () => {
    const tree = renderContent({
      modalProps: { animationType: "slide" },
    });
    const modal = modalNode(tree.root);
    expect(modal.props.transparent).toBe(true);
    expect(modal.props.animationType).toBe("slide");
  });

  it("backdrop tap dismisses when dismissible, interior tap does not", () => {
    const onOpenChange = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const overlay = hostNode(tree!.root, "dialog-overlay");
    const pressables = overlay.findAll(
      (node) =>
        typeof node.type === "string" &&
        node !== overlay &&
        typeof node.props.onPress === "function",
    );
    expect(pressables.length).toBeGreaterThan(0);
    const interior = pressables[0];
    if (!interior) {
      throw new Error("Missing interior pressable");
    }
    const stopPropagation = vi.fn();
    TestRenderer.act(() => {
      interior.props.onPress({ stopPropagation });
    });
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree!.root, "dialog-content")).toBe(1);

    TestRenderer.act(() => {
      overlay.props.onPress(createEvent());
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("backdrop tap is inert when dismissible=false", () => {
    const onOpenChange = vi.fn();
    const tree = renderContent({ dismissible: false, onOpenChange });
    TestRenderer.act(() => {
      hostNode(tree.root, "dialog-overlay").props.onPress(createEvent());
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostCount(tree.root, "dialog-content")).toBe(1);
  });
});

describe("Dialog native accessibility defaults", () => {
  it("keeps modal/title defaults and caller overrides", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    expect(
      hostNode(tree!.root, "dialog-content").props.accessibilityViewIsModal,
    ).toBe(true);
    expect(
      hostNode(tree!.root, "dialog-title").props.accessibilityRole,
    ).toBe("header");

    let overridden: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      overridden = TestRenderer.create(
        <Dialog defaultOpen>
          <DialogContent
            accessibilityLabel="Custom dialog"
            accessibilityViewIsModal={false}
          >
            <DialogTitle accessibilityRole="none">Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const content = hostNode(overridden!.root, "dialog-content");
    expect(content.props.accessibilityLabel).toBe("Custom dialog");
    expect(content.props.accessibilityViewIsModal).toBe(false);
    expect(
      hostNode(overridden!.root, "dialog-title").props.accessibilityRole,
    ).toBe("none");
  });
});


describe("Dialog native action accessibility defaults", () => {
  it.each(["trigger", "close"] as const)("merges disabled state and role for %s", (kind) => {
    const Part = kind === "trigger" ? DialogTrigger : DialogClose;
    let tree!: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => { tree = TestRenderer.create(<Dialog defaultOpen>
      <Part testID="semantic-action" disabled accessibilityState={{ busy: true }}>Action</Part>
    </Dialog>); });
    const action = hostNode(tree.root, "semantic-action");
    expect(action.props.accessibilityRole).toBe("button");
    expect(action.props.accessibilityState).toEqual({ busy: true, disabled: true });
    TestRenderer.act(() => tree.unmount());
  });

  it.each(["trigger", "close"] as const)("preserves child role and merges action metadata for slotted %s", (kind) => {
    const Part = kind === "trigger" ? DialogTrigger : DialogClose;
    let tree!: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => { tree = TestRenderer.create(<Dialog defaultOpen>
      <Part asChild disabled accessibilityState={{ busy: true }}>
        <Pressable testID="semantic-child" accessibilityRole="link" accessibilityState={{ selected: true }}>Action</Pressable>
      </Part>
    </Dialog>); });
    const action = hostNode(tree.root, "semantic-child");
    expect(action.props.accessibilityRole).toBe("link");
    expect(action.props.accessibilityState).toEqual({ busy: true, selected: true, disabled: true });
    TestRenderer.act(() => tree.unmount());
  });
});
