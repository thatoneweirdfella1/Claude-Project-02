import {
  GAP_TYPE_LABELS,
  type GatedTranslation,
} from "../../services/translation";
import { GlassCard, Pill } from "../primitives";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ClarifyPrompt } from "./ClarifyPrompt";

/* TranslationCard (Step 2.3) — renders one translation attempt in the
   conversation area, switching on the gated outcome:
     proceed (80+)   : translated prompt + confidence score
     moderate (60-79): the above + a visible moderate-confidence note
     clarify (<60)   : the ClarifyPrompt instead of proceeding
     empty/too-large/error: neutral, non-judgmental status messages

   Detected gaps and the engine's reasoning are shown for transparency
   (CONVENTIONS.md rule 6 — no black boxes; the full transparency card is
   Step 8.2, this is the inline seed of it). */

export interface TranslationCardProps {
  gated: GatedTranslation;
  onRefine?: (refinedInput: string) => void;
}

export function TranslationCard({ gated, onRefine }: TranslationCardProps) {
  if (gated.kind === "empty") return null;

  if (gated.kind === "too-large") {
    return (
      <GlassCard className="translation-card" data-testid="translation-too-large">
        <p className="translation-card__status">
          That’s a lot to take in at once ({gated.chars.toLocaleString()} characters). Could you
          trim it toward the core question? I can work with up to about{" "}
          {gated.limit.toLocaleString()} characters at a time.
        </p>
      </GlassCard>
    );
  }

  if (gated.kind === "error") {
    return (
      <GlassCard className="translation-card" data-testid="translation-error">
        <p className="translation-card__status">
          Something went wrong reading that — it wasn’t you. Give it another try in a moment.
        </p>
      </GlassCard>
    );
  }

  if (gated.kind === "clarify") {
    return <ClarifyPrompt question={gated.question} onRefine={onRefine} />;
  }

  // proceed | moderate — both show the translated prompt and the score.
  const { result, gate } = gated;
  return (
    <GlassCard className="translation-card" data-testid="translation-card">
      <div className="translation-card__header">
        <span className="translation-card__label">Here’s what I’ll answer</span>
        <ConfidenceBadge gate={gate} />
      </div>

      {gated.kind === "moderate" && (
        <p className="translation-card__note" data-testid="moderate-note">
          {gated.note}
        </p>
      )}

      <p className="translation-card__prompt">{result.translatedPrompt}</p>

      {result.detectedGaps.length > 0 && (
        <div className="translation-card__gaps" aria-label="What I adjusted for">
          {result.detectedGaps.map((gap) => (
            <Pill key={gap} color="var(--text-secondary)">
              {GAP_TYPE_LABELS[gap]}
            </Pill>
          ))}
        </div>
      )}

      <p className="translation-card__reasoning">{result.reasoning}</p>
    </GlassCard>
  );
}
