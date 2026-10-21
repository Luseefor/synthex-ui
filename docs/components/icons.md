# Icons

Provides icon names and ready made icon parts.

## Import

```tsx
import { CheckIcon, Icon } from "synthex-ui/icons";
```

## Example

```tsx
function Demo() {
  return (
    <div>
      <Icon name="check" size={18} />
      <CheckIcon size={18} />
    </div>
  );
}
```

## Props

Icons are uncontrolled. They need no controlled value and render static SVG marks. Use `name` with `size` on `Icon`, or render a named part directly.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `name` | `IconName` | Required |
| `size` | `number` | `18` |

## Accessibility

Icons are decorative by default. Add an `aria-label` on the parent when the icon carries meaning, and hide pure decoration with `aria-hidden`. Keep stroke contrast against the background.

## Native support

On native icons accept `testID` alongside `name` for query use, such as `icon-check`. Pass `testID` only when a test needs a custom query value.
