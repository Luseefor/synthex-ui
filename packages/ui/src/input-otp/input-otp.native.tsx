import * as React from "react";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { InputOTPProvider, useInputOTPContext, useInputOTPController, type InputOTPSharedProps } from "./input-otp.shared";

export interface InputOTPProps extends Omit<ViewProps, "style">, InputOTPSharedProps {
  readonly children?: React.ReactNode;
  readonly disabled?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

type SlotNode = React.ElementRef<typeof TextInput>;
type KeyEvent = Parameters<NonNullable<React.ComponentProps<typeof TextInput>["onKeyPress"]>>[0];
type ChangeEvent = Parameters<NonNullable<React.ComponentProps<typeof TextInput>["onChange"]>>[0];
type FocusEvent = Parameters<NonNullable<React.ComponentProps<typeof TextInput>["onFocus"]>>[0];
type BlurEvent = Parameters<NonNullable<React.ComponentProps<typeof TextInput>["onBlur"]>>[0];

interface NativeRegistry {
  readonly disabled: boolean;
  readonly register: (index: number, node: SlotNode | null) => void;
  readonly setEditable: (index: number, editable: boolean) => void;
  readonly focusFrom: (requested: number | null, direction: 1 | -1, length: number) => boolean;
}

const NativeSlotRefsContext = React.createContext<NativeRegistry | null>(null);

function isPrevented(event: unknown): boolean {
  return typeof event === "object" && event !== null && (event as { defaultPrevented?: unknown }).defaultPrevented === true;
}

export function InputOTP({ children, defaultValue, disabled, length, onValueChange, style, value, ...props }: InputOTPProps) {
  const controller = useInputOTPController({ defaultValue, length, onValueChange, value });
  const nodes = React.useRef(new Map<number, SlotNode | null>());
  const editable = React.useRef(new Map<number, boolean>());
  const isDisabled = disabled ?? false;
  const registry = React.useMemo<NativeRegistry>(
    () => ({
      disabled: isDisabled,
      focusFrom(requested, direction, registryLength) {
        if (isDisabled || requested == null || !Number.isInteger(requested) || requested < 0 || requested >= registryLength) {
          return false;
        }
        let candidate = requested;
        while (candidate >= 0 && candidate < registryLength) {
          const node = nodes.current.get(candidate);
          if (editable.current.get(candidate) !== false && node != null && typeof node.focus === "function") {
            node.focus();
            return true;
          }
          candidate += direction;
        }
        return false;
      },
      register(index, node) {
        if (!Number.isInteger(index) || index < 0) {
          return;
        }
        if (node == null) {
          nodes.current.delete(index);
          editable.current.delete(index);
          return;
        }
        nodes.current.set(index, node);
      },
      setEditable(index, isEditable) {
        if (!Number.isInteger(index) || index < 0) {
          return;
        }
        editable.current.set(index, isEditable);
      },
    }),
    [isDisabled],
  );
  return (
    <InputOTPProvider value={controller}>
      <NativeSlotRefsContext.Provider value={registry}>
        <View style={style} {...props}>{children}</View>
      </NativeSlotRefsContext.Provider>
    </InputOTPProvider>
  );
}

export interface InputOTPGroupProps extends Omit<ViewProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const InputOTPGroup: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<InputOTPGroupProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, InputOTPGroupProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props}>
      {children}
    </View>
  ),
);
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends Omit<React.ComponentProps<typeof TextInput>, "style" | "value"> {
  readonly index: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const InputOTPSlot: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<InputOTPSlotProps> & React.RefAttributes<React.ElementRef<typeof TextInput>>
> = React.forwardRef<React.ElementRef<typeof TextInput>, InputOTPSlotProps>(
  (
    {
      accessibilityLabel: callerLabel,
      accessibilityState: callerState,
      autoComplete = "one-time-code",
      editable: callerEditable,
      index,
      keyboardType = "number-pad",
      onBlur: callerOnBlur,
      onChange: callerOnChange,
      onChangeText: callerOnChangeText,
      onFocus: callerOnFocus,
      onKeyPress: callerOnKeyPress,
      readOnly,
      selectTextOnFocus = true,
      style,
      textContentType = "oneTimeCode",
      textStyle,
      ...rest
    },
    ref,
  ) => {
    const context = useInputOTPContext();
    const slotRefs = React.useContext(NativeSlotRefsContext);
    const theme = useTheme();
    const editableSnap = React.useRef(true);

    const length = context.length;
    const isInvalid = !Number.isInteger(index) || index < 0 || index >= length;
    const rootDisabled = slotRefs?.disabled ?? false;
    const guarded = rootDisabled || isInvalid || callerEditable === false || readOnly === true;
    editableSnap.current = !guarded;

    const innerRef = React.useCallback(
      (node: SlotNode | null) => {
        if (slotRefs == null || !Number.isInteger(index) || index < 0 || index >= length) {
          return;
        }
        if (node == null) {
          slotRefs.register(index, null);
          return;
        }
        slotRefs.register(index, node);
        slotRefs.setEditable(index, editableSnap.current);
      },
      [slotRefs, index, length],
    );

    // Composite cleanup always: returned cleanups run, otherwise null/object-clear.
    const mergedRef = React.useCallback(
      (node: SlotNode | null) => {
        const cleanups = [ref, innerRef].map((current) => {
          if (typeof current === "function") {
            const cleanup = (current as (value: SlotNode | null) => void | (() => void))(node);
            return typeof cleanup === "function" ? cleanup : () => { (current as (value: SlotNode | null) => void)(null); };
          }
          if (current) {
            (current as React.MutableRefObject<SlotNode | null>).current = node;
            return () => { (current as React.MutableRefObject<SlotNode | null>).current = null; };
          }
          return undefined;
        });
        return () => {
          for (const cleanup of cleanups) {
            cleanup?.();
          }
        };
      },
      [ref, innerRef],
    );

    React.useEffect(() => {
      if (slotRefs == null || !Number.isInteger(index) || index < 0 || index >= length) {
        return;
      }
      slotRefs.setEditable(index, !guarded);
    }, [slotRefs, index, guarded, length]);

    const displayValue = isInvalid ? "" : (Array.from(context.value ?? "").slice(0, length)[index] ?? "");
    const filled = displayValue !== "";

    // Backspace navigates only from an already-empty cell (delete previous +
    // focus back). A filled cell leaves deletion to the real onChangeText edit;
    // no key/text signal can observe Android hardware Backspace on an empty
    // cell (device pending), so that case intentionally has no fallback.
    const handleKeyPress = React.useCallback(
      (event: KeyEvent) => {
        if (guarded) {
          return;
        }
        callerOnKeyPress?.(event);
        if (event.nativeEvent.key !== "Backspace" || filled) {
          return;
        }
        if (isPrevented(event)) {
          return;
        }
        const result = context.deleteValueAt(index);
        slotRefs?.focusFrom(result.focusIndex, -1, length);
      },
      [guarded, callerOnKeyPress, filled, context, index, slotRefs, length],
    );

    // onChangeText is the sole logical edit callback (insert/delete). onChange
    // below is a caller observer only; the key-event-missing fallback lives
    // here. An empty change on an empty cell is a noop, so a key-driven delete
    // plus its paired empty change can never double-delete. preventDefault on
    // a key event cannot cancel the OS native character edit (standard RN).
    const handleChangeText = React.useCallback(
      (text: string) => {
        if (guarded) {
          return;
        }
        callerOnChangeText?.(text);
        if (text === "") {
          if (!filled) {
            return;
          }
          const result = context.deleteValueAt(index);
          slotRefs?.focusFrom(result.focusIndex, -1, length);
          return;
        }
        const result = context.setValueAt(index, text);
        slotRefs?.focusFrom(result.focusIndex, result.focusIndex === length - 1 ? -1 : 1, length);
      },
      [guarded, callerOnChangeText, filled, context, index, slotRefs, length],
    );

    const handleChange = React.useCallback(
      (event: ChangeEvent) => {
        if (guarded) {
          return;
        }
        callerOnChange?.(event);
      },
      [guarded, callerOnChange],
    );

    const handleFocus = React.useCallback(
      (event: FocusEvent) => {
        callerOnFocus?.(event);
      },
      [callerOnFocus],
    );

    const handleBlur = React.useCallback(
      (event: BlurEvent) => {
        callerOnBlur?.(event);
      },
      [callerOnBlur],
    );

    return (
      <TextInput
        {...rest}
        ref={mergedRef}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        selectTextOnFocus={selectTextOnFocus}
        readOnly={readOnly}
        editable={(rootDisabled || isInvalid || readOnly === true) ? false : callerEditable}
        accessibilityLabel={callerLabel ?? `Code character ${index + 1} of ${length}`}
        accessibilityState={{ ...callerState, disabled: rootDisabled || isInvalid }}
        value={displayValue}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onChangeText={handleChangeText}
        style={[
          {
            width: 44,
            height: 44,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
            backgroundColor: theme.colors.surface,
            textAlign: "center",
            color: theme.colors.foreground,
            fontSize: theme.typography.size.lg,
            fontWeight: theme.typography.weight.semibold,
          },
          style as StyleProp<TextStyle>,
          textStyle,
        ]}
      />
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<typeof Text>> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, React.ComponentProps<typeof Text>>(
  ({ children = "—", style, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Text ref={ref} style={[{ color: theme.colors.foregroundMuted }, style]} {...props}>
        {children}
      </Text>
    );
  },
);
InputOTPSeparator.displayName = "InputOTPSeparator";
