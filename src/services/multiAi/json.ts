/* Pull a JSON object out of a model's text reply — strip ```json fences and,
   if needed, slice from the first "{" to the last "}" (models sometimes wrap
   JSON in prose). Same extraction translation/translate.ts and
   detection/detect.ts each define locally; Consensus and Synthesis share one
   copy here since both live in this same feature folder. Throws (caught by
   the caller) if nothing parses. */
export function extractJsonObject(text: string): unknown {
  const withoutFences = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new SyntaxError("No JSON object found in the model reply.");
    }
    return JSON.parse(withoutFences.slice(start, end + 1));
  }
}
