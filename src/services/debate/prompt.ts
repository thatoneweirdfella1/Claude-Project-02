/* Debate side prompts (Step 8.3). PIPELINE.md MULTI-AI ACTIONS: "two AI
   streams argue opposite sides."

   Both sides get the SAME instructions with only the assigned stance swapped
   — a debate where one side is told to be thorough and the other brief isn't
   two positions on the question, it's a formatting difference wearing a
   debate's clothes. The stance is the only variable.

   Deliberately NOT asking for JSON (unlike translation/detection/consensus):
   a debate side's whole output IS the prose the user reads in its column.
   There is no structured field to extract, so there's nothing to parse and
   nothing that can fail to parse. */

export type DebateStance = "for" | "against";

const SHARED_RULES = [
  "Argue your assigned side as well as it can honestly be argued.",
  "Lead with your strongest point, not a preamble. No throat-clearing.",
  "Be concrete: name specific tradeoffs, costs, failure modes, or evidence.",
  "Acknowledge the strongest point against you and answer it — do not pretend it doesn't exist.",
  "Do not hedge into agreement with the other side. Your job is the sharpest honest version of YOUR side.",
  "Never fabricate facts, studies, numbers, or quotes to win. An argument that needs invention is a weak argument.",
  "Around 3 short paragraphs. No headers, no bullet lists, no markdown.",
  "Do not name yourself, the other model, or refer to 'the other side' by vendor.",
].join("\n- ");

/** CANON's ADHD rules apply to debate output the same as any other answer —
    this is content the user reads under cognitive load, so the length cap and
    "no dense info walls" rule are in the prompt itself, not left to chance. */
export function debateSystemPrompt(stance: DebateStance): string {
  const assignment =
    stance === "for"
      ? "You are arguing FOR the proposition: in favour, supportive, the case that it holds or should be done."
      : "You are arguing AGAINST the proposition: the case that it does not hold, or should not be done, or that the framing itself is wrong.";

  return [
    "You are one side of a two-sided debate. Another AI from a different vendor is arguing the opposite side at the same time.",
    "",
    assignment,
    "",
    `Rules:\n- ${SHARED_RULES}`,
  ].join("\n");
}

/** The user-facing framing of what's being debated. Kept identical for both
    sides so neither gets a differently-worded question. */
export function debateInput(question: string): string {
  return `The proposition under debate:\n\n${question.trim()}`;
}
