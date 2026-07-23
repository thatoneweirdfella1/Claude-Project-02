import { autoSelectPartners } from "../../services/debate/autoSelect";
import { GlassButton } from "../primitives";
import type { DebatePartnerId } from "../../services/debate";

/* Auto-select trigger for debate partners (Step 8.3) — CANON Feature 9.
   "AUTO-SELECT — a single button lets the system choose the best partner(s)
   automatically, based on the roster's stated strengths matched against the
   question's domain/complexity."

   Trigger: the user clicks this button, which computes best-fit partners from
   the current question and updates the selection. */

export interface AutoSelectButtonProps {
  question: string;
  onSelect: (ids: DebatePartnerId[]) => void;
  disabled?: boolean;
}

export function AutoSelectButton({ question, onSelect, disabled = false }: AutoSelectButtonProps) {
  const handleClick = () => {
    const selected = autoSelectPartners(question);
    onSelect(selected);
  };

  return (
    <GlassButton onClick={handleClick} disabled={disabled} data-testid="auto-select-button">
      Auto-select for this question
    </GlassButton>
  );
}
