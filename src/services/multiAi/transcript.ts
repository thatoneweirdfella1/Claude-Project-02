/* The debate transcript shape Consensus and Synthesis read (Step 8.4).

   Debate mode itself (CANON Feature 9's first Multi-AI action) is Step 8.3
   — OPUS-tagged, not built in this session. This is the CONTRACT that step
   is expected to produce and this one consumes: CONVENTIONS.md rule 6 ("no
   black boxes... design the data shape... even in steps before it exists"),
   the same forward-seam pattern Step 6.5's stateBus and Step 8.2's
   Transparency card fields used before their own consumers/producers landed.

   Deliberately provider-agnostic — ROUTING.md DEBATE PARTNERS: "Consensus
   and Synthesis run on Opus at runtime, reading both sides' transcripts
   regardless of which two providers argued." Claude's side is always
   claudeText; the other side is named generically (partnerLabel/
   partnerText) so this module never hardcodes gpt-5.5/gemini-3.1-pro/
   grok-4.3/deepseek-v4-pro — Step 8.3 is the only place the roster itself
   is read. */

export interface DebateTranscript {
  /** The original question both sides answered. */
  question: string;
  claudeText: string;
  /** The roster label Step 8.3's partner picker used, e.g. "GPT-5.5" — a
      display name, not the api string (ROUTING.md's api-string : provider :
      role rows). */
  partnerLabel: string;
  partnerText: string;
}

/** One combined input block for the runtime model — question plus both
    sides, clearly delimited. Shared by Consensus and Synthesis so the two
    actions read the exact same framing of a debate. */
export function buildTranscriptInput(transcript: DebateTranscript): string {
  return [
    `QUESTION:\n${transcript.question.trim()}`,
    `CLAUDE'S ANSWER:\n${transcript.claudeText.trim()}`,
    `${transcript.partnerLabel.trim().toUpperCase()}'S ANSWER:\n${transcript.partnerText.trim()}`,
  ].join("\n\n");
}

/** True only when every side has real text — a malformed/incomplete
    transcript (e.g. a debate turn that never finished) should never reach
    the model as a wasted call. */
export function isCompleteTranscript(transcript: DebateTranscript): boolean {
  return (
    transcript.question.trim().length > 0 &&
    transcript.claudeText.trim().length > 0 &&
    transcript.partnerLabel.trim().length > 0 &&
    transcript.partnerText.trim().length > 0
  );
}
