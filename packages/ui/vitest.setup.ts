import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Moat (native/a11y/e2e): jsdom + react-test-renderer parity suite.
// - Native render tests (react-test-renderer) assert testID == web data-slot
//   for dialog/select/calendar/chart/toast (+carousel/menu where present).
// - Axe checks (jest-axe) cover dialog/select/menu/calendar on web.
// - Keyboard e2e uses fireEvent (user-event not installed; fireEvent.keyDown
//   is the underlying mechanism) for dialog Escape/Tab, select ArrowDown/Enter,
//   menu ArrowKeys, calendar arrows, carousel arrows.
// - Theme/RTL/reduced-motion: styles.css assertions + docs, no theme rewrite.
afterEach(() => {
  cleanup();
});

// jsdom lacks ResizeObserver, which Radix primitives (e.g. Slider via
// @radix-ui/react-use-size) require. Provide a minimal stub so overlay and
// form controls that depend on measurement can mount in tests.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

if (
  typeof window !== "undefined" &&
  typeof window.HTMLElement !== "undefined" &&
  typeof window.HTMLElement.prototype.scrollIntoView !== "function"
) {
  window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}

if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
