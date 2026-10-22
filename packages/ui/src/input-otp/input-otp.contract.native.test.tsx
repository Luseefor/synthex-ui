import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const calls: Array<string> = [];
  (globalThis as unknown as { __otpFocusCalls?: Array<string> }).__otpFocusCalls = calls;
  const host = (name: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(name, { ...props, ref }, children),
    );
  return {
    Text: host("mock-text"),
    View: host("mock-view"),
    TextInput: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      const label: string = props.testID ?? props.accessibilityLabel ?? "slot";
      const handle = ReactMock.useMemo(
        () => ({
          __mockTextInput: true,
          focus: () => {
            calls.push(label);
          },
        }),
        [label],
      );
      ReactMock.useImperativeHandle(ref, () => handle, [handle]);
      return ReactMock.createElement("mock-text-input", props, children);
    }),
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

import { InputOTP, InputOTPSlot } from "./input-otp.native";

function focusCalls(): Array<string> {
  return (globalThis as unknown as { __otpFocusCalls: Array<string> }).__otpFocusCalls;
}

const trees: TestRenderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => {
    for (const tree of trees.splice(0)) {
      tree.unmount();
    }
  });
  focusCalls().length = 0;
  vi.restoreAllMocks();
});

function slots(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType("mock-text-input" as any);
}

function slotProps(tree: TestRenderer.ReactTestRenderer, testID: string) {
  const node = slots(tree).find((n) => n.props.testID === testID);
  if (!node) {
    throw new Error(`slot ${testID} not found`);
  }
  return node.props as any;
}

function changeText(tree: TestRenderer.ReactTestRenderer, testID: string, text: string) {
  act(() => {
    slotProps(tree, testID).onChangeText(text);
  });
}

function changeEvent(tree: TestRenderer.ReactTestRenderer, testID: string, text: string) {
  act(() => {
    slotProps(tree, testID).onChange({ nativeEvent: { text } });
  });
}

function keyPress(tree: TestRenderer.ReactTestRenderer, testID: string, key: string) {
  act(() => {
    slotProps(tree, testID).onKeyPress({ nativeEvent: { key } });
  });
}

function FourSlots(props: Partial<React.ComponentProps<typeof InputOTP>> & { slotProps?: Record<string, any> }) {
  const { slotProps: extra, ...root } = props;
  return (
    <InputOTP length={4} {...root}>
      {[0, 1, 2, 3].map((index) => (
        <InputOTPSlot key={index} index={index} testID={`slot-${index}`} {...extra?.[index]} />
      ))}
    </InputOTP>
  );
}

describe("InputOTP native contract", () => {
  it("types slots sequentially and advances focus forward", () => {
    const onValueChange = vi.fn();
    const tree = render(<FourSlots onValueChange={onValueChange} />);
    changeText(tree, "slot-0", "1");
    expect(slotProps(tree, "slot-0").value).toBe("1");
    expect(focusCalls()).toEqual(["slot-1"]);
    changeText(tree, "slot-1", "2");
    expect(slotProps(tree, "slot-1").value).toBe("2");
    expect(focusCalls()).toEqual(["slot-1", "slot-2"]);
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["1", "12"]);
  });

  it("pastes multiple characters at the start and fills the prefix", () => {
    const tree = render(<FourSlots defaultValue="" />);
    changeText(tree, "slot-0", "12");
    expect(slotProps(tree, "slot-0").value).toBe("1");
    expect(slotProps(tree, "slot-1").value).toBe("2");
    expect(focusCalls()).toEqual(["slot-2"]);
  });

  it("pastes in the middle and overwrites the suffix", () => {
    const tree = render(<FourSlots defaultValue="1234" />);
    changeText(tree, "slot-1", "99");
    expect(slotProps(tree, "slot-1").value).toBe("9");
    expect(slotProps(tree, "slot-2").value).toBe("9");
    expect(slotProps(tree, "slot-3").value).toBe("4");
    expect(focusCalls()).toEqual(["slot-3"]);
  });

  it("replaces the whole code when pasting a full code", () => {
    const tree = render(<FourSlots defaultValue="aaaa" />);
    changeText(tree, "slot-0", "1234");
    expect([
      slotProps(tree, "slot-0").value,
      slotProps(tree, "slot-1").value,
      slotProps(tree, "slot-2").value,
      slotProps(tree, "slot-3").value,
    ]).toEqual(["1", "2", "3", "4"]);
  });

  it("focuses the last eligible slot backward when a full paste ends on a disabled last slot", () => {
    const tree = render(<FourSlots defaultValue="" slotProps={{ 3: { editable: false } }} />);
    changeText(tree, "slot-0", "1234");
    expect([
      slotProps(tree, "slot-0").value,
      slotProps(tree, "slot-1").value,
      slotProps(tree, "slot-2").value,
      slotProps(tree, "slot-3").value,
    ]).toEqual(["1", "2", "3", "4"]);
    expect(focusCalls()).toEqual(["slot-2"]);
  });
  it("truncates overflow paste to the root length", () => {
    const tree = render(<FourSlots defaultValue="" />);
    changeText(tree, "slot-0", "123456");
    expect([
      slotProps(tree, "slot-0").value,
      slotProps(tree, "slot-1").value,
      slotProps(tree, "slot-2").value,
      slotProps(tree, "slot-3").value,
    ]).toEqual(["1", "2", "3", "4"]);
  });

  it("handles backspace on an occupied slot exactly once for key plus change", () => {
    const onValueChange = vi.fn();
    const tree = render(<FourSlots defaultValue="1" onValueChange={onValueChange} />);
    onValueChange.mockClear();
    keyPress(tree, "slot-0", "Backspace");
    changeText(tree, "slot-0", "");
    changeEvent(tree, "slot-0", "");
    expect(slotProps(tree, "slot-0").value).toBe("");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("regression: filled Backspace without a following change deletes nothing", () => {
    const onValueChange = vi.fn();
    const tree = render(<FourSlots defaultValue="1" onValueChange={onValueChange} />);
    onValueChange.mockClear();
    keyPress(tree, "slot-0", "Backspace");
    expect(slotProps(tree, "slot-0").value).toBe("1");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(focusCalls()).toEqual([]);
    // A later text-only empty change still deletes exactly once.
    changeText(tree, "slot-0", "");
    expect(slotProps(tree, "slot-0").value).toBe("");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
  it("handles backspace on an empty slot by deleting one char and focusing previous", () => {
    const tree = render(<FourSlots defaultValue="ab" />);
    keyPress(tree, "slot-2", "Backspace");
    changeText(tree, "slot-2", "");
    expect(slotProps(tree, "slot-0").value).toBe("a");
    expect(slotProps(tree, "slot-1").value).toBe("");
    expect(focusCalls()).toEqual(["slot-1"]);
  });

  it("deletes via onChangeText-only fallback when key events are absent", () => {
    const tree = render(<FourSlots defaultValue="ab" />);
    focusCalls().length = 0;
    changeText(tree, "slot-1", "");
    expect(slotProps(tree, "slot-1").value).toBe("");
    expect(slotProps(tree, "slot-0").value).toBe("a");
    expect(focusCalls()).toEqual(["slot-0"]);
  });

  it("notifies controlled onValueChange without changing value until the parent rerenders", () => {
    const onValueChange = vi.fn();
    const tree = render(<FourSlots value="12" onValueChange={onValueChange} />);
    changeText(tree, "slot-2", "3");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(slotProps(tree, "slot-2").value).toBe("");
    act(() => {
      tree.update(
        <InputOTP length={4} value="123" onValueChange={onValueChange}>
          {[0, 1, 2, 3].map((index) => (
            <InputOTPSlot key={index} index={index} testID={`slot-${index}`} />
          ))}
        </InputOTP>,
      );
    });
    expect(slotProps(tree, "slot-2").value).toBe("3");
  });

  it("guards readonly slots and root disabled without the mock enforcing it", () => {
    const readonlyTree = render(<FourSlots defaultValue="" slotProps={{ 0: { editable: false } }} />);
    changeText(readonlyTree, "slot-0", "1");
    keyPress(readonlyTree, "slot-0", "Backspace");
    expect(slotProps(readonlyTree, "slot-0").value).toBe("");
    expect(focusCalls()).toEqual([]);

    const disabledTree = render(<FourSlots defaultValue="" disabled />);
    expect(slotProps(disabledTree, "slot-0").editable).toBe(false);
    expect(slotProps(disabledTree, "slot-0").accessibilityState).toMatchObject({ disabled: true });
    changeText(disabledTree, "slot-0", "1");
    keyPress(disabledTree, "slot-0", "Backspace");
    expect(slotProps(disabledTree, "slot-0").value).toBe("");
    expect(focusCalls()).toEqual([]);
  });

  it("guards readOnly slots: skips focus, ignores key/text, preserves value", () => {
    const onValueChange = vi.fn();
    const callerOnKeyPress = vi.fn();
    const callerOnChangeText = vi.fn();
    const tree = render(
      <InputOTP length={4} defaultValue="12" onValueChange={onValueChange}>
        <InputOTPSlot index={0} testID="slot-0" />
        <InputOTPSlot
          index={1}
          testID="slot-1"
          readOnly
          onKeyPress={callerOnKeyPress as any}
          onChangeText={callerOnChangeText as any}
        />
        <InputOTPSlot index={2} testID="slot-2" />
        <InputOTPSlot index={3} testID="slot-3" />
      </InputOTP>,
    );
    expect(slotProps(tree, "slot-1").readOnly).toBe(true);
    expect(slotProps(tree, "slot-1").editable).toBe(false);
    expect(slotProps(tree, "slot-1").accessibilityState).toMatchObject({ disabled: false });
    // Typing in slot-0 advances past the readOnly slot-1 to slot-2.
    changeText(tree, "slot-0", "9");
    expect(focusCalls()).toEqual(["slot-2"]);
    // Mock key/text events bypass the OS, so the guard must noop callbacks.
    keyPress(tree, "slot-1", "Backspace");
    changeText(tree, "slot-1", "9");
    changeEvent(tree, "slot-1", "9");
    expect(callerOnKeyPress).not.toHaveBeenCalled();
    expect(callerOnChangeText).not.toHaveBeenCalled();
    expect(slotProps(tree, "slot-0").value).toBe("9");
    expect(slotProps(tree, "slot-1").value).toBe("2");
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["92"]);
  });

  it("skips a disabled next slot when advancing", () => {
    const tree = render(
      <FourSlots defaultValue="" slotProps={{ 1: { editable: false } }} />,
    );
    changeText(tree, "slot-0", "1");
    expect(focusCalls()).toEqual(["slot-2"]);
  });

  it("skips a missing next slot when advancing", () => {
    const tree = render(
      <InputOTP length={4} defaultValue="">
        <InputOTPSlot index={0} testID="slot-0" />
        <InputOTPSlot index={2} testID="slot-2" />
      </InputOTP>,
    );
    changeText(tree, "slot-0", "1");
    expect(focusCalls()).toEqual(["slot-2"]);
  });

  it("never focuses outside bounds", () => {
    const tree = render(<FourSlots defaultValue="123" />);
    focusCalls().length = 0;
    changeText(tree, "slot-3", "4");
    // Filling the last slot keeps focus on the last slot (index 3); a filled
    // cell Backspace navigates nowhere until its change arrives.
    keyPress(tree, "slot-0", "Backspace");
    expect(focusCalls()).toEqual(["slot-3"]);
    for (const label of focusCalls()) {
      expect(label).toMatch(/^slot-[0-3]$/);
    }
  });

  it("forwards refs to measurable TextInput instances and clears on unmount", () => {
    const objectRef = React.createRef<any>();
    const callbackRef = vi.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <InputOTP length={2} defaultValue="">
          <InputOTPSlot index={0} testID="slot-0" ref={objectRef} />
          <InputOTPSlot index={1} testID="slot-1" ref={callbackRef} />
        </InputOTP>,
      );
    });
    trees.push(tree);
    expect(objectRef.current).toBeTruthy();
    expect(typeof objectRef.current.focus).toBe("function");
    expect(callbackRef).toHaveBeenCalled();
    const instance = callbackRef.mock.calls[0]![0];
    expect(typeof instance.focus).toBe("function");
    act(() => {
      tree.unmount();
    });
    expect(objectRef.current).toBeNull();
  });

  it("calls plain void callback refs with null on unmount and unregisters the slot", () => {
    const voidRef = vi.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <InputOTP length={3} defaultValue="">
          <InputOTPSlot index={0} testID="slot-0" />
          <InputOTPSlot index={1} testID="slot-1" ref={voidRef as any} />
          <InputOTPSlot index={2} testID="slot-2" />
        </InputOTP>,
      );
    });
    trees.push(tree);
    expect(voidRef).toHaveBeenCalled();
    expect(voidRef.mock.calls[0]![0]).toBeTruthy();
    act(() => {
      tree.update(
        <InputOTP length={3} defaultValue="">
          <InputOTPSlot index={0} testID="slot-0" />
          <InputOTPSlot index={2} testID="slot-2" />
        </InputOTP>,
      );
    });
    expect(voidRef).toHaveBeenCalledWith(null);
    // The unmounted slot is skipped when advancing forward.
    changeText(tree, "slot-0", "1");
    expect(focusCalls()).toEqual(["slot-2"]);
    act(() => {
      tree.unmount();
    });
  });

  it("seeks backward past missing and readOnly slots after an empty-cell delete", () => {
    const tree = render(
      <InputOTP length={4} defaultValue="abc">
        <InputOTPSlot index={0} testID="slot-0" />
        <InputOTPSlot index={2} testID="slot-2" readOnly />
        <InputOTPSlot index={3} testID="slot-3" />
      </InputOTP>,
    );
    expect(slotProps(tree, "slot-2").value).toBe("c");
    keyPress(tree, "slot-3", "Backspace");
    expect(slotProps(tree, "slot-0").value).toBe("a");
    expect(slotProps(tree, "slot-2").value).toBe("");
    expect(slotProps(tree, "slot-3").value).toBe("");
    expect(focusCalls()).toEqual(["slot-0"]);
  });
  it("cleans up React 19 callback refs returning cleanup functions", () => {
    const cleanup = vi.fn();
    const callbackRef = vi.fn((_node: unknown) => cleanup);
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <InputOTP length={1} defaultValue="">
          <InputOTPSlot index={0} testID="slot-0" ref={callbackRef as any} />
        </InputOTP>,
      );
    });
    trees.push(tree);
    expect(callbackRef).toHaveBeenCalled();
    act(() => {
      tree.unmount();
    });
    expect(cleanup).toHaveBeenCalled();
  });

  it("uses accessible labels by default, preserves caller labels, and exposes autofill hints", () => {
    const tree = render(<FourSlots />);
    expect(slotProps(tree, "slot-0").accessibilityLabel).toBe("Code character 1 of 4");
    expect(slotProps(tree, "slot-2").accessibilityLabel).toBe("Code character 3 of 4");
    expect(slotProps(tree, "slot-0").keyboardType).toBe("number-pad");
    expect(slotProps(tree, "slot-0").autoComplete).toBe("one-time-code");
    expect(slotProps(tree, "slot-0").textContentType).toBe("oneTimeCode");
    expect(slotProps(tree, "slot-0").selectTextOnFocus).toBe(true);
    expect(slotProps(tree, "slot-0").maxLength).toBeUndefined();

    const custom = render(
      <InputOTP length={4} defaultValue="">
        <InputOTPSlot
          index={0}
          testID="slot-0"
          accessibilityLabel="Custom code"
          accessibilityState={{ busy: true } as any}
          keyboardType="numeric"
          autoComplete="off"
        />
      </InputOTP>,
    );
    expect(slotProps(custom, "slot-0").accessibilityLabel).toBe("Custom code");
    expect(slotProps(custom, "slot-0").accessibilityState).toMatchObject({ busy: true, disabled: false });
    expect(slotProps(custom, "slot-0").keyboardType).toBe("numeric");
    expect(slotProps(custom, "slot-0").autoComplete).toBe("off");
  });

  it("keeps unicode codepoints intact in slot values", () => {
    const tree = render(<FourSlots defaultValue="😀ab" />);
    expect(slotProps(tree, "slot-0").value).toBe("😀");
    expect(slotProps(tree, "slot-1").value).toBe("a");
  });

  it("lets caller preventDefault cancel empty-cell backward navigation", () => {
    const onValueChange = vi.fn();
    const cancelKey = (e: { preventDefault: () => void }) => e.preventDefault();
    const tree = render(
      <InputOTP length={4} defaultValue="ab" onValueChange={onValueChange}>
        <InputOTPSlot index={0} testID="slot-0" />
        <InputOTPSlot index={1} testID="slot-1" />
        <InputOTPSlot index={2} testID="slot-2" onKeyPress={cancelKey as any} />
        <InputOTPSlot index={3} testID="slot-3" />
      </InputOTP>,
    );
    onValueChange.mockClear();
    act(() => {
      slotProps(tree, "slot-2").onKeyPress({
        nativeEvent: { key: "Backspace" },
        defaultPrevented: true,
        preventDefault() {
          (this as any).defaultPrevented = true;
        },
      });
    });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(slotProps(tree, "slot-0").value).toBe("a");
    expect(slotProps(tree, "slot-1").value).toBe("b");
    expect(focusCalls()).toEqual([]);
    // The paired empty change on the still-empty cell is a noop as well.
    changeText(tree, "slot-2", "");
    expect(slotProps(tree, "slot-1").value).toBe("b");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(focusCalls()).toEqual([]);

    const cancelFocus = vi.fn((e: any) => e.preventDefault());
    const focusTree = render(
      <InputOTP length={4} defaultValue="">
        <InputOTPSlot index={0} testID="slot-0" onFocus={cancelFocus as any} />
      </InputOTP>,
    );
    act(() => {
      const event = {
        defaultPrevented: false,
        preventDefault(this: { defaultPrevented: boolean }) {
          this.defaultPrevented = true;
        },
      };
      slotProps(focusTree, "slot-0").onFocus(event);
    });
    expect(cancelFocus).toHaveBeenCalled();
  });

  it("keeps onChange as a caller observer that never mutates", () => {
    const onValueChange = vi.fn();
    const callerOnChange = vi.fn();
    const tree = render(
      <InputOTP length={4} defaultValue="" onValueChange={onValueChange}>
        <InputOTPSlot index={0} testID="slot-0" onChange={callerOnChange as any} />
        <InputOTPSlot index={1} testID="slot-1" />
        <InputOTPSlot index={2} testID="slot-2" />
        <InputOTPSlot index={3} testID="slot-3" />
      </InputOTP>,
    );
    changeEvent(tree, "slot-0", "1");
    expect(callerOnChange).toHaveBeenCalledTimes(1);
    expect(slotProps(tree, "slot-0").value).toBe("");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(focusCalls()).toEqual([]);
    changeEvent(tree, "slot-0", "");
    expect(slotProps(tree, "slot-0").value).toBe("");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("handles repeated identical onChangeText edits without dropping", () => {
    const tree = render(<FourSlots defaultValue="" />);
    changeText(tree, "slot-0", "1");
    changeText(tree, "slot-0", "1");
    expect(slotProps(tree, "slot-0").value).toBe("1");
    expect(focusCalls()).toEqual(["slot-1", "slot-1"]);
  });

  it("guards disabled slots before caller callbacks", () => {
    const callerOnKeyPress = vi.fn();
    const callerOnChangeText = vi.fn();
    const callerOnChange = vi.fn();
    const tree = render(
      <InputOTP length={2} defaultValue="" disabled>
        <InputOTPSlot
          index={0}
          testID="slot-0"
          onKeyPress={callerOnKeyPress as any}
          onChangeText={callerOnChangeText as any}
          onChange={callerOnChange as any}
        />
        <InputOTPSlot index={1} testID="slot-1" />
      </InputOTP>,
    );
    keyPress(tree, "slot-0", "Backspace");
    changeText(tree, "slot-0", "1");
    changeEvent(tree, "slot-0", "1");
    expect(callerOnKeyPress).not.toHaveBeenCalled();
    expect(callerOnChangeText).not.toHaveBeenCalled();
    expect(callerOnChange).not.toHaveBeenCalled();
    expect(slotProps(tree, "slot-0").value).toBe("");
    expect(focusCalls()).toEqual([]);
  });

  it("cannot preventDefault the OS character edit on a filled cell", () => {
    const onValueChange = vi.fn();
    const cancelKey = (e: { preventDefault: () => void }) => e.preventDefault();
    const tree = render(
      <InputOTP length={4} defaultValue="1" onValueChange={onValueChange}>
        <InputOTPSlot index={0} testID="slot-0" onKeyPress={cancelKey as any} />
        <InputOTPSlot index={1} testID="slot-1" />
        <InputOTPSlot index={2} testID="slot-2" />
        <InputOTPSlot index={3} testID="slot-3" />
      </InputOTP>,
    );
    onValueChange.mockClear();
    // preventDefault on a filled cell is a noop for the key itself, and the
    // following native empty change still deletes (standard RN behavior).
    act(() => {
      slotProps(tree, "slot-0").onKeyPress({
        nativeEvent: { key: "Backspace" },
        defaultPrevented: true,
        preventDefault() {
          (this as any).defaultPrevented = true;
        },
      });
    });
    expect(slotProps(tree, "slot-0").value).toBe("1");
    changeText(tree, "slot-0", "");
    expect(slotProps(tree, "slot-0").value).toBe("");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("composes caller onChangeText before the default insert", () => {
    const order: Array<string> = [];
    const tree = render(
      <InputOTP length={4} defaultValue="">
        <InputOTPSlot index={0} testID="slot-0" onChangeText={() => order.push("caller")} />
        <InputOTPSlot index={1} testID="slot-1" />
        <InputOTPSlot index={2} testID="slot-2" />
        <InputOTPSlot index={3} testID="slot-3" />
      </InputOTP>,
    );
    changeText(tree, "slot-0", "1");
    expect(order).toEqual(["caller"]);
    expect(slotProps(tree, "slot-0").value).toBe("1");
  });

  it("treats invalid indexes as fail-closed and uneditable", () => {
    const tree = render(
      <InputOTP length={2} defaultValue="ab">
        <InputOTPSlot index={9} testID="slot-bad" />
      </InputOTP>,
    );
    const props = slotProps(tree, "slot-bad");
    expect(props.editable).toBe(false);
    expect(props.value).toBe("");
    act(() => {
      props.onChangeText("1");
      props.onKeyPress({ nativeEvent: { key: "Backspace" } });
    });
    expect(slotProps(tree, "slot-bad").value).toBe("");
    expect(focusCalls()).toEqual([]);
  });
});
