# Command

Renders a filterable command list with input, groups and items.

## Import

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "synthex-ui/components";
```

## Example

```tsx
function Demo() {
  return (
    <Command>
      <CommandInput placeholder="Search" />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem value="home">Home</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

## Props

Command supports controlled and uncontrolled query state. Pass `value` with `onValueChange` for controlled filtering, or `defaultValue` for an uncontrolled initial query. Item selection stays local unless the app controls it.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `value` | `string` | None |
| `defaultValue` | `string` | None |
| `onValueChange` | `(value: string) => void` | None |

## Accessibility

Command follows combobox listbox behavior. Up and Down move the active item, Enter runs it, and Escape clears or closes the dialog form. Keep item text concise so screen readers announce each option clearly.

## Native support

On native command parts accept `testID` with the same value as their web `data-slot`, such as `command-input` and `command-list`. Pass `testID` only when a test needs a custom query value.
