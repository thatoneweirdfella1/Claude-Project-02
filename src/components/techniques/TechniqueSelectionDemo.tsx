import { composeFinalPrompt } from "../../services/composition";
import { autoDetectTechniques, isAutoMode } from "../../services/techniques";
import { useSessionStore } from "../../stores/sessionStore";
import { GlassCard } from "../primitives";
import { TechniqueDropdown } from "./TechniqueDropdown";

/* Proof that the Technique dropdown is wired to both the store AND the
   composition engine (Step 4.5 OUTPUT), and that Auto-detect is never a black
   box — when it's active, this shows exactly what it picked and why. No live
   composer yet (Step 5.0), so this composes one fixed sample question, same
   "demo the real logic" pattern as Steps 2.3 / 3.2 / 4.4. */

const SAMPLE_QUESTION = "How do I compare Postgres and MongoDB for my use case?";

export function TechniqueSelectionDemo() {
  const techniques = useSessionStore((s) => s.techniques);

  const auto = isAutoMode(techniques);
  const autoResult = auto ? autoDetectTechniques(SAMPLE_QUESTION) : null;
  const effectiveTechniques = auto ? (autoResult?.selected ?? []) : techniques;

  const composed = composeFinalPrompt({
    question: SAMPLE_QUESTION,
    techniques: effectiveTechniques,
  });
  const techniquesSection = composed.sections.find((s) => s.name === "techniques")?.content ?? "";

  return (
    <GlassCard className="technique-demo" data-testid="technique-demo">
      <p className="technique-demo__label">
        Step 4.5 demo — Technique selector wired to the store and composition engine. Live composer
        arrives in Steps 5.0+.
      </p>
      <TechniqueDropdown />

      {auto && autoResult && (
        <p className="technique-demo__auto-reasoning" data-testid="technique-demo-auto-reasoning">
          Auto-detect for the sample question: {autoResult.reasoning}
        </p>
      )}

      <p className="technique-demo__composed" data-testid="technique-demo-composed">
        Composed <strong>TECHNIQUES</strong>: {techniquesSection}
      </p>
    </GlassCard>
  );
}
