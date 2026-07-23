import { useEffect, useState } from "react";
import { getSessionCost, type SessionCost } from "../services/costTracking";
import type { ReactNode } from "react";

export function CostWarningBanner(): ReactNode {
  const [cost, setCost] = useState<SessionCost>(getSessionCost());
  const [isDisabled, setIsDisabled] = useState(false);
  const isWarning = cost.estimatedCost >= 5.0;

  useEffect(() => {
    function handleCostUpdate(e: Event) {
      const event = e as CustomEvent;
      setCost(event.detail as SessionCost);
    }

    window.addEventListener("costUpdated", handleCostUpdate);
    return () => window.removeEventListener("costUpdated", handleCostUpdate);
  }, []);

  if (isDisabled) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#1a1a1a",
          border: "2px solid #ff4444",
          borderRadius: "8px",
          padding: "16px",
          zIndex: 9999,
          fontFamily: "monospace",
          color: "#ff4444",
          fontSize: "12px",
          maxWidth: "300px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "bold" }}>API DISABLED</div>
        <div style={{ marginBottom: "12px", fontSize: "11px", color: "#aaa" }}>
          Proxy endpoint disabled. Session cost: ${cost.estimatedCost.toFixed(2)}
        </div>
        <button
          onClick={() => setIsDisabled(false)}
          style={{
            padding: "4px 8px",
            backgroundColor: "#ff4444",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          Re-enable
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: isWarning ? "#2a1a1a" : "#1a1a1a",
        border: `2px solid ${isWarning ? "#ff4444" : "#00ffcc"}`,
        borderRadius: "8px",
        padding: "16px",
        zIndex: 9999,
        fontFamily: "monospace",
        color: isWarning ? "#ff4444" : "#00ffcc",
        fontSize: "12px",
        maxWidth: "300px",
        boxShadow: `0 4px 12px ${isWarning ? "rgba(255, 68, 68, 0.2)" : "rgba(0, 255, 204, 0.2)"}`,
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        {isWarning ? "⚠ COST WARNING" : "💰 Session Cost"}
      </div>
      <div style={{ marginBottom: "12px" }}>
        ${cost.estimatedCost.toFixed(2)} / $5.00 limit
      </div>
      <div style={{ fontSize: "11px", marginBottom: "12px", color: "#888" }}>
        Tokens: {cost.totalTokens.toLocaleString()}
      </div>
      {isWarning && (
        <button
          onClick={() => setIsDisabled(true)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#ff4444",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          STOP API CALLS
        </button>
      )}
    </div>
  );
}
