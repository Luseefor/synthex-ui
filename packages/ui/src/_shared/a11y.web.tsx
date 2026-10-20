import * as React from "react";

export function sanitizeA11yId(id: string): string {
  return id.replace(/:/g, "");
}

export function useA11yId(prefix: string): string {
  const raw = React.useId();
  return React.useMemo(() => `${prefix}-${sanitizeA11yId(raw)}`, [prefix, raw]);
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

export function useFocusTrap(
  active: boolean,
  contentRef: React.RefObject<HTMLElement | null>,
): void {
  React.useEffect(() => {
    if (!active) return;
    const node = contentRef.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (!node.hasAttribute("tabindex")) {
      node.setAttribute("tabindex", "-1");
    }
    const focusables = getFocusableElements(node);
    const firstInitial = focusables[0] as HTMLElement | undefined;
    (firstInitial ?? node).focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = getFocusableElements(node);
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = elements[0] as HTMLElement;
      const last = elements[elements.length - 1] as HTMLElement;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, contentRef]);
}

export function handleMenuArrowKeys(event: React.KeyboardEvent<HTMLElement>): void {
  const currentTarget = event.currentTarget;
  const items = Array.from(
    currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], [role="menuitemradio"], [role="menuitemcheckbox"]'),
  ).filter((el) => !el.hasAttribute("disabled"));
  if (items.length === 0) return;
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  let nextIndex: number | undefined;
  switch (event.key) {
    case "ArrowDown":
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
      break;
    case "ArrowUp":
      nextIndex = currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
      break;
    case "Home":
      nextIndex = 0;
      break;
    case "End":
      nextIndex = items.length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  items[nextIndex]?.focus();
}
