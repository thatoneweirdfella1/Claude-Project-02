import { beforeEach, describe, expect, it, vi } from "vitest";
import { APP_PASSWORD_HEADER } from "./appAccess";
import {
  appAccessHeaders,
  clearStoredAppPassword,
  getStoredAppPassword,
  setStoredAppPassword,
  verifyAppAccess,
} from "./appAccessClient";

beforeEach(() => {
  clearStoredAppPassword();
});

describe("app access storage", () => {
  it("round-trips and clears the stored password", () => {
    expect(getStoredAppPassword()).toBe("");
    setStoredAppPassword("hunter2");
    expect(getStoredAppPassword()).toBe("hunter2");
    clearStoredAppPassword();
    expect(getStoredAppPassword()).toBe("");
  });

  it("builds no header for an empty password", () => {
    expect(appAccessHeaders("")).toEqual({});
  });

  it("builds the shared header for an explicit password", () => {
    expect(appAccessHeaders("hunter2")).toEqual({ [APP_PASSWORD_HEADER]: "hunter2" });
  });
});

describe("verifyAppAccess", () => {
  it("checks the deployment without a password", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ requiresPassword: false, ok: true }), { status: 200 }),
    );

    await expect(verifyAppAccess("", fetchImpl)).resolves.toEqual({
      requiresPassword: false,
      ok: true,
    });
    expect(fetchImpl).toHaveBeenCalledWith("/api/verify-access", {
      method: "GET",
      headers: {},
      cache: "no-store",
    });
  });

  it("sends an entered password to the verification endpoint", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ requiresPassword: true, ok: true }), { status: 200 }),
    );

    await expect(verifyAppAccess("correct-horse", fetchImpl)).resolves.toEqual({
      requiresPassword: true,
      ok: true,
    });
    expect(fetchImpl).toHaveBeenCalledWith("/api/verify-access", {
      method: "GET",
      headers: { [APP_PASSWORD_HEADER]: "correct-horse" },
      cache: "no-store",
    });
  });

  it("preserves a valid locked response for the gate to handle", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ requiresPassword: true, ok: false }), { status: 200 }),
    );
    await expect(verifyAppAccess("wrong", fetchImpl)).resolves.toEqual({
      requiresPassword: true,
      ok: false,
    });
  });

  it("fails closed on HTTP and malformed responses", async () => {
    const unavailable = vi.fn<typeof fetch>().mockResolvedValue(new Response("no", { status: 503 }));
    await expect(verifyAppAccess("secret", unavailable)).rejects.toThrow("503");

    const malformed = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    await expect(verifyAppAccess("secret", malformed)).rejects.toThrow("invalid response");
  });
});
