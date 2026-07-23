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

  const isPro = plan === "pro" || plan === "pro-plus";
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
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: !isPro ? "not-allowed" : "pointer" }}>
          <input
            type="radio"
            checked={useAutoSelect}
            onChange={() => {
              if (isPro || canAutoSelect) onToggleAutoSelect(true);
            }}
            disabled={!isPro && !canAutoSelect}
            style={{ cursor: !isPro && !canAutoSelect ? "not-allowed" : "pointer" }}
          />
          <span style={!isPro && !canAutoSelect ? { color: "var(--text-secondary)" } : { color: "var(--accent-cyan)" }}>
            Auto-Select {featureLabel}
          </span>
          <span
            style={{
              fontSize: "0.85em",
              color: isPro ? "var(--text-secondary)" : "var(--accent-cyan)",
              fontWeight: isPro ? "normal" : "bold",
            }}
          >
            {isPro ? "(Included)" : "(Pro)"}
          </span>
          {!isPro && <span style={{ fontSize: "0.8em", color: "#0d9" }}>✨</span>}
        </label>

        {!isPro && !canAutoSelect && (
          <p style={{ margin: "0.5rem 0 0 1.5rem", fontSize: "0.85em", color: "var(--accent-cyan)" }}>
            You've used your {limit} free auto-selects this month.{" "}
            <a href="#" style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>
              Upgrade to Pro
            </a>{" "}
            for unlimited.
          </p>
        )}

        {!isPro && canAutoSelect && (
          <p style={{ margin: "0.25rem 0 0 1.5rem", fontSize: "0.9em", color: "var(--text-secondary)" }}>
            AI automatically chooses the best {featureLabel.toLowerCase()} · {remaining} left this month
          </p>
        )}

        {isPro && (
          <p style={{ margin: "0.25rem 0 0 1.5rem", fontSize: "0.9em", color: "var(--text-secondary)" }}>
            AI automatically chooses the best {featureLabel.toLowerCase()} · {remaining} / {limit} used this month
          </p>
        )}
      </div>
    </div>
  );
}
