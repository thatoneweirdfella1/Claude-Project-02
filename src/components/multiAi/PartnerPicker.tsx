import { DEBATE_PARTNERS, DEBATE_PARTNER_IDS, type DebatePartnerId } from "../../services/debate";

/* Debate partner picker (Step 8.3) — CANON Feature 9: Manual mode.
   "The user checks 1 to 3 roster entries directly."

   Each option shows the roster's own role description, not just the name:
   four bare vendor names is exactly the kind of unexplained choice CANON's
   ADHD rules push back on, and the caller can't pick well without knowing
   what each one is for. Four options sits inside the "never more than 5-7
   simultaneous choices" rule.

   Claude is deliberately absent from this list — it is always one participant
   (CANON: "Claude is always one side"), so offering it here would let the
   user build the exact Claude-vs-Claude debate Feature 9 forbids. */

const MAX_PARTNERS = 3;

export interface PartnerPickerProps {
  /** Selected partner IDs (multi-select, 1-3) */
  value: DebatePartnerId[];
  onChange: (ids: DebatePartnerId[]) => void;
  disabled?: boolean;
}

export function PartnerPicker({ value, onChange, disabled = false }: PartnerPickerProps) {
  const handleChange = (id: DebatePartnerId, checked: boolean) => {
    if (checked) {
      if (value.length < MAX_PARTNERS) {
        onChange([...value, id]);
      }
    } else {
      onChange(value.filter((v) => v !== id));
    }
  };

  return (
    <fieldset className="partner-picker" disabled={disabled} data-testid="partner-picker">
      <legend className="partner-picker__legend">Debate with (choose 1–3)</legend>
      <div className="partner-picker__options">
        {DEBATE_PARTNER_IDS.map((id) => {
          const partner = DEBATE_PARTNERS[id];
          const isChecked = value.includes(id);
          const isDisabled = !isChecked && value.length >= MAX_PARTNERS;

          return (
            <label key={id} className="surface-smoked-glass partner-picker__option">
              <input
                type="checkbox"
                name="debate-partners"
                value={id}
                checked={isChecked}
                onChange={(e) => handleChange(id, e.currentTarget.checked)}
                disabled={isDisabled}
              />
              <span className="partner-picker__option-text">
                <span className="partner-picker__option-label">{partner.label}</span>
                <span className="partner-picker__option-role">{partner.role}</span>
              </span>
            </label>
          );
        })}
      </div>
      {value.length > 0 && (
        <p className="partner-picker__count">
          {value.length} of {MAX_PARTNERS} selected
        </p>
      )}
    </fieldset>
  );
}
