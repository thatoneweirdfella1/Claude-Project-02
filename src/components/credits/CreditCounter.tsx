import { Coins } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";

export function CreditCounter() {
  const balance = useAccountStore((state) => state.creditBalance);
  const setScreenLocation = useSessionStore((state) => state.setScreenLocation);

  return (
    <button
      type="button"
      className="credit-counter"
      onClick={() => setScreenLocation("settings", "plan")}
      title="Open subscription and credit settings"
      aria-label={`Credits: ${balance.toFixed(2)}`}
    >
      <Coins size={16} aria-hidden="true" />
      <span className="credit-counter__label">Credits</span>
      <strong>{`${balance.toFixed(2)}`}</strong>
    </button>
  );
}
