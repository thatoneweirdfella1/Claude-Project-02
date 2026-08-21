import type { StateDetectionResult } from "./schema";

/** Fast, private, deterministic state read used before a free manual handoff.
    It never sends the user's text anywhere. Low-signal dimensions remain null. */
export function detectStateLocally(rawInput: string): StateDetectionResult {
  const text = rawInput.toLowerCase();
  const has = (pattern: RegExp) => pattern.test(text);

  const emotion = has(/overwhelm|too much|can't keep up|all over the place/)
    ? { value: "overwhelmed" as const, confidence: 86 }
    : has(/frustrat|annoy|wtf|angry|mad|doesn'?t work/)
      ? { value: "frustrated" as const, confidence: 84 }
      : has(/anxious|worried|nervous|panic|scared/)
        ? { value: "anxious" as const, confidence: 82 }
        : has(/excited|awesome|love this|can'?t wait/)
          ? { value: "excited" as const, confidence: 78 }
          : has(/calm|no rush|take your time/)
            ? { value: "calm" as const, confidence: 75 }
            : null;

  const rsd = has(/rejected|judg|embarrass|disappoint|let .* down|hate me/)
    ? { value: "high" as const, confidence: 72 }
    : has(/feedback|critici|approval/)
      ? { value: "medium" as const, confidence: 62 }
      : null;

  const interest = has(/deep dive|research|detail|everything|entire|comprehensive/)
    ? { value: "high" as const, confidence: 78 }
    : has(/quick|brief|just tell me|short answer/)
      ? { value: "low" as const, confidence: 76 }
      : null;

  const cognitive = has(/stuck|no clue|don'?t know where|can'?t start/)
    ? { value: "stuck" as const, confidence: 84 }
    : has(/racing|million things|brain won'?t stop|so many/)
      ? { value: "racing" as const, confidence: 82 }
      : has(/compare|analy[sz]|evidence|research|evaluate/)
        ? { value: "analytical" as const, confidence: 76 }
        : has(/create|imagine|brainstorm|design|write/)
          ? { value: "creative" as const, confidence: 72 }
          : { value: "processing" as const, confidence: 55 };

  const found = [
    emotion ? `emotion: ${emotion.value}` : "",
    rsd ? `sensitivity: ${rsd.value}` : "",
    interest ? `detail interest: ${interest.value}` : "",
    cognitive ? `thinking mode: ${cognitive.value}` : "",
  ].filter(Boolean);

  return {
    emotion,
    rsd,
    interest,
    cognitive,
    summary: found.length
      ? `Private local read — ${found.join(", ")}. You can correct or dismiss this before continuing.`
      : "Private local read found no strong state signal. You can continue with your current settings.",
  };
}



