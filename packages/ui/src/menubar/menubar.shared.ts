import type {
  DropdownMenuCheckboxItemSharedProps,
  DropdownMenuRadioGroupSharedProps,
  DropdownMenuRadioItemSharedProps,
  DropdownMenuSharedProps,
  DropdownMenuSubSharedProps,
} from "../dropdown-menu/dropdown-menu.shared";

export interface MenubarSharedProps {}

export interface MenubarMenuSharedProps extends DropdownMenuSharedProps {}

export type MenubarSubSharedProps = DropdownMenuSubSharedProps;
export type MenubarCheckboxItemSharedProps = DropdownMenuCheckboxItemSharedProps;
export type MenubarRadioGroupSharedProps = DropdownMenuRadioGroupSharedProps;
export type MenubarRadioItemSharedProps = DropdownMenuRadioItemSharedProps;
