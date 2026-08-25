/// <reference types="node" />
import {
  accountAttemptAllowed,
  authenticatedAccount,
  createAccount,
  createSession,
  deleteAccount,
  destroySession,
  findAccount,
  hashPassword,
  normalizedEmail,
  requestIsSameOrigin,
  sessionCookie,
  storageConfigured,
  verifyPassword,
  type DurableAccount,
} from "./_lib/durableAccount.js";

export const config = { runtime: "edge" };
const MAX_ACCOUNT_BODY_BYTES = 20_000;

function json(value: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "cache-control": "no-store", "content-type": "application/json", ...headers },
  });
}

function publicUser(account: DurableAccount) {
  return { id: account.id, email: account.email, displayName: account.displayName, createdAt: account.createdAt };
}

export default async function handler(request: Request): Promise<Response> {
  if (!storageConfigured()) return json({ configured: false, user: null });

  if (request.method === "GET") {
    const account = await authenticatedAccount(request);
    return json({ configured: true, user: account ? publicUser(account) : null });
  }

  if (!requestIsSameOrigin(request)) return json({ error: "Cross-origin account mutation rejected." }, 403);

  if (request.method === "DELETE") {
    const mode = new URL(request.url).searchParams.get("mode");
    if (mode === "delete-account") {
      const account = await authenticatedAccount(request);
      if (!account) return json({ error: "Unauthorized" }, 401);
      if (request.headers.get("x-confirm-account-deletion") !== "delete-my-account") {
        return json({ error: "Explicit account deletion confirmation required." }, 400);
      }
      await deleteAccount(account, request);
    } else {
      await destroySession(request);
    }
    return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
  }

  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { allow: "GET, POST, DELETE" });

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_ACCOUNT_BODY_BYTES) return json({ error: "Account request is too large." }, 413);

  let body: { action?: string; email?: string; password?: string; displayName?: string };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_ACCOUNT_BODY_BYTES) {
      return json({ error: "Account request is too large." }, 413);
    }
    body = JSON.parse(raw) as typeof body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = normalizedEmail(body.email ?? "");
  const password = body.password ?? "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 12 || password.length > 256) {
    return json({ error: "Use a valid email and a password of at least 12 characters." }, 400);
  }
  if (!await accountAttemptAllowed(request, email)) {
    return json({ error: "Too many account attempts. Try again later." }, 429, { "retry-after": "600" });
  }

  let account: DurableAccount | null;
  if (body.action === "register") {
    const displayName = (body.displayName ?? "").trim().slice(0, 80);
    if (!displayName) return json({ error: "Display name is required." }, 400);
    const passwordRecord = await hashPassword(password);
    account = {
      id: crypto.randomUUID(),
      email,
      displayName,
      passwordSalt: passwordRecord.salt,
      passwordHash: passwordRecord.hash,
      createdAt: Date.now(),
    };
    if (!await createAccount(account)) return json({ error: "An account already exists for that email." }, 409);
  } else if (body.action === "login") {
    account = await findAccount(email);
    if (!account || !await verifyPassword(account, password)) return json({ error: "Email or password did not match." }, 401);
  } else {
    return json({ error: "Unsupported account action." }, 400);
  }

  const session = await createSession(account.id);
  return json({ user: publicUser(account) }, 200, { "set-cookie": sessionCookie(session.token) });
}
