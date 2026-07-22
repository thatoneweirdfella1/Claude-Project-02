/* Step 5.3 verification — retry, timeout, and error-boundary behavior of the
   resilience layer, in isolation from the rest of the pipeline. Real timers
   (fake timers deadlock against the async retry loop, same reason Step 1.8's
   autosave interval test uses real timers) — kept fast with tiny
   retryDelayMs/timeoutMs overrides, never the 300ms/30s production defaults. */

import { describe, expect, it, vi } from "vitest";
import {
  TimeoutError,
  isTransientError,
  makeResilientClient,
  withResilience,
  withTimeout,
} from "./resilience";
import type { PipelineModelClient } from "./orchestrator";

const FAST = { retryDelayMs: 5, timeoutMs: 50 };

describe("isTransientError", () => {
  it("treats network failures, timeouts, 429, and 5xx as transient", () => {
    expect(isTransientError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isTransientError(new TimeoutError(1000))).toBe(true);
    expect(isTransientError(new Error("Proxy call failed (429): rate limited"))).toBe(true);
    expect(isTransientError(new Error("Proxy call failed (500): oops"))).toBe(true);
    expect(isTransientError(new Error("Proxy call failed (503): oops"))).toBe(true);
  });

  it("treats a client error (4xx other than 429) and unrecognized errors as NOT transient", () => {
    expect(isTransientError(new Error("Proxy call failed (400): bad request"))).toBe(false);
    expect(isTransientError(new Error("Proxy call failed (404): not found"))).toBe(false);
    expect(isTransientError(new Error("Translation reply was not a JSON object."))).toBe(false);
    expect(isTransientError("not even an Error")).toBe(false);
  });
});

describe("withTimeout", () => {
  it("resolves normally when fn settles before the timeout", async () => {
    const result = await withTimeout(async () => "ok", 100);
    expect(result).toBe("ok");
  });

  it("aborts a hanging fn and throws a TimeoutError after timeoutMs", async () => {
    const fn = vi.fn(
      (signal: AbortSignal) =>
        new Promise<string>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        }),
    );
    await expect(withTimeout(fn, 30)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("propagates immediate rejection unchanged (not miscast as a timeout)", async () => {
    await expect(
      withTimeout(async () => {
        throw new Error("bad request");
      }, 100),
    ).rejects.toThrow("bad request");
  });

  it("rejects immediately if the outer signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn(async () => "should not run");
    await expect(withTimeout(fn, 100, controller.signal)).rejects.toBeDefined();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("withResilience", () => {
  it("retries a transient failure and returns the eventual success", async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new Error("Proxy call failed (503): retry me");
      return "success";
    });
    const result = await withResilience(fn, { ...FAST, maxAttempts: 3 });
    expect(result).toBe("success");
    expect(calls).toBe(3);
  });

  it("does NOT retry a non-transient failure — fails on the first attempt", async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      throw new Error("Proxy call failed (400): bad request");
    });
    await expect(withResilience(fn, { ...FAST, maxAttempts: 3 })).rejects.toThrow(/400/);
    expect(calls).toBe(1);
  });

  it("gives up after maxAttempts on a persistent transient failure", async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      throw new Error("Proxy call failed (500): still down");
    });
    await expect(withResilience(fn, { ...FAST, maxAttempts: 3 })).rejects.toThrow(/500/);
    expect(calls).toBe(3);
  });

  it("a real cancellation (outer signal aborts) is never retried", async () => {
    const controller = new AbortController();
    let calls = 0;
    const fn = vi.fn((signal: AbortSignal) => {
      calls++;
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), {
          once: true,
        });
      });
    });
    const promise = withResilience(fn, { ...FAST, maxAttempts: 5 }, controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow();
    expect(calls).toBe(1);
  });

  it("times out a hanging attempt gracefully — a TimeoutError, not an unhandled hang", async () => {
    const fn = vi.fn(
      (signal: AbortSignal) =>
        new Promise<string>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        }),
    );
    await expect(withResilience(fn, { retryDelayMs: 5, timeoutMs: 20, maxAttempts: 2 })).rejects.toBeInstanceOf(
      TimeoutError,
    );
    expect(fn).toHaveBeenCalledTimes(2); // a timeout IS retried
  });
});

describe("makeResilientClient — complete()", () => {
  it("retries transient failures then succeeds, without changing the request shape", async () => {
    let calls = 0;
    const inner: PipelineModelClient = {
      complete: vi.fn(async (req) => {
        calls++;
        if (calls < 2) throw new Error("Proxy call failed (500): flaky");
        return `ok:${req.model}`;
      }),
      stream: async function* () {},
    };
    const resilient = makeResilientClient(inner, FAST);
    const result = await resilient.complete({ model: "claude-sonnet-5", input: "hi" });
    expect(result).toBe("ok:claude-sonnet-5");
    expect(calls).toBe(2);
  });
});

describe("makeResilientClient — stream()", () => {
  it("retries a failure that happens BEFORE any chunk is yielded", async () => {
    let calls = 0;
    const inner: PipelineModelClient = {
      complete: async () => "",
      stream: vi.fn(async function* () {
        calls++;
        if (calls < 2) throw new Error("Proxy call failed (503): connect failed");
        yield "hello ";
        yield "world";
      }),
    };
    const resilient = makeResilientClient(inner, FAST);
    const chunks: string[] = [];
    for await (const chunk of resilient.stream({ model: "claude-sonnet-5", input: "hi" })) {
      chunks.push(chunk);
    }
    expect(chunks.join("")).toBe("hello world");
    expect(calls).toBe(2);
  });

  it("does NOT retry a failure that happens AFTER a chunk was already yielded — no duplicated output", async () => {
    let calls = 0;
    const inner: PipelineModelClient = {
      complete: async () => "",
      stream: vi.fn(async function* () {
        calls++;
        yield "partial answer ";
        throw new Error("Proxy call failed (500): dropped mid-stream");
      }),
    };
    const resilient = makeResilientClient(inner, FAST);
    const chunks: string[] = [];
    await expect(
      (async () => {
        for await (const chunk of resilient.stream({ model: "claude-sonnet-5", input: "hi" })) {
          chunks.push(chunk);
        }
      })(),
    ).rejects.toThrow(/dropped mid-stream/);
    expect(chunks).toEqual(["partial answer "]);
    expect(calls).toBe(1); // never retried — would have duplicated "partial answer "
  });

  it("does not retry a non-transient stream failure", async () => {
    let calls = 0;
    const inner: PipelineModelClient = {
      complete: async () => "",
      stream: vi.fn(async function* () {
        calls++;
        throw new Error("Proxy call failed (400): bad request");
        // eslint-disable-next-line no-unreachable
        yield "never";
      }),
    };
    const resilient = makeResilientClient(inner, FAST);
    await expect(
      (async () => {
        for await (const _ of resilient.stream({ model: "claude-sonnet-5", input: "hi" })) {
          // drain
        }
      })(),
    ).rejects.toThrow(/400/);
    expect(calls).toBe(1);
  });
});
