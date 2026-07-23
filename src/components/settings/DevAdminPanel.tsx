/** Development admin panel — visible only in dev mode. Allows testing of
    Pro tier features, usage reset, and subscription tier changes. */

import { useAccountStore } from "../../stores/accountStore";
import type { SubscriptionTier } from "../../stores/types";

export function DevAdminPanel() {
  const isDev = import.meta.env.DEV;
  if (!isDev) return null;

  const plan = useAccountStore((s) => s.plan);
  const autoSelectUsed = useAccountStore((s) => s.autoSelectUsedThisMonth);
  const setPlan = useAccountStore((s) => s.setPlan);

  const tiers: SubscriptionTier[] = ["free", "pro", "pro-plus"];

  const handleResetUsage = () => {
    // Reset can be done by changing plan (triggers reset), but we need a direct reset action
    // For now, this is a placeholder — the monthly reset happens automatically
    alert("Usage resets automatically on the 1st of each month during auto-select logging.");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        backgroundColor: "#1a1a1a",
        border: "1px solid #444",
        borderRadius: "8px",
        padding: "1rem",
        zIndex: 9999,
        fontSize: "12px",
        maxWidth: "250px",
        color: "#ccc",
        fontFamily: "monospace",
      }}
    >
      <div style={{ marginBottom: "0.5rem", fontWeight: "bold", color: "#0f0" }}>
        DEV ADMIN PANEL
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Subscription Tier:</strong>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setPlan(tier)}
              style={{
                padding: "0.25rem 0.75rem",
                backgroundColor: plan === tier ? "#0d9" : "#333",
                color: plan === tier ? "#000" : "#ccc",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: plan === tier ? "bold" : "normal",
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Auto-Select Usage:</strong>
        </div>
        <div style={{ color: "#fa0" }}>
          {autoSelectUsed} / month
        </div>
      </div>

      <button
        onClick={handleResetUsage}
        style={{
          padding: "0.5rem",
          backgroundColor: "#333",
          color: "#ccc",
          border: "1px solid #555",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
          fontSize: "11px",
        }}
      >
        Reset Usage (auto on 1st)
      </button>
    </div>
  );
}
