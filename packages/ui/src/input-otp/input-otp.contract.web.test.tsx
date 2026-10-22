import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp.web";

function renderOTP(node: React.ReactElement) {
  return render(node);
}

describe("InputOTP web contract", () => {
  it("does not emit BOTH value/defaultValue warning for defaultValue-only use", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = renderOTP(
      <InputOTP defaultValue="10" maxLength={4} aria-label="otp-warn">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    unmount();
    const hits = spy.mock.calls
      .map((args) => args.map((a) => String(a)).join(" | "))
      .filter((msg) => /both/i.test(msg) && /defaultValue/i.test(msg));
    spy.mockRestore();
    expect(hits).toEqual([]);
  });

  it("supports uncontrolled edits from defaultValue and calls both callbacks once", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    renderOTP(
      <InputOTP
        defaultValue="12"
        maxLength={4}
        aria-label="otp-uncontrolled"
        onChange={onChange}
        onValueChange={onValueChange}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByLabelText("otp-uncontrolled") as HTMLInputElement;
    expect(input).toHaveValue("12");
    fireEvent.change(input, { target: { value: "127" } });
    expect(input).toHaveValue("127");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("127");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("127");
  });

  it("notifies controlled onValueChange without mutating until parent rerenders", () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = React.useState("12");
      return (
        <InputOTP
          value={value}
          maxLength={4}
          aria-label="otp-controlled"
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      );
    }
    // Notify-without-mutate: parent holds value, child must not drive DOM alone.
    const { rerender } = renderOTP(<InputOTP value="12" maxLength={4} aria-label="otp-held" onValueChange={onValueChange} />);
    const held = screen.getByLabelText("otp-held") as HTMLInputElement;
    expect(held).toHaveValue("12");
    fireEvent.change(held, { target: { value: "123" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("123");
    expect(held).toHaveValue("12");
    rerender(
      <InputOTP value="123" maxLength={4} aria-label="otp-held" onValueChange={onValueChange} />,
    );
    expect(screen.getByLabelText("otp-held")).toHaveValue("123");
    // Full controlled loop works end to end.
    renderOTP(<Controlled />);
    const loop = screen.getByLabelText("otp-controlled") as HTMLInputElement;
    fireEvent.change(loop, { target: { value: "129" } });
    expect(loop).toHaveValue("129");
  });

  it("uses defaultValue once and ignores later defaultValue changes", () => {
    const { rerender } = renderOTP(
      <InputOTP defaultValue="10" maxLength={4} aria-label="otp-once">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByLabelText("otp-once") as HTMLInputElement;
    expect(input).toHaveValue("10");
    fireEvent.change(input, { target: { value: "11" } });
    expect(input).toHaveValue("11");
    rerender(
      <InputOTP defaultValue="99" maxLength={4} aria-label="otp-once">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(screen.getByLabelText("otp-once")).toHaveValue("11");
  });

  it("forwards ref and preserves input attrs and slots", () => {
    const ref = React.createRef<HTMLInputElement>();
    renderOTP(
      <InputOTP defaultValue="12" maxLength={4} aria-label="otp-attrs" disabled ref={ref}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const input = screen.getByLabelText("otp-attrs") as HTMLInputElement;
    expect(ref.current).toBe(input);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("maxLength", "4");
    expect(input).toHaveValue("12");
  });
});
