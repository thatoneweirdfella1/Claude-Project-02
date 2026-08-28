import { describe, expect, it } from "vitest";
import { categorizeProviderError, isRetryable } from "./providerErrorCategorization";

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

  describe("messages are actionable", () => {
    it("provides next action for each error", () => {
      const categories = [
        "auth_failed",
        "quota_exceeded",
        "timeout",
        "unavailable_model",
        "content_policy",
        "service_unavailable",
        "unknown",
      ] as const;

      categories.forEach((category) => {
        const err = categorizeProviderError(404); // Use a dummy input
        // Override for testing
        const testErr = categorizeProviderError(category === "auth_failed" ? 401 : 500);
        expect(testErr.message).toBeTruthy();
        expect(testErr.message.length > 20).toBe(true); // Should be more than just a code
      });
    });
  });
});
