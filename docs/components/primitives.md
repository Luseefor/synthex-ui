# Primitives

Provides low level box, text and stack parts.

## Import

```tsx
import { Box, Stack, Text } from "synthex-ui/primitives";
```

## Example

```tsx
function Demo() {
  return (
    <Box padding="md">
      <Stack gap="sm">
        <Text>Hello</Text>
      </Stack>
    </Box>
  );
}
```

## Props

Primitives are uncontrolled. They need no controlled value and pass layout props to style and spacing. Use `as` to change the host element when needed.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `padding` | `SpaceValue` | None |
| `gap` | `SpaceValue` | None |
| `as` | `ElementType` | `div` |

## Accessibility

Primitives add no semantics. Choose host elements that match the content, such as headings and paragraphs inside `Text`. Keep focus order natural and avoid extra wrappers around controls.

## Native support

On native primitives accept `testID` on the host view or text node. Pass `testID` only when a test needs a custom query value.
