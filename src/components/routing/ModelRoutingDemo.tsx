import { overrideFromSelection, route } from "../../services/routingService";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { GlassCard } from "../primitives";
import { ModelDropdown } from "./ModelDropdown";

/* Proof that the Model dropdown is wired to routing.js's override input
   (Step 3.2 OUTPUT). No live pipeline exists yet (translated prompts are
   Step 2.x's job, the composer is Step 5.0), so this calls route() directly
   on a fixed sample prompt and re-renders on every dropdown/plan change —
   same "demo the real logic, not a mock" pattern as Step 2.3's
   ConversationArea. The Paid-plan checkbox reuses the existing account-store
   plan flag (Step 1.7) so BOTH spot-checked behaviors are visibly provable
   live: override always wins (paid), and free plan gates Opus to Sonnet with
   a note. routing.js itself is untouched — this only calls it. */

const SAMPLE_PROMPT =
  "design a caching strategy for a distributed system under a strict latency budget";

export function ModelRoutingDemo() {
  const model = useSessionStore((s) => s.model);
  const plan = useAccountStore((s) => s.plan);
  const setPlan = useAccountStore((s) => s.setPlan);

  const result = route({
    prompt: SAMPLE_PROMPT,
    plan,
    confidence: 95,
    override: overrideFromSelection(model),
  });

  return (
    <GlassCard className="model-routing-demo" data-testid="model-routing-demo">
      <p className="model-routing-demo__label">
        Step 3.2 demo — the Model dropdown wired to routing.js&rsquo;s override. Live composer
        arrives in Steps 5.0+.
      </p>

      <div className="model-routing-demo__controls">
        <ModelDropdown />
        <label className="model-routing-demo__plan-toggle">
          <input
            type="checkbox"
            checked={plan === "paid"}
            onChange={(event) => setPlan(event.target.checked ? "paid" : "free")}
          />
          Paid plan
        </label>
      </div>

      <p className="model-routing-demo__result" data-testid="model-routing-demo-result">
        Routed to <strong>{result.modelLabel}</strong> ({result.tier} tier)
        {result.downgraded ? " — downgraded" : ""}
      </p>

      {result.notes.length > 0 && (
        <ul className="model-routing-demo__notes">
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
