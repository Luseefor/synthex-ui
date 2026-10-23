---
"synthex-ui": patch
"@luseefor/synthex-cli": patch
---

Prevent native label crashes when JSX children contain interpolated text, numbers, arrays, or fragments. Wrap primitive label segments in Text while preserving custom elements and fragment boundaries. Apply the fix to menus, selectors, commands, accordion triggers, pagination, radio items, sidebar items, table cells, and toggles, including CLI-copied sources.
