import type { StateDetectionResult } from "./schema";

/** Fast, private, deterministic state read used before a free manual handoff.
 * It never sends text anywhere and emits only the approved current taxonomy. */
export function detectStateLocally(rawInput: string): StateDetectionResult {
  const text = rawInput.toLowerCase();
  const has = (pattern: RegExp) => pattern.test(text);

  const emotion = has(/overwhelm|too much|can't keep up|all over the place/)
    ? { value: "overwhelmed" as const, confidence: 86 }
    : has(/frustrat|annoy|wtf|angry|mad|doesn'?t work/)
      ? { value: "frustrated" as const, confidence: 84 }
      : has(/anxious|worried|nervous|panic|scared/)
        ? { value: "anxious" as const, confidence: 82 }
        : has(/exhaust|tired|drained|low energy|no energy|can barely/)
          ? { value: "low-energy" as const, confidence: 80 }
          : has(/excited|awesome|love this|can'?t wait/)
            ? { value: "excited" as const, confidence: 78 }
            : has(/focus|locked in|specific goal|exactly what i need/)
              ? { value: "focused" as const, confidence: 75 }
              : has(/calm|no rush|take your time/)
                ? { value: "calm" as const, confidence: 74 }
                : null;

  const rsd = has(/rejected|judg|embarrass|disappoint|let .* down|hate me|sorry if|is that stupid/)
    ? { value: "high" as const, confidence: 72 }
    : has(/feedback|critici|approval|is this okay/)
      ? { value: "medium" as const, confidence: 62 }
      : has(/just tell me|be direct|don'?t sugarcoat/)
        ? { value: "low" as const, confidence: 64 }
        : null;

  const interest = has(/deep dive|research|detail|everything|entire|comprehensive|go deeper/)
    ? { value: "high" as const, confidence: 78 }
    : has(/quick|brief|just tell me|short answer|don'?t care about details/)
      ? { value: "low" as const, confidence: 76 }
      : null;

  const cognitive = has(/which should|choose|pick between|decide|trade.?off|best option/)
    ? { value: "decision" as const, confidence: 82 }
    : has(/\b(?:how do i|steps?|implement|build|fix|do this|next action|execute|plan)\b/)
      ? { value: "execution" as const, confidence: 80 }
      : has(/compare|analy[sz]|evidence|research|evaluate|why exactly|cause/)
        ? { value: "analytical" as const, confidence: 78 }
        : has(/create|imagine|brainstorm|design|write|invent/)
          ? { value: "creative" as const, confidence: 74 }
          : has(/what if|could be|possibilit|explore|trying to understand|figure out/)
            ? { value: "exploratory" as const, confidence: 70 }
            : null;

  const found = [
    emotion ? `emotion: ${emotion.value}` : "",
    rsd ? `sensitivity: ${rsd.value}` : "",
    interest ? `interest: ${interest.value}` : "",
    cognitive ? `cognitive mode: ${cognitive.value}` : "",
  ].filter(Boolean);

  return {
    emotion,
    rsd,
    interest,
    cognitive,
    summary: found.length
      ? `Private local read — ${found.join(", ")}. Nothing changes unless you approve it.`
      : "Private local read found no strong state signal. No change is suggested.",
  };
}
