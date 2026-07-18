/* Step 5.4 verification — observePipeline is a transparent tee: same events
   out as runPipeline, plus one recorded TelemetryEntry per request carrying
   exactly the fields the step names (complexity, model, techniques,
   confidence, timings, token counts in/out per call, downgrade/escalation
   notes). Uses the same offline stub-client pattern as orchestrator.test.ts —
   only the model client is stubbed; translation parsing/gating, routing.js,
   auto-detect, and composition all run for real. */

import { beforeEach, describe, expect, it } from "vitest";
import { observePipeline } from "./observePipeline";
import { getTelemetryEntries, resetTelemetryForTests } from "./log";
import { buildTranslateAskRequest, type TranslateAskSettings } from "../composer";
import type { PipelineEvent, PipelineModelClient } from "../pipeline";

function translationJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    translatedPrompt: "Explain how quantum entanglement works in simple terms.",
    confidence: 92,
    detectedGaps: ["tangential-preamble"],
    reasoning: "Read past the preamble to the core question.",
    ...overrides,
  });
}

function stubClient(overrides: Partial<PipelineModelClient> = {}): PipelineModelClient {
  return {
    complete: async (req) => {
      req.onUsage?.({ inputTokens: 120, outputTokens: 30 });
      return translationJson();
    },
    stream: async function* (req) {
      yield "Entangled particles ";
      yield "share one state.";
      req.onUsage?.({ inputTokens: 400, outputTokens: 55 });
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

beforeEach(() => {
  resetTelemetryForTests();
});

describe("observePipeline — transparent tee", () => {
  it("yields the exact same event sequence runPipeline would, unmodified", async () => {
    const events = await collect(
      observePipeline(request("how does quantum entanglement work?"), {
        client: stubClient(),
        plan: "free",
      }),
    );
    expect(events.map((e) => e.kind)).toEqual([
      "stage",
      "translation",
      "stage",
      "route",
      "stage",
      "techniques",
      "composed",
      "stage",
      "streaming",
      "streaming",
      "done",
    ]);
  });
});

describe("observePipeline — a successful run", () => {
  it("records one entry with complexity, model, techniques, confidence, notes, both token counts, and stage timings", async () => {
    await collect(
      observePipeline(request("how does quantum entanglement work?"), {
        client: stubClient(),
        plan: "free",
      }),
    );

    const entries = getTelemetryEntries();
    expect(entries).toHaveLength(1);
    const entry = entries[0];

    expect(entry.outcome).toBe("done");
    expect(entry.confidence).toBe(92);
    expect(typeof entry.complexity).toBe("number");
    expect(entry.model).toMatch(/^claude-/);
    expect(Array.isArray(entry.techniques)).toBe(true);
    expect(entry.techniques!.length).toBeGreaterThan(0);
    expect(Array.isArray(entry.notes)).toBe(true);
    expect(["broad", "medium", "narrow"]).toContain(entry.scope);
    expect(typeof entry.thinkingApplied).toBe("boolean");
    expect(entry.techniqueMode).toBe("auto-detect"); // DEFAULT_SETTINGS uses ["auto-detect"]
    expect(typeof entry.techniqueReasoning).toBe("string");
    expect(typeof entry.techniqueSignalMatched).toBe("boolean");

    expect(entry.translationTokens).toEqual({ inputTokens: 120, outputTokens: 30 });
    expect(entry.executionTokens).toEqual({ inputTokens: 400, outputTokens: 55 });

    // All four display stages were reached and timed.
    expect(Object.keys(entry.stageDurationsMs).sort()).toEqual(
      ["answering", "composing", "routing", "translating"].sort(),
    );
    for (const ms of Object.values(entry.stageDurationsMs)) {
      expect(ms).toBeGreaterThanOrEqual(0);
    }
    expect(entry.totalDurationMs).toBeGreaterThanOrEqual(0);
    expect(entry.finishedAt).toBeGreaterThanOrEqual(entry.startedAt);
    expect(entry.errorMessage).toBeNull();
  });

  it("records techniqueMode 'manual' and no signal-matched reading for an explicit stack", async () => {
    await collect(
      observePipeline(request("how does quantum entanglement work?", { techniques: ["socratic"] }), {
        client: stubClient(),
        plan: "free",
      }),
    );

    const [entry] = getTelemetryEntries();
    expect(entry.techniqueMode).toBe("manual");
    expect(entry.techniqueSignalMatched).toBeNull();
    expect(entry.techniqueReasoning).toContain("Manually selected");
  });

  it("gives each request its own id and does not mix up two sequential runs", async () => {
    await collect(observePipeline(request("how does quantum entanglement work?"), { client: stubClient(), plan: "free" }));
    await collect(observePipeline(request("how does caching work?"), { client: stubClient(), plan: "free" }));

    const entries = getTelemetryEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0].id).not.toBe(entries[1].id);
  });
});

describe("observePipeline — the clarify path", () => {
  it("records outcome 'clarify', confidence, and only the translating stage timing — no route/model/techniques", async () => {
    await collect(
      observePipeline(request("idk... the thing? you know what I mean"), {
        client: stubClient({
          complete: async (req) => {
            req.onUsage?.({ inputTokens: 90, outputTokens: 20 });
            return translationJson({ translatedPrompt: "Explain the thing.", confidence: 40 });
          },
        }),
        plan: "free",
      }),
    );

    const [entry] = getTelemetryEntries();
    expect(entry.outcome).toBe("clarify");
    expect(entry.confidence).toBe(40);
    expect(entry.complexity).toBeNull();
    expect(entry.model).toBeNull();
    expect(entry.techniques).toBeNull();
    expect(entry.scope).toBeNull();
    expect(entry.thinkingApplied).toBeNull();
    expect(entry.techniqueMode).toBeNull();
    expect(entry.techniqueReasoning).toBeNull();
    expect(entry.techniqueSignalMatched).toBeNull();
    expect(entry.executionTokens).toBeNull();
    expect(entry.translationTokens).toEqual({ inputTokens: 90, outputTokens: 20 });
    expect(Object.keys(entry.stageDurationsMs)).toEqual(["translating"]);
  });
});

describe("observePipeline — execution failure", () => {
  it("records outcome 'error' with the real underlying message", async () => {
    await collect(
      observePipeline(request("how does quantum entanglement work?"), {
        client: stubClient({
          // eslint-disable-next-line require-yield
          stream: async function* () {
            throw new Error("Proxy call failed (400): malformed");
          },
        }),
        plan: "free",
        resilience: { retryDelayMs: 2, timeoutMs: 50, maxAttempts: 2 },
      }),
    );

    const [entry] = getTelemetryEntries();
    expect(entry.outcome).toBe("error");
    expect(entry.errorMessage).toContain("400");
    // Routing/techniques DID happen before the failure — still recorded.
    expect(entry.model).not.toBeNull();
    expect(entry.techniques).not.toBeNull();
    expect(entry.executionTokens).toBeNull(); // the failed call never reported usage
  });
});

describe("observePipeline — cancellation", () => {
  it("records outcome 'cancelled' when the consumer stops iterating before a terminal event", async () => {
    let released: (() => void) | undefined;
    const hangingClient = stubClient({
      stream: () =>
        (async function* () {
          yield "partial ";
          await new Promise<void>((resolve) => {
            released = resolve;
          });
          yield "unreachable";
        })(),
    });

    const gen = observePipeline(request("how does quantum entanglement work?"), {
      client: hangingClient,
      plan: "free",
    });

    // Drain until the first partial token, then abandon the generator —
    // exactly what CenterColumn's usePipelineRun does on unmount/resubmit.
    for await (const event of gen) {
      if (event.kind === "streaming") {
        await gen.return(undefined);
        break;
      }
    }
    released?.();

    const [entry] = getTelemetryEntries();
    expect(entry.outcome).toBe("cancelled");
    expect(entry.finishedAt).not.toBeNull();
  });
});
