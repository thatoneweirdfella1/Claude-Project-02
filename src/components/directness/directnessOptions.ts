export interface DirectnessDropdownOption {
  value: "1" | "2" | "3";
  label: string;
  preview: string;
}

export const DIRECTNESS_DROPDOWN_OPTIONS: DirectnessDropdownOption[] = [
  {
    value: "1",
    label: "Supportive — gentle guidance",
    preview: "Encouraging, empathetic tone.",
  },
  {
    value: "2",
    label: "Balanced — clear and human",
    preview: "Straightforward, natural language.",
  },
  {
    value: "3",
    label: "Blunt — brief and direct",
    preview: "Concise, no extra softening.",
  },
];
