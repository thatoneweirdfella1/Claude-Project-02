/* Step 6.1 verification — the on-demand detection service. Only the model
   client is stubbed (the sandbox has no network; the live haiku call is parked
   on the Step 12.3 deploy, same as every model call since 1.10); the schema
   validation and outcome handling run for real. Mirrors translate.test.ts's
   shape, since the two services are deliberately parallel. */

import { describe, expect, it, vi } from "vitest";
import { detectState, MAX_DETECTION_INPUT_CHARS } from "./detect";
import { DETECTION_MODEL, type DetectionCompletionRequest } from "./client";
import { DETECTION_SYSTEM_PROMPT } from "./prompt";

type ClientFn = (req: DetectionCompletionRequest) => Promise<string>;

function detectionJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    emotion: { value: "overwhelmed", confidence: 78 },
    rsd: { value: "high", confidence: 66 },
    interest: { value: "medium", confidence: 50 },
    cognitive: { value: "processing", confidence: 44 },
    summary: "You sound a bit overwhelmed — I'll keep it clear and supportive.",
    ...overrides,
  });
}

describe("detectState — the happy path", () => {
  it("classifies all four dimensions from a well-formed reply", async () => {
    const client = vi.fn(async () => detectionJson());
    const outcome = await detectState("UGH this is so much I can't even", { client });

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.result.emotion?.value).toBe("overwhelmed");
    expect(outcome.result.cognitive?.value).toBe("processing");
    expect(outcome.result.summary).toContain("overwhelmed");
  });

  it("calls claude-haiku-4-5 with the detection system prompt and the trimmed input", async () => {
    const client = vi.fn<ClientFn>(async () => detectionJson());
    await detectState("   hello there   ", { client });

    expect(client).toHaveBeenCalledTimes(1);
    const req = client.mock.calls[0][0];
    expect(req.model).toBe(DETECTION_MODEL);
    expect(req.model).toBe("claude-haiku-4-5");
    expect(req.system).toBe(DETECTION_SYSTEM_PROMPT);
    expect(req.input).toBe("hello there");
  });

  it("tolerates a model reply wrapped in prose / code fences", async () => {
    const client = vi.fn(
      async () => "Here's the read:\n```json\n" + detectionJson() + "\n```\nHope that helps!",
    );
    const outcome = await detectState("some message", { client });
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") expect(outcome.result.emotion?.value).toBe("overwhelmed");
  });
});

describe("detectState — never throws, always a typed outcome", () => {
  it("returns 'empty' for whitespace-only input without calling the model", async () => {
    const client = vi.fn(async () => detectionJson());
    const outcome = await detectState("   \n  ", { client });
    expect(outcome.status).toBe("empty");
    expect(client).not.toHaveBeenCalled();
  });

  it("returns 'too-large' for input over the cap without calling the model", async () => {
    const client = vi.fn(async () => detectionJson());
    const huge = "x".repeat(MAX_DETECTION_INPUT_CHARS + 1);
    const outcome = await detectState(huge, { client });
    expect(outcome.status).toBe("too-large");
    if (outcome.status === "too-large") {
      expect(outcome.chars).toBe(huge.length);
      expect(outcome.limit).toBe(MAX_DETECTION_INPUT_CHARS);
    }
    expect(client).not.toHaveBeenCalled();
  });

  it("returns 'error' (not a throw) on a transport failure", async () => {
    const client = vi.fn(async () => {
      throw new Error("Proxy call failed (503)");
    });
    const outcome = await detectState("hello", { client });
    expect(outcome.status).toBe("error");
    if (outcome.status === "error") expect(outcome.message).toContain("503");
  });

  it("returns 'error' (not a throw) on an unparseable reply", async () => {
    const client = vi.fn(async () => "this is not JSON at all");
    const outcome = await detectState("hello", { client });
    expect(outcome.status).toBe("error");
  });

  it("still returns 'ok' with all-null dimensions when the model finds no signal", async () => {
    const client = vi.fn(async () =>
      JSON.stringify({ emotion: null, rsd: null, interest: null, cognitive: null, summary: "Couldn't read a state." }),
    );
    const outcome = await detectState("k", { client });
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.result.emotion).toBeNull();
      expect(outcome.result.summary).toContain("Couldn't");
    }
  });
});
