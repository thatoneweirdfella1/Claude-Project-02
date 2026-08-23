/* Step 5.2 verification — the whole pipeline run end to end, offline.
   The ONLY stub is the model client (the sandbox has no network/proxy — the
   live streamed run is parked on the Step 12.3 deploy, BUILD-LOG PARKED);
   translation parsing/gating, routing.js, technique auto-detect, and
   composition all run for real, so the numbers asserted here are the engines'
   actual outputs, not canned expectations. */

import { describe, expect, it, vi } from "vitest";
import {
  runPipeline,
  resolveTechniqueSelection,
  type PipelineEvent,
  type PipelineModelClient,
} from "./orchestrator";
import { buildTranslateAskRequest, type TranslateAskSettings } from "../composer";
import type { ProxyCompletionRequest } from "../proxyClient";
import { route } from "../routingService";

function translationJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    translatedPrompt: "Explain how quantum entanglement works in simple terms.",
    confidence: 92,
    detectedGaps: ["tangential-preamble"],
    reasoning: "Read past the preamble to the core question.",
    ...overrides,
  });
}

const ANSWER_TOKENS = ["Entangled particles ", "share one state. ", "Distance doesn't matter."];

function stubClient(overrides: Partial<PipelineModelClient> = {}): PipelineModelClient {
  return {
    complete: async () => translationJson(),
    stream: async function* () {
      for (const t of ANSWER_TOKENS) yield t;
    },
    ...overrides,
  };
}

const DEFAULT_SETTINGS: TranslateAskSettings = {
  model: "auto",
  directness: 2,
  techniques: ["auto-detect"],
};

function request(rawInput: string, settings: Partial<TranslateAskSettings> = {}) {
  return buildTranslateAskRequest(rawInput, { ...DEFAULT_SETTINGS, ...settings }, []);
}

async function collect(gen: AsyncGenerator<PipelineEvent>): Promise<PipelineEvent[]> {
  const out: PipelineEvent[] = [];
  for await (const event of gen) out.push(event);
  return out;
}

function byKind<K extends PipelineEvent["kind"]>(
  events: PipelineEvent[],
  kind: K,
): Extract<PipelineEvent, { kind: K }> {
  const found = events.find((e) => e.kind === kind);
  if (!found) throw new Error(`no ${kind} event in [${events.map((e) => e.kind).join(", ")}]`);
  return found as Extract<PipelineEvent, { kind: K }>;
}

describe("runPipeline — a confident question flows through all five stages", () => {
  it("yields every stage's typed output in PIPELINE.md order, ending in a streamed answer", async () => {
    const events = await collect(
      runPipeline(
        request("ok so I was reading about physics and got confused — quantum entanglement, how does it work??"),
        { client: stubClient(), plan: "free" },
      ),
    );

    // The full stage order, as yielded.
    expect(events.map((e) => e.kind)).toEqual([
      "stage", // translating
      "translation",
      "stage", // routing
      "route",
      "stage", // composing (covers technique selection + composition)
      "techniques",
      "composed",
      "stage", // answering
      "streaming",
      "streaming",
      "streaming",
      "done",
    ]);

    const gated = byKind(events, "translation").gated;
    expect(gated.kind).toBe("proceed"); // 92 ≥ 80
    if (gated.kind !== "proceed") return;
    expect(gated.result.confidence).toBe(92);

    // Routing ran on the TRANSLATED prompt with the translation's confidence.
    const routed = byKind(events, "route").result;
    expect(routed.complexity).toBe(routed.effectiveComplexity); // 80+: no escalation
    expect(["haiku", "sonnet"]).toContain(routed.model); // free plan never routes to opus

    // Technique selection consumed routing's output and respected the cap.
    const selection = byKind(events, "techniques").selection;
    expect(selection.selected.length).toBeGreaterThan(0);
    expect(selection.selected.length).toBeLessThanOrEqual(4);

    // Composition carried the translated question and the selected techniques.
    const composed = byKind(events, "composed").composed;
    expect(composed.prompt).toContain(gated.result.translatedPrompt);
    expect(composed.order[0]).toBe("base-template");

    // Streaming grew strictly, and done carried routing's honesty fields verbatim.
    const streamed = events.filter((e) => e.kind === "streaming");
    expect(streamed[streamed.length - 1]).toMatchObject({ text: ANSWER_TOKENS.join("") });
    const done = byKind(events, "done").done;
    expect(done.text).toBe(ANSWER_TOKENS.join(""));
    expect(done.confidence).toBe(92);
    expect(done.downgraded).toBe(routed.downgraded);
    expect(done.notes).toEqual(routed.notes);
  });

  it("carries only included attached context into the connected final prompt", async () => {
    const req = buildTranslateAskRequest("Use my attached notes.", DEFAULT_SETTINGS, [
      { id: "included", kind: "text", label: "Current notes", content: "PIPELINE_CONTEXT_INCLUDED_4432", bytes: 30 },
      { id: "excluded", kind: "text", label: "Old notes", content: "PIPELINE_CONTEXT_EXCLUDED_8821", bytes: 30, included: false },
    ]);
    const events = await collect(runPipeline(req, { client: stubClient(), plan: "free" }));
    const prompt = byKind(events, "composed").composed.prompt;
    expect(prompt).toContain("PIPELINE_CONTEXT_INCLUDED_4432");
    expect(prompt).not.toContain("PIPELINE_CONTEXT_EXCLUDED_8821");
  });

  it("sends the COMPOSED prompt to the ROUTED model through the client", async () => {
    const streamSpy = vi.fn(async function* (_req: ProxyCompletionRequest) {
      yield "answer";
    });
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient({ stream: streamSpy }),
        plan: "free",
      }),
    );
    const routed = byKind(events, "route").result;
    const composed = byKind(events, "composed").composed;
    expect(streamSpy).toHaveBeenCalledTimes(1);
    expect(streamSpy.mock.calls[0][0]).toMatchObject({
      model: routed.apiString,
      input: composed.prompt,
    });
  });

  it("uses an approved edited translation without paying for a duplicate translation call", async () => {
    const completeSpy = vi.fn(async () => translationJson());
    const editedRequest = "Explain entanglement with one concrete analogy and no equations.";
    const events = await collect(
      runPipeline(request("raw wording that was already translated and reviewed"), {
        client: stubClient({ complete: completeSpy }),
        plan: "free",
        pretranslated: {
          translatedPrompt: editedRequest,
          confidence: 94,
          detectedGaps: ["tangential-preamble"],
          reasoning: "The user reviewed and approved this prepared request.",
        },
      }),
    );

    expect(completeSpy).not.toHaveBeenCalled();
    const gated = byKind(events, "translation").gated;
    expect(gated.kind).toBe("proceed");
    expect(byKind(events, "composed").composed.prompt).toContain(editedRequest);
    expect(byKind(events, "done").done.text).toBe(ANSWER_TOKENS.join(""));
  });
});

describe("runPipeline — the confidence gates", () => {
  it("a vague question (<60) stops at the clarifying question and never routes or streams", async () => {
    const streamSpy = vi.fn(async function* () {
      yield "should never happen";
    });
    const events = await collect(
      runPipeline(request("idk... the thing? you know what I mean"), {
        client: stubClient({
          complete: async () =>
            translationJson({ translatedPrompt: "Explain the thing.", confidence: 40 }),
          stream: streamSpy,
        }),
        plan: "free",
      }),
    );

    expect(events.map((e) => e.kind)).toEqual(["stage", "translation"]);
    const gated = byKind(events, "translation").gated;
    expect(gated.kind).toBe("clarify");
    if (gated.kind !== "clarify") return;
    expect(gated.question).toContain("It sounds like you might be asking");
    expect(streamSpy).not.toHaveBeenCalled(); // no route event, no model call — the run ended
  });

  it("moderate confidence (60-79) proceeds, escalated one step with a visible note carried to done", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient({ complete: async () => translationJson({ confidence: 72 }) }),
        plan: "free",
      }),
    );
    const routed = byKind(events, "route").result;
    expect(routed.effectiveComplexity).toBe(Math.min(10, routed.complexity + 1));
    const escalationNote = routed.notes.find((n) => n.includes("confidence 72"));
    expect(escalationNote).toBeDefined();
    // Carried forward, not dropped — the done event holds the same notes.
    expect(byKind(events, "done").done.notes).toEqual(routed.notes);
  });

  it("free-plan Deep routes are downgraded to Sonnet WITH the honesty note carried to done", async () => {
    const deepPrompt =
      "Design a distributed caching architecture for a multi-region system, analyze the consistency and invalidation trade-offs under concurrent writes, and prove the invalidation strategy cannot serve stale data while satisfying latency, cost, and availability constraints.";
    // Precondition: this prompt genuinely scores Deep when unconstrained (paid).
    expect(route({ prompt: deepPrompt, confidence: 95, plan: "paid" }).model).toBe("opus");

    const events = await collect(
      runPipeline(request("please design me that caching system"), {
        client: stubClient({
          complete: async () =>
            translationJson({ translatedPrompt: deepPrompt, confidence: 95 }),
        }),
        plan: "free",
      }),
    );
    const routed = byKind(events, "route").result;
    expect(routed.model).toBe("sonnet");
    expect(routed.downgraded).toBe(true);
    const done = byKind(events, "done").done;
    expect(done.downgraded).toBe(true);
    expect(done.notes.join(" ")).toMatch(/Opus/);
  });
});

describe("runPipeline — user choices are honored", () => {
  it("a manual model override wins on the paid plan", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?", { model: "claude-opus-4-8" }), {
        client: stubClient(),
        plan: "pro",
      }),
    );
    expect(byKind(events, "route").result.model).toBe("opus");
  });

  it("a manual technique stack is used literally, in the user's order", async () => {
    const events = await collect(
      runPipeline(
        request("how does quantum entanglement work?", {
          techniques: ["chain-of-thought", "verify"],
        }),
        { client: stubClient(), plan: "free" },
      ),
    );
    const selection = byKind(events, "techniques").selection;
    expect(selection.selected).toEqual(["chain-of-thought", "verify"]);
    expect(selection.reasoning).toContain("Manually selected");
    const composed = byKind(events, "composed").composed;
    const techniquesSection = composed.sections.find((s) => s.name === "techniques");
    expect(techniquesSection?.content).toContain("1.");
  });
});

describe("runPipeline — Step 6.5 state bus (deps.stateTechniques / deps.stateTone)", () => {
  it("stateTechniques nudges AUTO-mode technique selection, same as any other hint", async () => {
    const events = await collect(
      runPipeline(request("what should I do about this"), {
        client: stubClient(),
        plan: "free",
        stateTechniques: ["metaphor"],
      }),
    );
    expect(byKind(events, "techniques").selection.selected).toContain("metaphor");
  });

  it("stateTechniques is IGNORED when the user picked a manual technique stack (their literal choice wins)", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?", { techniques: ["chain-of-thought"] }), {
        client: stubClient(),
        plan: "free",
        stateTechniques: ["metaphor"],
      }),
    );
    expect(byKind(events, "techniques").selection.selected).toEqual(["chain-of-thought"]);
  });

  it("stateTone is appended into the composed prompt's directness section", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient(),
        plan: "free",
        stateTone: "extra warm, with explicit positive framing",
      }),
    );
    const composed = byKind(events, "composed").composed;
    const directnessSection = composed.sections.find((s) => s.name === "directness");
    expect(directnessSection?.content).toContain("extra warm, with explicit positive framing");
  });

  it("absent stateTechniques/stateTone changes nothing (backward compatible with every pre-6.5 test)", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), { client: stubClient(), plan: "free" }),
    );
    expect(events.some((e) => e.kind === "done")).toBe(true);
  });
});

describe("runPipeline — execution failure", () => {
  it("a failed stream (proxy down — the sandbox's actual state) becomes a typed error event", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient({
          // eslint-disable-next-line require-yield
          stream: async function* () {
            throw new Error("Proxy call failed (502)");
          },
        }),
        plan: "free",
        resilience: { retryDelayMs: 2, timeoutMs: 50, maxAttempts: 2 }, // keep the test fast; 502 is retried
      }),
    );
    const last = events[events.length - 1];
    expect(last).toMatchObject({ kind: "error", message: "Proxy call failed (502)" });
    expect(events.some((e) => e.kind === "done")).toBe(false);
  });

  it("a non-transient stream failure (e.g. 400) is NOT retried — fails on the first attempt", async () => {
    let calls = 0;
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient({
          // eslint-disable-next-line require-yield
          stream: async function* () {
            calls++;
            throw new Error("Proxy call failed (400): malformed request");
          },
        }),
        plan: "free",
        resilience: { retryDelayMs: 2, timeoutMs: 50, maxAttempts: 3 },
      }),
    );
    expect(calls).toBe(1);
    expect(events[events.length - 1]).toMatchObject({ kind: "error", message: expect.stringContaining("400") });
  });
});

describe("runPipeline — Step 5.3 resilience (retry, timeout, error boundaries)", () => {
  it("a transient translation-call failure is retried and the run proceeds normally", async () => {
    let calls = 0;
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient({
          complete: async () => {
            calls++;
            if (calls < 2) throw new Error("Proxy call failed (503): flaky");
            return translationJson();
          },
        }),
        plan: "free",
        resilience: { retryDelayMs: 2, timeoutMs: 50, maxAttempts: 3 },
      }),
    );
    expect(calls).toBe(2);
    expect(byKind(events, "translation").gated.kind).toBe("proceed");
    expect(events.some((e) => e.kind === "done")).toBe(true);
  });

  it("a hanging translation call times out gracefully — translate() (Step 2.2) catches it into a typed 'error' GatedTranslation, never an unhandled hang or a crash", async () => {
    const events = await collect(
      runPipeline(request("how does quantum entanglement work?"), {
        client: stubClient({
          complete: (req) =>
            new Promise<string>((_resolve, reject) => {
              req.signal?.addEventListener("abort", () => reject(req.signal?.reason), { once: true });
            }),
        }),
        plan: "free",
        resilience: { retryDelayMs: 2, timeoutMs: 20, maxAttempts: 2 },
      }),
    );
    expect(events).toEqual([
      { kind: "stage", stage: "translating" },
      { kind: "translation", gated: { kind: "error", message: expect.stringContaining("Timed out") } },
    ]);
    // No route/techniques/composed/done event — the run ended at translation.
    expect(events.some((e) => e.kind !== "stage" && e.kind !== "translation")).toBe(false);
  });
});

describe("resolveTechniqueSelection", () => {
  it("re-enforces the ≤4 cap on an over-long (corrupted) manual stack", () => {
    const routed = route({ prompt: "how does caching work?", confidence: 95, plan: "free" });
    const oversized = resolveTechniqueSelection(
      ["examples", "quote-first", "metaphor", "role-prime", "verify", "chain-of-thought"],
      "how does caching work?",
      routed,
    );
    expect(oversized.selected).toEqual(["examples", "quote-first", "metaphor", "role-prime"]);
  });

  it("falls back to auto-detect for an empty or corrupted stored array", () => {
    const routed = route({ prompt: "how does caching work?", confidence: 95, plan: "free" });
    const fromEmpty = resolveTechniqueSelection([], "how does caching work?", routed);
    expect(fromEmpty.selected.length).toBeGreaterThan(0);
    const fromAuto = resolveTechniqueSelection(
      ["auto-detect"],
      "how does caching work?",
      routed,
    );
    expect(fromAuto.selected).toEqual(fromEmpty.selected);
  });
});


describe("resolveTechniqueSelection — Auto recommend with checked choices", () => {
  it("keeps manually checked techniques while Auto recommend fills compatible open slots", () => {
    const routed = route({ prompt: "Explain this in simple terms", confidence: 95, plan: "free" });
    const selection = resolveTechniqueSelection(
      ["auto-detect", "examples"],
      "Explain this in simple terms",
      routed,
    );
    expect(selection.selected).toContain("examples");
    expect(selection.selected).toContain("simplify");
    expect(selection.selected.length).toBeLessThanOrEqual(4);
    expect(selection.mode).toBe("auto-detect");
  });
});
