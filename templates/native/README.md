# Synthex Expo Starter

Standalone Expo (SDK 58) TypeScript starter using `synthex-ui` from npm.
`App.tsx` renders `Button` and `Dialog` inside `ThemeProvider`; the bundler
resolves `synthex-ui/native` through the `react-native` export condition.
No CSS files are used; styling is React Native inline styles plus theme
tokens. Native `DialogContent` renders inside an RN `Modal`.

## Requirements

Node.js 22.13+ (per Expo SDK 58), npm.

## Install & run

```sh
npm install
npm start
```

`npm start` launches the Expo dev server. Open the project with an
Expo Go client or a development build; `npm run android` and `npm run ios`
target those platforms the same way.

`synthex-ui` resolves from the npm registry; the bundled starter requires
the UI version shipped with the CLI release. It has no `file:` dependency
on this repo.

## Scripts

- `npm start` — Expo dev server
- `npm run android` / `npm run ios` — open on the target platform
- `npm run typecheck` — `tsc --noEmit`
- `npm run export` — `expo export --platform android` (writes the
  production JS bundle and manifest to `dist/` for use with an update
  service or a native shell; it does not produce an installable APK)

## testID → data-slot map

| Native `testID` | Web `data-slot` |
| --- | --- |
| `button-primary` / `button-secondary` | `button` |
| `dialog-trigger`, `dialog-content`, `dialog-title` | same `dialog-*` slots |
| `dialog-description`, `dialog-overlay`, `dialog-close` | same `dialog-*` slots |

`App.tsx` sets explicit `testID` values on the parts it renders; the
remaining IDs are the components' defaults.
