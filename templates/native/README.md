# Synthex Native Demo

Static React Native showcase proving the moat: same `synthex-ui` API renders
native views (RN `Modal` for dialogs) instead of web DOM/Radix.

## Install & run

```sh
npm install
npm start
```

`synthex-ui` resolves via `file:../../packages/ui`; bundler picks the
`react-native` export condition (`synthex-ui/native`).

## What it renders

`App.tsx` shows `Button`, `Card`, `Badge`, and `Dialog` inside `ThemeProvider`.
Dialogs need `Modal` on RN: native `DialogContent` wraps content in a
transparent fade `Modal`, while web uses Radix `Portal` + `Overlay`.

## testID → data-slot map

| Native `testID` | Web `data-slot` |
| --- | --- |
| `button-primary` / `button-secondary` | `button` |
| `badge` | `badge` |
| `card`, `card-header`, `card-title`, `card-content` | same `card*` slots |
| `dialog-trigger`, `dialog-content`, `dialog-title` | same `dialog-*` slots |
| `dialog-description`, `dialog-overlay`, `dialog-close` | same `dialog-*` slots |
