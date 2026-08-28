import { describe, expect, it } from "vitest";
import {
  categorizeCaughtError,
  categorizeProviderError,
  isRetryable,
  type ProviderErrorCategory,
} from "./providerErrorCategorization";

describe("R13: Safe provider error categorization", () => {
  describe("HTTP status codes", () => {
    it("categorizes 401/403 as auth_failed", () => {
      const err401 = categorizeProviderError(401);
      expect(err401.category).toBe("auth_failed");
      expect(err401.message).not.toContain("401");

      const err403 = categorizeProviderError(403);
      expect(err403.category).toBe("auth_failed");
      expect(err403.message).not.toContain("403");
    });

    it("categorizes 429 as quota_exceeded", () => {
      const err = categorizeProviderError(429);
      expect(err.category).toBe("quota_exceeded");
      expect(err.message).not.toContain("429");
    });

    it("categorizes 408 as timeout", () => {
      const err = categorizeProviderError(408);
      expect(err.category).toBe("timeout");
      expect(err.message).not.toContain("408");
    });

    it("categorizes 404 as unavailable_model", () => {
      const err = categorizeProviderError(404);
      expect(err.category).toBe("unavailable_model");
      expect(err.message).not.toContain("404");
    });

    it("categorizes 503/502/504 as service_unavailable", () => {
      expect(categorizeProviderError(503).category).toBe("service_unavailable");
      expect(categorizeProviderError(502).category).toBe("service_unavailable");
      expect(categorizeProviderError(504).category).toBe("service_unavailable");
    });

    it("never exposes raw HTTP codes in messages", () => {
      const codes = [400, 401, 403, 404, 408, 429, 500, 502, 503, 504];
      codes.forEach((code) => {
        const err = categorizeProviderError(code);
        expect(err.message).not.toContain(String(code));
      });
    });
  });

  describe("error message strings", () => {
    it("categorizes auth keywords as auth_failed", () => {
      expect(categorizeProviderError("unauthorized").category).toBe("auth_failed");
      expect(categorizeProviderError("forbidden").category).toBe("auth_failed");
      expect(categorizeProviderError("authentication failed").category).toBe("auth_failed");
    });

    it("categorizes quota/rate keywords as quota_exceeded", () => {
      expect(categorizeProviderError("rate limit exceeded").category).toBe("quota_exceeded");
      expect(categorizeProviderError("quota exceeded").category).toBe("quota_exceeded");
      expect(categorizeProviderError("token limit").category).toBe("quota_exceeded");
    });

    it("categorizes timeout keywords as timeout", () => {
      expect(categorizeProviderError("timeout").category).toBe("timeout");
      expect(categorizeProviderError("request timed out").category).toBe("timeout");
    });

    it("categorizes model keywords as unavailable_model", () => {
      expect(categorizeProviderError("model not found").category).toBe("unavailable_model");
      expect(categorizeProviderError("unknown model").category).toBe("unavailable_model");
    });

    it("categorizes policy keywords as content_policy", () => {
      expect(categorizeProviderError("policy violation").category).toBe("content_policy");
      expect(categorizeProviderError("safety violation").category).toBe("content_policy");
      expect(categorizeProviderError("request refused").category).toBe("content_policy");
    });

    it("never exposes raw error messages", () => {
      const errors = [
        "Rate limit exceeded: 429",
        "Authentication failed: missing X-API-Key header",
        "Timeout: connection closed",
      ];
      errors.forEach((err) => {
        const result = categorizeProviderError(err);
        // Message should be different from the input
        expect(result.message.toLowerCase()).not.toBe(err.toLowerCase());
      });
    });
  });

  describe("retryability", () => {
    it("marks timeout as retryable", () => {
      expect(isRetryable("timeout")).toBe(true);
    });

    it("marks quota_exceeded as retryable", () => {
      expect(isRetryable("quota_exceeded")).toBe(true);
    });

    it("marks service_unavailable as retryable", () => {
      expect(isRetryable("service_unavailable")).toBe(true);
    });

    it("marks auth_failed as not retryable", () => {
      expect(isRetryable("auth_failed")).toBe(false);
    });

    it("marks content_policy as not retryable", () => {
      expect(isRetryable("content_policy")).toBe(false);
    });

    it("marks unavailable_model as not retryable", () => {
      expect(isRetryable("unavailable_model")).toBe(false);
    });

    it("marks unknown as not retryable", () => {
      expect(isRetryable("unknown")).toBe(false);
    });
  });

  describe("messages carry a concrete next action and a matching retryable flag", () => {
    const cases: Array<{ input: number; category: ProviderErrorCategory; retryable: boolean }> = [
      { input: 401, category: "auth_failed", retryable: false },
      { input: 429, category: "quota_exceeded", retryable: true },
      { input: 408, category: "timeout", retryable: true },
      { input: 404, category: "unavailable_model", retryable: false },
      { input: 503, category: "service_unavailable", retryable: true },
      { input: 418, category: "unknown", retryable: false },
    ];

    it.each(cases)("category $category exposes its own next action and retryable flag", ({ input, category, retryable }) => {
      const err = categorizeProviderError(input);
      expect(err.category).toBe(category);
      expect(err.retryable).toBe(retryable);
      expect(err.retryable).toBe(isRetryable(category));
      expect(err.nextAction).toBeTruthy();
      // The next action must be distinct guidance, not a restatement of the message.
      expect(err.nextAction).not.toBe(err.message);
    });

    it("content_policy gets its own distinct next action", () => {
      const err = categorizeProviderError("request refused for policy reasons");
      expect(err.category).toBe("content_policy");
      expect(err.retryable).toBe(false);
      expect(err.nextAction).toMatch(/different question|different approach/i);
    });
  });

  describe("categorizeCaughtError — the real catch-block entry point", () => {
    it("categorizes a structured proxy error by its numeric status, never its message text", () => {
      const err = categorizeCaughtError({ status: 401, message: "raw provider body leaked here" });
      expect(err.category).toBe("auth_failed");
      expect(err.message).not.toContain("raw provider body");
    });

    it("falls back to keyword-matching a plain Error's message", () => {
      const err = categorizeCaughtError(new Error("request timed out after 30s"));
      expect(err.category).toBe("timeout");
      expect(err.retryable).toBe(true);
    });

    it("categorizes a thrown non-Error value without throwing itself", () => {
      const err = categorizeCaughtError("quota exceeded");
      expect(err.category).toBe("quota_exceeded");
    });

    it("never leaks a raw HTTP status or provider response body from a proxy-shaped error", () => {
      const err = categorizeCaughtError({
        status: 500,
        message: "Proxy call failed (500)",
        detail: "sk-live-secret-should-never-appear-anywhere",
      });
      expect(err.message).not.toContain("500");
      expect(err.message).not.toContain("sk-live-secret");
      expect(err.nextAction).not.toContain("sk-live-secret");
    });

    it("defaults to the unknown category for an unrecognized plain error", () => {
      const err = categorizeCaughtError(new Error("ECONNRESET"));
      expect(err.category).toBe("unknown");
      expect(err.retryable).toBe(false);
    });
  });
});
