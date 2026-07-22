import type { SelectHTMLAttributes } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: DropdownOption[];
  className?: string;
}

/* Native <select>, styled to sit on Smoked Glass with a cyan chevron
   (MATERIALS.md "COLOR": cyan for dropdown arrows). Native select gets
   keyboard operation (arrows, type-ahead, Enter, Escape) for free —
   simplest thing that holds the rule at the primitive-library stage.
   Feature steps needing a richer listbox can build on top of this. */

export function Dropdown({ options, className = "", ...rest }: DropdownProps) {
  return (
    <div className={`primitive-dropdown ${className}`.trim()}>
      <select {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
