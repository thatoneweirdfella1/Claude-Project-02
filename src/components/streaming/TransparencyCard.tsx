import { useSessionStore } from "../../stores/sessionStore";
import { generateSelfCritique } from "../../services/methodologyEngine";

export interface TransparencyCardProps {
  answer: string;
  showSelfCritique?: boolean;
}

/* Transparency card — shows self-critique and audit results during TEST phase
   of 3-State Methodology. Displays ADHD communication rule compliance and
   helps validate that output follows methodology guidelines. */
export function TransparencyCard({ answer, showSelfCritique = true }: TransparencyCardProps) {
  const methodology = useSessionStore((s) => s.methodology);
  const methodologyPhase = useSessionStore((s) => s.methodologyPhase);
  const lockedProblem = useSessionStore((s) => s.lockedProblemStatement);

  if (methodology !== "3-state" || methodologyPhase !== "test" || !showSelfCritique) {
    return null;
  }

  const { critique, confidence } = generateSelfCritique(answer, lockedProblem);

  return (
    <div className="transparency-card">
      <div className="transparency-card__header">
        <h3 className="transparency-card__title">TEST Phase Self-Critique</h3>
        <span className="transparency-card__confidence">{Math.round(confidence * 100)}% confident</span>
      </div>
      <div className="transparency-card__content">
        <p className="transparency-card__critique">{critique}</p>
      </div>
    </div>
  );
}
