import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import accountHandler from "../../api/account";
import syncHandler from "../../api/sync";
import {
  accountAttemptAllowed,
  deleteAccount,
  requestIsSameOrigin,
  storageConfigured,
  type DurableAccount,
} from "../../api/_lib/durableAccount";

const account: DurableAccount = {
  id: "account-1",
  email: "person@example.com",
  displayName: "Person",
  passwordSalt: "salt",
  passwordHash: "hash",
  createdAt: 1,
};

function redisResponse(result: unknown): Response {
  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function mockRedis(resolver: (command: Array<string | number>) => unknown) {
  const calls: Array<Array<string | number>> = [];
  const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const command = JSON.parse(String(init?.body)) as Array<string | number>;
    calls.push(command);
    return redisResponse(resolver(command));
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

function withServerHeaders(request: Request, values: Record<string, string>): Request {
  const original = request.headers;
  const normalized = Object.fromEntries(Object.entries(values).map(([name, value]) => [name.toLowerCase(), value]));
  Object.defineProperty(request, "headers", {
    value: {
      get(name: string) {
        return normalized[name.toLowerCase()] ?? original.get(name);
      },
    },
  });
  return request;
}

describe("Layer 4 durable account API boundaries", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  it("accepts both Upstash and Vercel KV variable names", () => {
    expect(storageConfigured()).toBe(true);
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = "https://kv.example";
    process.env.KV_REST_API_TOKEN = "kv-token";
    expect(storageConfigured()).toBe(true);
    delete process.env.KV_REST_API_TOKEN;
    expect(storageConfigured()).toBe(false);
  });

  it("fails safely with a non-cacheable response when storage is absent", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const response = await accountHandler(new Request("https://preview.example/api/account"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ configured: false, user: null });
  });

  it("rejects cross-origin account mutations", async () => {
    const request = withServerHeaders(new Request("https://preview.example/api/account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "login", email: "person@example.com", password: "long-enough-password" }),
    }), { origin: "https://attacker.example" });
    const response = await accountHandler(request);
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("enforces account request size even without content-length", async () => {
    const response = await accountHandler(new Request("https://preview.example/api/account", {
      method: "POST",
      headers: { origin: "https://preview.example", "content-type": "application/json" },
      body: JSON.stringify({ action: "login", email: "person@example.com", password: "x".repeat(21_000) }),
    }));
    expect(response.status).toBe(413);
  });

  it("rate-limits on a hashed email and client address key", async () => {
    const calls = mockRedis(() => 11);
    const allowed = await accountAttemptAllowed(
      new Request("https://preview.example/api/account", { headers: { "x-forwarded-for": "203.0.113.4" } }),
      "person@example.com",
    );
    expect(allowed).toBe(false);
    expect(JSON.stringify(calls)).not.toContain("person@example.com");
    expect(JSON.stringify(calls)).not.toContain("203.0.113.4");
  });

  it("atomically deletes account, email mapping, remote data, and current session", async () => {
    const calls = mockRedis(() => 1);
    await deleteAccount(account, withServerHeaders(
      new Request("https://preview.example/api/account"),
      { cookie: "divergence_session=session-token" },
    ));
    const command = calls[0];
    expect(command[0]).toBe("EVAL");
    expect(command).toContain("email:person@example.com");
    expect(command).toContain("account:account-1");
    expect(command).toContain("sync:account-1");
    expect(command.some((value) => String(value).startsWith("session:"))).toBe(true);
  });

  it("requires authentication for remote sync", async () => {
    mockRedis((command) => command[0] === "GET" ? null : 0);
    const response = await syncHandler(new Request("https://preview.example/api/sync"));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("preserves the newer remote record on a stale revision conflict", async () => {
    const current = {
      revision: 2,
      ownerId: account.id,
      updatedAt: 2,
      dataset: { kind: "divergence-local-dataset", schemaVersion: 2, checksum: "newer" },
      checksum: "newer",
    };
    mockRedis((command) => {
      if (command[0] === "GET" && String(command[1]).startsWith("session:")) return account.id;
      if (command[0] === "GET" && command[1] === "account:account-1") return JSON.stringify(account);
      if (command[0] === "EVAL") return 0;
      if (command[0] === "GET" && command[1] === "sync:account-1") return JSON.stringify(current);
      return null;
    });
    const request = withServerHeaders(new Request("https://preview.example/api/sync", {
      method: "PUT",
      headers: {
        "if-match": "1",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        dataset: { kind: "divergence-local-dataset", schemaVersion: 2, checksum: "stale" },
      }),
    }), {
      cookie: "divergence_session=session-token",
      origin: "https://preview.example",
    });
    const response = await syncHandler(request);
    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual(current);
  });

  it("distinguishes same-origin and cross-origin requests", () => {
    expect(requestIsSameOrigin(withServerHeaders(
      new Request("https://preview.example/api/account"),
      { origin: "https://preview.example" },
    ))).toBe(true);
    expect(requestIsSameOrigin(withServerHeaders(
      new Request("https://preview.example/api/account"),
      { origin: "https://other.example" },
    ))).toBe(false);
  });
});
