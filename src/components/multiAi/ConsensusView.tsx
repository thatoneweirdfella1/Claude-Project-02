import type { ConsensusResult } from "../../services/multiAi";

/* Consensus view (Step 8.4) — PIPELINE.md MULTI-AI ACTIONS: "Consensus:
   common ground after a debate (disagreement, common ground, unified
   view)." Purely presentational, same shape as the Step 8.2 Transparency
   sub-cards: given an already-resolved ConsensusResult, render it — calling
   runConsensus() and managing loading/error state is whoever mounts this
   under a real Multi-AI Actions entry point (Step 8.3, not built this
   session). */

export interface ConsensusViewProps {
  result: ConsensusResult;
}

export function ConsensusView({ result }: ConsensusViewProps) {
  return (
    <div className="consensus-view" data-testid="consensus-view">
      <div className="consensus-view__section">
        <p className="consensus-view__title">Disagreement</p>
        <p className="consensus-view__text">{result.disagreement}</p>
      </div>
      <div className="consensus-view__section">
        <p className="consensus-view__title">Common ground</p>
        <p className="consensus-view__text">{result.commonGround}</p>
      </div>
      <div className="consensus-view__section">
        <p className="consensus-view__title">Unified view</p>
        <p className="consensus-view__text">{result.unifiedView}</p>
      </div>
    </div>
  );
}
