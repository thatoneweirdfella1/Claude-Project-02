/* Step 5.1 verification — the answer-display state helper. Confirms
   streamAnswer grows the text incrementally (never re-emits a shrunk or
   out-of-order string) and terminates in a "done" state carrying the router
   honesty fields verbatim. */

import { describe, expect, it } from "vitest";
import { PIPELINE_STAGES, streamAnswer } from "./answerDisplay";

async function* tokensFrom(chunks: string[]): AsyncGenerator<string> {
  for (const chunk of chunks) yield chunk;
}

describe("PIPELINE_STAGES", () => {
  it("is exactly the four named stages, in order (this step's own spec)", () => {
    expect(PIPELINE_STAGES).toEqual(["translating", "routing", "composing", "answering"]);
  });
});

describe("streamAnswer", () => {
  it("yields strictly-growing streaming states, then one done state", async () => {
    const states = [];
    for await (const state of streamAnswer(tokensFrom(["Hel", "lo ", "world"]), {
      confidence: 88,
      downgraded: false,
      notes: [],
    })) {
      states.push(state);
    }

    expect(states).toHaveLength(4); // 3 streaming + 1 done
    expect(states[0]).toEqual({ kind: "streaming", text: "Hel" });
    expect(states[1]).toEqual({ kind: "streaming", text: "Hel" + "lo " });
    expect(states[2]).toEqual({ kind: "streaming", text: "Hello world" });
    expect(states[3]).toEqual({
      kind: "done",
      text: "Hello world",
      confidence: 88,
      downgraded: false,
      notes: [],
    });
  });

  it("carries the router's downgraded flag and notes into the done state verbatim", async () => {
    const states = [];
    for await (const state of streamAnswer(tokensFrom(["ok"]), {
      confidence: 95,
      downgraded: true,
      notes: ["This question scored Deep tier (Opus 4.8)... Answered with Sonnet 5 instead."],
    })) {
      states.push(state);
    }
    const done = states[states.length - 1];
    expect(done.kind).toBe("done");
    if (done.kind === "done") {
      expect(done.downgraded).toBe(true);
      expect(done.notes[0]).toMatch(/Sonnet 5 instead/);
    }
  });

  it("handles an empty token stream (still reaches done with empty text)", async () => {
    const states = [];
    for await (const state of streamAnswer(tokensFrom([]), { confidence: 90, downgraded: false, notes: [] })) {
      states.push(state);
    }
    expect(states).toEqual([{ kind: "done", text: "", confidence: 90, downgraded: false, notes: [] }]);
  });
});
