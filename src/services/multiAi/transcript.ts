/* The debate transcript shape Consensus and Synthesis read (Step 8.4).

   R23 (site repair): the original shape hardcoded exactly two sides
   (claudeText/partnerLabel/partnerText), so a 3- or 4-way debate silently
   dropped every partner after the first one from Consensus and Synthesis —
   the runtime model never saw their arguments at all. `participants` now
   carries every successful side, Claude included, in the same stable order
   `runDebate` returned them in, so 2-, 3-, and 4-participant transcripts all
   feed the runtime model every voice exactly once. */

export interface TranscriptParticipant {
  /** Display name — "Claude" or the roster label, e.g. "GPT-5.5". */
  label: string;
  /** Exact execution route carried into adjudication, never inferred from
      the display label by the consensus/synthesis model. */
  provider: string;
  model: string;
  text: string;
}

export interface DebateTranscript {
  /** The original question every side answered. */
  question: string;
  /** Every side that landed, Claude first, then partners in stable debate
      order. Always at least 2 entries for a transcript Consensus/Synthesis
      will accept (isCompleteTranscript enforces this). */
  participants: TranscriptParticipant[];
}

/** One combined input block for the runtime model — question plus every
    side, clearly delimited. Shared by Consensus and Synthesis so the two
    actions read the exact same framing of a debate. */
export function buildTranscriptInput(transcript: DebateTranscript): string {
  return [
    `QUESTION:\n${transcript.question.trim()}`,
    ...transcript.participants.map(
      (p) => `${p.label.trim().toUpperCase()} [${p.provider.trim()} · ${p.model.trim()}]'S ANSWER:\n${p.text.trim()}`,
    ),
  ].join("\n\n");
}

/** True only when every side has real text — a malformed/incomplete
    transcript (e.g. a debate turn that never finished) should never reach
    the model as a wasted call. Requires at least two participants: a
    "debate" with only one voice has nothing to find consensus on. */
export function isCompleteTranscript(transcript: DebateTranscript): boolean {
  return (
    transcript.question.trim().length > 0 &&
    transcript.participants.length >= 2 &&
    transcript.participants.every(
      (p) => p.label.trim().length > 0
        && p.provider.trim().length > 0
        && p.model.trim().length > 0
        && p.text.trim().length > 0,
    )
  );
}
