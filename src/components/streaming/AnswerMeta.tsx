/* The confidence line + router honesty output (Step 5.1), shown under a
   finished assistant answer, matching the screenshot's "92% confident this is
   what you meant." Router honesty (ROUTING.md: "the free tier never silently
   gives a worse answer, it always says when a stronger route existed") is
   rendered directly below it in the SAME quiet monochrome — information, not
   a warning and not an upsell, per this step's own explicit instruction. */

export interface AnswerMetaProps {
  confidence: number;
  /** Accepted for API completeness (callers pass RouteResult.downgraded
      straight through) but not used for any visual distinction — the step's
      own instruction is "the same quiet monochrome as the confidence line,"
      i.e. downgraded answers must NOT look different, only say so in notes. */
  downgraded?: boolean;
  notes?: string[];
}

export function AnswerMeta({ confidence, notes = [] }: AnswerMetaProps) {
  return (
    <div className="answer-meta" data-testid="answer-meta">
      <p className="answer-meta__confidence">{Math.round(confidence)}% confident this is what you meant.</p>
      {notes.map((note) => (
        <p key={note} className="answer-meta__note">
          {note}
        </p>
      ))}
    </div>
  );
}
