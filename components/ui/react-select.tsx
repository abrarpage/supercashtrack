"use client";
import * as React from "react";
import ReactSelect, {
  type GroupBase,
  type Props as RSProps,
} from "react-select";
import CreatableSelect, {
  type CreatableProps,
} from "react-select/creatable";
import { cn } from "@/lib/utils";

export type RSOption<T = string> = {
  value: T;
  label: string;
};

const sharedClassNames = {
  control: ({ isFocused, isDisabled }: { isFocused: boolean; isDisabled: boolean }) =>
    cn(
      "flex min-h-10 w-full items-center justify-between rounded-md border border-hairline bg-surface-card px-1 text-sm text-ink",
      isFocused && "ring-2 ring-info",
      isDisabled && "cursor-not-allowed opacity-50",
    ),
  valueContainer: () => "px-2 py-1 gap-1",
  placeholder: () => "text-muted",
  singleValue: () => "text-ink",
  input: () => "text-ink m-0 p-0",
  indicatorsContainer: () => "pr-1",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: () => "text-ink-strong opacity-60 px-1",
  clearIndicator: () => "text-muted hover:text-ink-strong px-1 cursor-pointer",
  menu: () =>
    "mt-1 overflow-hidden rounded-md border border-hairline bg-surface-elevated text-ink shadow-md z-50",
  menuList: () => "p-1 max-h-72",
  option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
    cn(
      "rounded-sm px-2 py-1.5 text-sm cursor-default",
      isFocused && "bg-surface-card text-ink-strong",
      isSelected && "text-ink-strong",
    ),
  noOptionsMessage: () => "px-3 py-2 text-xs text-muted",
  loadingMessage: () => "px-3 py-2 text-xs text-muted",
  multiValue: () => "rounded-sm bg-surface-elevated px-1",
  multiValueLabel: () => "text-ink text-xs px-1",
  multiValueRemove: () => "text-muted hover:text-ink-strong px-1 cursor-pointer",
  groupHeading: () => "px-2 py-1 text-xs uppercase text-muted",
};

export function RSelect<
  Option = RSOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: RSProps<Option, IsMulti, Group>) {
  return (
    <ReactSelect<Option, IsMulti, Group>
      unstyled
      classNames={sharedClassNames}
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 50 }) }}
      {...props}
    />
  );
}

export function RCreatableSelect<
  Option = RSOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: CreatableProps<Option, IsMulti, Group>) {
  return (
    <CreatableSelect<Option, IsMulti, Group>
      unstyled
      classNames={sharedClassNames}
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 50 }) }}
      {...props}
    />
  );
}
