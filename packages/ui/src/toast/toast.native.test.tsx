/**
 * Toast (native) — testID == web data-slot parity.
 *
 * Web slots (toast.web.tsx): toast-viewport, toast, toast-action,
 * toast-close, toast-title, toast-description, sonner-toaster.
 * Native mirrors viewport/toast/action/close/title/description; Toaster/Sonner
 * delegate to the viewport (sonner-toaster has no native equivalent — gap).
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
  CheckIcon: () => null,
  CloseIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
} from "./toast.native";
import { ToastProviderStore } from "./toast.shared";

describe("Toast (native testID parity)", () => {
  it("exposes standalone toast part testIDs matching web data-slot", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ToastProvider>
          <Toast>
            <ToastTitle>Saved</ToastTitle>
            <ToastDescription>Done</ToastDescription>
            <ToastAction>Undo</ToastAction>
            <ToastClose />
          </Toast>
        </ToastProvider>,
      );
    });
    const expected = [
      "toast-provider",
      "toast",
      "toast-title",
      "toast-description",
      "toast-action",
      "toast-close",
    ];
    for (const testID of expected) {
      expect(
        tree!.root.findAllByProps({ testID }).length,
        `expected testID "${testID}" (web data-slot)`,
      ).toBeGreaterThan(0);
    }
  });

  it("renders viewport testID when toasts exist", async () => {
    const { ToastViewport } = await import("./toast.native");
    const store = {
      dismissToast: () => {},
      pushToast: () => "id",
      removeToast: () => {},
      toasts: [
        {
          id: "t1",
          title: "Saved",
          description: "Done",
          duration: 0,
        },
      ],
    };
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ToastProviderStore value={store}>
          <ToastViewport />
        </ToastProviderStore>,
      );
    });
    expect(
      tree!.root.findAllByProps({ testID: "toast-viewport" }).length,
    ).toBeGreaterThan(0);
    expect(
      tree!.root.findAllByProps({ testID: "toast" }).length,
    ).toBeGreaterThan(0);
  });
});
