# Avatar

Renders a user image with an initial fallback.

## Import

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Avatar size="md">
      <AvatarImage src="/ada.png" alt="Ada" />
      <AvatarFallback>AD</AvatarFallback>
    </Avatar>
  );
}
```

## Props

Avatar is uncontrolled. It needs no controlled value and shows fallback content until the image loads. Use `size` to change diameter.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `size` | `sm, md, lg, xl` | `md` |

## Accessibility

Avatar images need an `alt` description. The fallback keeps readable initials when the image fails. Do not use avatar alone as a button label.

## Native support

On native each part accepts `testID` with the same value as its web `data-slot`, such as `avatar` and `avatar-fallback`. Pass `testID` only when a test needs a custom query value.
