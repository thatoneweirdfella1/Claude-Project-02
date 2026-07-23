/* App access gate — verifies isAuthorized/checkAccess fail closed in every
   ambiguous case (no configured password, missing header, wrong header),
   and only succeed when both a password is configured AND the request's
   header matches it exactly. */

import { describe, expect, it } from "vitest";
import { APP_PASSWORD_HEADER, checkAccess, isAuthorized, unauthorizedResponse } from "./appAccess";

function requestWith(header?: string): Request {
  const headers: Record<string, string> = {};
  if (header !== undefined) headers[APP_PASSWORD_HEADER] = header;
  return new Request("https://app.example/api/proxy", { headers });
}

describe("isAuthorized", () => {
  it("is false when no password is configured server-side, even with a header", () => {
    expect(isAuthorized(requestWith("anything"), undefined)).toBe(false);
    expect(isAuthorized(requestWith("anything"), "")).toBe(false);
  });

  it("is false when a password is configured but the request has no header", () => {
    expect(isAuthorized(requestWith(), "correct-horse")).toBe(false);
  });

  it("is false when the header doesn't match", () => {
    expect(isAuthorized(requestWith("wrong"), "correct-horse")).toBe(false);
  });

  it("is false when the header is a different length than the real password", () => {
    expect(isAuthorized(requestWith("short"), "a-much-longer-password")).toBe(false);
  });

  it("is true when the header matches exactly", () => {
    expect(isAuthorized(requestWith("correct-horse"), "correct-horse")).toBe(true);
  });

  it("is case-sensitive", () => {
    expect(isAuthorized(requestWith("Correct-Horse"), "correct-horse")).toBe(false);
  });
});

describe("checkAccess", () => {
  it("reports requiresPassword: false and ok: true when nothing is configured", () => {
    expect(checkAccess(requestWith(), undefined)).toEqual({ requiresPassword: false, ok: true });
    // Even a header present is irrelevant when the server has nothing configured.
    expect(checkAccess(requestWith("anything"), undefined)).toEqual({ requiresPassword: false, ok: true });
  });

  it("reports requiresPassword: true and ok: false for a missing/wrong header", () => {
    expect(checkAccess(requestWith(), "secret")).toEqual({ requiresPassword: true, ok: false });
    expect(checkAccess(requestWith("nope"), "secret")).toEqual({ requiresPassword: true, ok: false });
  });

  it("reports requiresPassword: true and ok: true for a matching header", () => {
    expect(checkAccess(requestWith("secret"), "secret")).toEqual({ requiresPassword: true, ok: true });
  });
});

describe("unauthorizedResponse", () => {
  it("is a 401 with a JSON error body", async () => {
    const res = unauthorizedResponse();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});
