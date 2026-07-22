import { useEffect, useState } from "react";
import type { AnswerDisplayState } from "../../services/answerDisplay";

/* Drives an AsyncGenerator<AnswerDisplayState> into React state (Step 5.1).
   `source` is a FACTORY (call it to start a fresh attempt), not the generator
   itself, because starting a generator is a real side effect — the caller
   must control WHEN a new one starts, not have it restart on every render.

   Consumers MUST give `source` a stable identity (a module-level function, or
   memoized via useCallback keyed on whatever should trigger a new attempt) —
   a fresh function reference every render would restart the stream on every
   render. This is the same "identity matters" contract as any effect
   dependency; documented here because getting it wrong silently produces a
   stream that never finishes rendering. */
export function useAnswerDisplay(
  source: (() => AsyncGenerator<AnswerDisplayState>) | null,
): AnswerDisplayState | null {
  const [state, setState] = useState<AnswerDisplayState | null>(null);

  useEffect(() => {
    if (!source) {
      setState(null);
      return;
    }
    let cancelled = false;
    setState(null);

    (async () => {
      try {
        for await (const next of source()) {
          if (cancelled) break;
          setState(next);
        }
      } catch (error) {
        if (!cancelled) {
          setState({ kind: "error", message: error instanceof Error ? error.message : String(error) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source]);

  return state;
}
