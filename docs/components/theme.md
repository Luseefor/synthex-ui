# Theme

Provides theme tokens and mode context for the app.

## Import

```tsx
import { ThemeProvider, useTheme } from "synthex-ui/theme";
```

## Example

```tsx
function Demo() {
  return (
    <ThemeProvider mode="light">
      <ThemedCard />
    </ThemeProvider>
  );
}

function ThemedCard() {
  const theme = useTheme();
  return <span>{theme.mode}</span>;
}
```

## Props

Theme provider supports controlled and uncontrolled use. Pass `mode` with `onModeChange` for controlled state, or `defaultMode` for uncontrolled state. Use `accentPreset` to switch palettes.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `mode` | `light, dark` | `light` |
| `defaultMode` | `light, dark` | `light` |
| `onModeChange` | `(mode: string) => void` | None |

## Accessibility

Theme keeps contrast tokens for light and dark modes so text stays readable. Dark mode also works through `data-theme` or system preference without a provider. Avoid custom colors that lower contrast.

## Native support

On native `ThemeProvider` supplies the same tokens to styled views and accepts `testID` on the host wrapper. Pass `testID` only when a test needs a custom query value.
