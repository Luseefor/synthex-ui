import { traverseLayout } from "./utils";
import type { LayoutNode } from "./types";

export interface LayoutValidationIssue {
  readonly nodeId: string;
  readonly message: string;
}

export interface LayoutValidationResult {
  readonly valid: boolean;
  readonly issues: readonly LayoutValidationIssue[];
}

export function validateLayout(layout: LayoutNode): LayoutValidationResult {
  const issues: LayoutValidationIssue[] = [];
  const seenIds = new Set<string>();

  traverseLayout(layout, (node) => {
    if (!node.id) {
      issues.push({
        nodeId: "<unknown>",
        message: "Node id must be a non-empty string.",
      });
    }

    if (seenIds.has(node.id)) {
      issues.push({
        nodeId: node.id,
        message: "Node id must be unique within the layout tree.",
      });
    } else {
      seenIds.add(node.id);
    }

    if (node.type === "panel") {
      if (!node.panelType) {
        issues.push({
          nodeId: node.id,
          message: "Panel nodes must declare a panelType.",
        });
      }

      return;
    }

    if (node.type === "tabs") {
      if (node.children.length === 0) {
        issues.push({
          nodeId: node.id,
          message: "Tabs nodes must contain at least one panel.",
        });
      }

      if (!node.children.some((child) => child.id === node.activePanelId)) {
        issues.push({
          nodeId: node.id,
          message: "Tabs nodes must reference an active panel that exists in children.",
        });
      }

      return;
    }

    if (node.children.length === 0) {
      issues.push({
        nodeId: node.id,
        message: "Split nodes must not be empty.",
      });
    }

    if (node.children.length === 1) {
      issues.push({
        nodeId: node.id,
        message: "Split nodes must not contain exactly one child.",
      });
    }

    if (node.sizes.length !== node.children.length) {
      issues.push({
        nodeId: node.id,
        message: "Split nodes must provide one ratio per child.",
      });
    }

    const invalidRatio = node.sizes.some((size) => !Number.isFinite(size) || size <= 0);

    if (invalidRatio) {
      issues.push({
        nodeId: node.id,
        message: "Split ratios must be finite positive numbers.",
      });
    }

    const totalRatio = node.sizes.reduce((sum, size) => sum + size, 0);

    if (node.sizes.length > 0 && Math.abs(totalRatio - 1) > 0.0001) {
      issues.push({
        nodeId: node.id,
        message: "Split ratios must sum to 1.",
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
