import { DEBATE_PARTNERS, DEBATE_PARTNER_IDS, type DebatePartnerId } from "../../services/debate";

/* Debate partner picker (Step 8.3) — CANON Feature 9: "The user picks the
   second side from a roster: GPT-5.5..., Gemini 3.1 Pro..., Grok 4.3...,
   DeepSeek V4 Pro.... If no side is picked, default to GPT-5.5."

   Each option shows the roster's own role description, not just the name:
   four bare vendor names is exactly the kind of unexplained choice CANON's
   ADHD rules push back on, and the caller can't pick well without knowing
   what each one is for. Four options sits inside the "never more than 5-7
   simultaneous choices" rule.

   Claude is deliberately absent from this list — it is always the other side
   (CANON: "Claude is always one side"), so offering it here would let the
   user build the exact Claude-vs-Claude debate Feature 9 forbids. */

export interface PartnerPickerProps {
  value: DebatePartnerId;
  onChange: (id: DebatePartnerId) => void;
  disabled?: boolean;
}

export function PartnerPicker({ value, onChange, disabled = false }: PartnerPickerProps) {
  return (
    <fieldset className="partner-picker" disabled={disabled} data-testid="partner-picker">
      <legend className="partner-picker__legend">Debate against</legend>
      <div className="partner-picker__options">
        {DEBATE_PARTNER_IDS.map((id) => {
          const partner = DEBATE_PARTNERS[id];
          return (
            <label key={id} className="partner-picker__option">
              <input
                type="radio"
                name="debate-partner"
                value={id}
                checked={value === id}
                onChange={() => onChange(id)}
              />
              <span className="partner-picker__option-text">
                <span className="partner-picker__option-label">{partner.label}</span>
                <span className="partner-picker__option-role">{partner.role}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
