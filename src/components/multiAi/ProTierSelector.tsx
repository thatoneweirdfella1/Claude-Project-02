/** Pro tier selector UI — shows Manual vs Auto-Select options with
    pricing indicators and upgrade prompts. Uses color accents for Pro features. */

import { useAccountStore } from "../../stores/accountStore";
import { getAutoSelectLimit, getAutoSelectRemaining, canPerformAutoSelect } from "../../stores/accountStore";

interface ProTierSelectorProps {
  useAutoSelect: boolean;
  onToggleAutoSelect: (use: boolean) => void;
  featureType: "discussion_type" | "models";
}

export function ProTierSelector({ useAutoSelect, onToggleAutoSelect, featureType }: ProTierSelectorProps) {
  const plan = useAccountStore((s) => s.plan);
  const remaining = getAutoSelectRemaining();
  const canAutoSelect = canPerformAutoSelect();
  const limit = getAutoSelectLimit(plan);

  const isPaid = plan !== "free";
  const featureLabel = featureType === "discussion_type" ? "Discussion Type" : "AI Models";

  return (
    <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "rgba(0, 217, 255, 0.05)" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input
            type="radio"
            checked={!useAutoSelect}
            onChange={() => onToggleAutoSelect(false)}
            style={{ cursor: "pointer" }}
          />
          <span>Manual Selection</span>
          <span style={{ fontSize: "0.85em", color: "var(--text-secondary)" }}>(Free)</span>
        </label>
        <p style={{ margin: "0.25rem 0 0 1.5rem", fontSize: "0.9em", color: "var(--text-secondary)" }}>
          You choose which {featureLabel.toLowerCase()} to use
        </p>
      </div>

      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: !isPaid ? "not-allowed" : "pointer" }}>
          <input
            type="radio"
            checked={useAutoSelect}
            onChange={() => {
              if (isPaid || canAutoSelect) onToggleAutoSelect(true);
            }}
            disabled={!isPaid && !canAutoSelect}
            style={{ cursor: !isPaid && !canAutoSelect ? "not-allowed" : "pointer" }}
          />
          <span style={!isPaid && !canAutoSelect ? { color: "var(--text-secondary)" } : { color: "var(--accent-cyan)" }}>
            Auto-Select {featureLabel}
          </span>
          <span
            style={{
              fontSize: "0.85em",
              color: isPaid ? "var(--text-secondary)" : "var(--accent-cyan)",
              fontWeight: isPaid ? "normal" : "bold",
            }}
          >
            {isPaid ? "(Included)" : "(Plus)"}
          </span>
          {!isPaid && <span style={{ fontSize: "0.8em", color: "#0d9" }}>✨</span>}
        </label>

        {!isPaid && !canAutoSelect && (
          <p style={{ margin: "0.5rem 0 0 1.5rem", fontSize: "0.85em", color: "var(--accent-cyan)" }}>
            You've used your {limit} free auto-selects this month.{" "}
            <a href="#" style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>
              Upgrade to Plus
            </a>{" "}
            for unlimited.
          </p>
        )}

        {!isPaid && canAutoSelect && (
          <p style={{ margin: "0.25rem 0 0 1.5rem", fontSize: "0.9em", color: "var(--text-secondary)" }}>
            AI automatically chooses the best {featureLabel.toLowerCase()} · {remaining} left this month
          </p>
        )}

        {isPaid && (
          <p style={{ margin: "0.25rem 0 0 1.5rem", fontSize: "0.9em", color: "var(--text-secondary)" }}>
            AI automatically chooses the best {featureLabel.toLowerCase()} · {remaining} remaining this month
          </p>
        )}
      </div>
    </div>
  );
}
