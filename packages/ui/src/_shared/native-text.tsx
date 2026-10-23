import * as React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

/**
 * Group contiguous string/number children into <Text>, preserving elements
 * outside <Text> by reference/key identity.
 *
 * Fragment boundaries are preserved via cloneElement with recursive
 * rendering, so child keys keep their namespace and state identity.
 * Nested array boundaries are preserved as nested ReactNode[] (not
 * flattened), so React implicit array namespaces stay intact and
 * duplicate keys across separate nested arrays do not collide.
 * Generated Text keys skip caller direct-element keys at the same level.
 */
export function renderNativeInlineText(
  children: React.ReactNode,
  textStyle: StyleProp<TextStyle>,
): React.ReactNode {
  const renderLevel = (items: React.ReactNode[]): React.ReactNode[] => {
    const used = new Set<string>();
    for (const item of items) {
      if (React.isValidElement(item) && item.key != null) {
        used.add(String(item.key));
      }
    }
    const result: React.ReactNode[] = [];
    let buffer: Array<string | number> = [];
    let keyCounter = 0;
    const nextKey = (): string => {
      let candidate: string;
      do {
        candidate = `inline-text-${keyCounter++}`;
      } while (used.has(candidate));
      used.add(candidate);
      return candidate;
    };
    const flush = () => {
      if (buffer.length === 0) {
        return;
      }
      const content = buffer.length === 1 ? buffer[0] : [...buffer];
      result.push(
        <Text key={nextKey()} style={textStyle}>
          {content as React.ReactNode}
        </Text>,
      );
      buffer = [];
    };
    for (const child of items) {
      if (child == null || typeof child === "boolean") {
        continue;
      }
      if (typeof child === "string" || typeof child === "number") {
        buffer.push(child);
        continue;
      }
      if (Array.isArray(child)) {
        flush();
        const nested = renderLevel(child);
        if (nested.length > 0) {
          result.push(nested);
        }
        continue;
      }
      if (React.isValidElement(child) && child.type === React.Fragment) {
        flush();
        result.push(
          React.cloneElement(
            child,
            {},
            renderNativeInlineText(
              (child.props as { readonly children?: React.ReactNode }).children,
              textStyle,
            ),
          ),
        );
        continue;
      }
      flush();
      result.push(child);
    }
    flush();
    return result;
  };

  if (children == null || typeof children === "boolean") {
    return null;
  }
  if (typeof children === "string" || typeof children === "number") {
    return <Text style={textStyle}>{children}</Text>;
  }
  if (Array.isArray(children)) {
    const out = renderLevel(children);
    if (out.length === 0) {
      return null;
    }
    if (out.length === 1) {
      return out[0];
    }
    return out;
  }
  if (React.isValidElement(children) && children.type === React.Fragment) {
    return React.cloneElement(
      children,
      {},
      renderNativeInlineText(
        (children.props as { readonly children?: React.ReactNode }).children,
        textStyle,
      ),
    );
  }
  return children;
}
