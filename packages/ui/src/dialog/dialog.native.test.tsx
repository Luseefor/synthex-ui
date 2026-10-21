/**
 * Dialog (native) — testID == web data-slot parity.
 *
 * Web slots (dialog.web.tsx): dialog-trigger, dialog-close, dialog-portal,
 * dialog-overlay, dialog-content, dialog-header, dialog-title,
 * dialog-description, dialog-footer.
 * Native mirrors all except portal (Modal has no slot;RN Modal is the portal).
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

vi.mock("../_shared/theme/context", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../_shared/theme/context")>();
  return actual;
});

import TestRenderer from "react-test-renderer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog.native";

function renderOpenDialog(customContentTestID?: string) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent testID={customContentTestID}>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Desc</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer</DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );
  });
  return tree!;
}

describe("Dialog (native testID parity)", () => {
  it("exposes testIDs matching web data-slot", () => {
    const tree = renderOpenDialog();
    const root = tree.root;
    // Each testID must equal the web data-slot of the same part.
    const expected = [
      "dialog-trigger",
      "dialog-overlay",
      "dialog-content",
      "dialog-header",
      "dialog-title",
      "dialog-description",
      "dialog-footer",
      "dialog-close",
    ];
    for (const testID of expected) {
      const nodes = root.findAllByProps({ testID });
      expect(
        nodes.length,
        `expected testID "${testID}" to render (mirrors web data-slot)`,
      ).toBeGreaterThan(0);
    }
  });

  it("respects custom testID override on content", () => {
    const tree = renderOpenDialog("custom-dialog");
    expect(tree.root.findByProps({ testID: "custom-dialog" })).toBeTruthy();
    // Default still documented: web data-slot is dialog-content.
    expect("dialog-content").toBe("dialog-content");
  });

  it("hides content when closed (null render)", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    expect(
      tree!.root.findAllByProps({ testID: "dialog-content" }).length,
    ).toBe(0);
  });
});

describe("Dialog (native accessibility)", () => {
  it("labels the built-in close button for screen readers", () => {
    const tree = renderOpenDialog();
    const closeButtons = tree.root.findAllByProps({ testID: "dialog-close" });
    const builtIn = closeButtons.find(
      (node) => node.props.accessibilityLabel === "Close dialog",
    );
    expect(builtIn).toBeTruthy();
    expect(builtIn!.props.accessibilityRole).toBe("button");
  });

  it("exposes modal semantics on content without unsupported roles", () => {
    const tree = renderOpenDialog();
    const content = tree.root.findByProps({ testID: "dialog-content" });
    expect(content.props.accessibilityViewIsModal).toBe(true);
    expect(content.props.accessibilityRole).not.toBe("dialog");
    expect(content.props.accessible).not.toBe(true);
  });

  it("announces the title as a header by default", () => {
    const tree = renderOpenDialog();
    const title = tree.root.findByProps({ testID: "dialog-title" });
    expect(title.props.accessibilityRole).toBe("header");
  });

  it("preserves consumer accessibility overrides", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Dialog defaultOpen>
          <DialogContent
            testID="dialog-content"
            accessibilityLabel="Custom dialog"
            accessibilityViewIsModal={false}
          >
            <DialogTitle accessibilityRole="none">Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
    });
    const content = tree!.root.findByProps({ testID: "dialog-content" });
    expect(content.props.accessibilityLabel).toBe("Custom dialog");
    expect(content.props.accessibilityViewIsModal).toBe(false);
    const title = tree!.root.findByProps({ testID: "dialog-title" });
    expect(title.props.accessibilityRole).toBe("none");
  });

  it("closes the dialog when the built-in close button is pressed", () => {
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
    const builtIn = tree!.root
      .findAllByProps({ testID: "dialog-close" })
      .find((node) => node.props.accessibilityLabel === "Close dialog");
    expect(builtIn).toBeTruthy();
    TestRenderer.act(() => {
      builtIn!.props.onPress();
    });
    expect(
      tree!.root.findAllByProps({ testID: "dialog-content" }).length,
    ).toBe(0);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
