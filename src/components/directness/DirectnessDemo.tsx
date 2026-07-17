import { composeFinalPrompt } from "../../services/composition";
import { useSessionStore } from "../../stores/sessionStore";
import { GlassCard } from "../primitives";
import { DirectnessDropdown } from "./DirectnessDropdown";

/* Proof that the Directness selector is wired to the store AND feeds the
   composition engine (Step 4.4 OUTPUT). No live composer yet (Step 5.0), so
   this composes a fixed sample question with the store's current directness and
   shows the resulting TONE section change live — same "demo the real logic"
   pattern as Steps 2.3 / 3.2. */

const SAMPLE_QUESTION = "How do I stay focused while studying?";

export function DirectnessDemo() {
  const directness = useSessionStore((s) => s.directness);

  const composed = composeFinalPrompt({ question: SAMPLE_QUESTION, directness });
  const tone = composed.sections.find((s) => s.name === "directness")?.content ?? "";

  return (
    <GlassCard className="directness-demo" data-testid="directness-demo">
      <p className="directness-demo__label">
        Step 4.4 demo — Directness selector feeding the composition engine. Live composer arrives
        in Steps 5.0+.
      </p>
      <DirectnessDropdown />
      <p className="directness-demo__tone" data-testid="directness-demo-tone">
        Composed <strong>TONE</strong>: {tone}
      </p>
      <p className="directness-demo__note">
        When state detection lands (Phase 6), an “Overwhelmed” reading will auto-recommend Level 1.
      </p>
    </GlassCard>
  );
}
