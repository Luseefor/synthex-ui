import * as React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

/**
 * Group contiguous string/number children into <Text>, preserving elements
 * outside <Text> by reference/key identity.
 *
 * All Fragment boundaries are preserved via cloneElement with recursive
 * rendering, so child keys keep their namespace and state identity instead
 * of being flattened across groups.
 */
export function renderNativeInlineText(
  children: React.ReactNode,
  textStyle: StyleProp<TextStyle>,
): React.ReactNode {
  const flat: React.ReactNode[] = [];
  const walk = (node: React.ReactNode, target: React.ReactNode[]): void => {
    if (node == null || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        walk(child, target);
      }
      return;
    }
    if (React.isValidElement(node) && node.type === React.Fragment) {
      target.push(
        React.cloneElement(
          node,
          {},
          renderNativeInlineText(
            (node.props as { readonly children?: React.ReactNode }).children,
            textStyle,
          ),
        ),
      );
      return;
    }
    target.push(node);
  };
  walk(children, flat);

  const result: React.ReactNode[] = [];
  let buffer: Array<string | number> = [];
  let key = 0;
  const flush = () => {
    if (buffer.length === 0) {
      return;
    }
    const content = buffer.length === 1 ? buffer[0] : [...buffer];
    result.push(
      <Text key={`inline-text-${key++}`} style={textStyle}>
        {content as React.ReactNode}
      </Text>,
    );
    buffer = [];
  };
  for (const child of flat) {
    if (typeof child === "string" || typeof child === "number") {
      buffer.push(child);
    } else if (child == null || typeof child === "boolean") {
      continue;
    } else {
      flush();
      result.push(child);
    }
  }
  flush();
  if (result.length === 0) {
    return null;
  }
  if (result.length === 1) {
    return result[0];
  }
  return result;
}
