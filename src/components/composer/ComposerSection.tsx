import { useState } from "react";
import type { TranslateAskRequest } from "../../services/composer";
import { GlassCard } from "../primitives";
import { Composer } from "./Composer";

/* Mounts the real Composer (Step 5.0's actual deliverable) and proves TRANSLATE
   & ASK truly emits a complete typed object — Step 5.2's orchestrator does not
   exist yet, so this is a temporary onSubmit consumer that displays the last
   emitted request, same "demo the real logic live" pattern as every prior
   Phase 3/4 step. Composer.tsx itself has no knowledge of this readout; Step
   5.2 replaces ComposerSection's onSubmit with a real pipeline call, unchanged
   Composer. */

export function ComposerSection() {
  const [lastRequest, setLastRequest] = useState<TranslateAskRequest | null>(null);

  return (
    <div className="composer-section">
      <Composer onSubmit={setLastRequest} />

      {lastRequest && (
        <GlassCard className="composer-section__readout" data-testid="composer-last-request">
          <p className="composer-section__readout-label">
            Step 5.0 demo — TRANSLATE &amp; ASK&rsquo;s emitted object. Step 5.2&rsquo;s orchestrator
            is the real consumer.
          </p>
          <pre className="composer-section__readout-json">
            {JSON.stringify(lastRequest, null, 2)}
          </pre>
        </GlassCard>
      )}
    </div>
  );
}
