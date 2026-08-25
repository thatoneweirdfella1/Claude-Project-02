export interface DurableAccount {
  id: string;
  email: string;
  displayName: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: number;
}

const SESSION_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function storageUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
}

function storageToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
}

export function storageConfigured(): boolean {
  const configured = Boolean(storageUrl() && storageToken());
  if (!configured) {
    const candidateNames = Object.keys(process.env)
      .filter((name) => /(?:UPSTASH|REDIS|KV_)/i.test(name))
      .sort();
    console.info("layer4-storage-variable-names", JSON.stringify(candidateNames));
  }
  return configured;
}

async function redis<T>(command: Array<string | number>): Promise<T> {
  const url = storageUrl();
  const token = storageToken();
  if (!url || !token) throw new Error("durable-storage-not-configured");
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  const body = await response.json() as { result?: T; error?: string };
  if (!response.ok || body.error) throw new Error(body.error ?? "durable-storage-failed");
  return body.result as T;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function hashPassword(password: string, salt?: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = salt ? base64ToBytes(salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes as BufferSource, iterations: 310_000 },
    key,
    256,
  );
  return { salt: bytesToBase64(saltBytes), hash: bytesToBase64(new Uint8Array(bits)) };
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function verifyPassword(account: DurableAccount, password: string): Promise<boolean> {
  const derived = await hashPassword(password, account.passwordSalt);
  return safeEqual(derived.hash, account.passwordHash);
}

export function normalizedEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function createAccount(account: DurableAccount): Promise<boolean> {
  const script = "if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end redis.call('SET', KEYS[1], ARGV[1]) redis.call('SET', KEYS[2], ARGV[2]) return 1";
  return Number(await redis(["EVAL", script, 2, `email:${account.email}`, `account:${account.id}`, account.id, JSON.stringify(account)])) === 1;
}

export async function findAccount(email: string): Promise<DurableAccount | null> {
  const id = await redis<string | null>(["GET", `email:${normalizedEmail(email)}`]);
  if (!id) return null;
  const raw = await redis<string | null>(["GET", `account:${id}`]);
  return raw ? JSON.parse(raw) as DurableAccount : null;
}

export async function createSession(accountId: string): Promise<{ token: string; expires: number }> {
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const key = bytesToBase64(new Uint8Array(digest));
  await redis(["SET", `session:${key}`, accountId, "EX", SESSION_SECONDS]);
  return { token, expires: Date.now() + SESSION_SECONDS * 1000 };
}

export function sessionCookie(token: string, maxAge = SESSION_SECONDS): string {
  return `divergence_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export async function authenticatedAccount(request: Request): Promise<DurableAccount | null> {
  const token = cookieValue(request, "divergence_session");
  if (!token) return null;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const key = bytesToBase64(new Uint8Array(digest));
  const id = await redis<string | null>(["GET", `session:${key}`]);
  if (!id) return null;
  const raw = await redis<string | null>(["GET", `account:${id}`]);
  return raw ? JSON.parse(raw) as DurableAccount : null;
}

export async function destroySession(request: Request): Promise<void> {
  const token = cookieValue(request, "divergence_session");
  if (!token) return;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  await redis(["DEL", `session:${bytesToBase64(new Uint8Array(digest))}`]);
}

export async function getRemoteRecord(accountId: string): Promise<string | null> {
  return redis(["GET", `sync:${accountId}`]);
}

export async function compareAndSetRemoteRecord(accountId: string, expected: number, record: string): Promise<boolean> {
  const script = "local value=redis.call('GET',KEYS[1]) if not value then if tonumber(ARGV[1])~=0 then return 0 end else local current=cjson.decode(value) if tonumber(current.revision)~=tonumber(ARGV[1]) then return 0 end end redis.call('SET',KEYS[1],ARGV[2]) return 1";
  return Number(await redis(["EVAL", script, 1, `sync:${accountId}`, expected, record])) === 1;
}

export async function deleteRemoteRecord(accountId: string): Promise<void> {
  await redis(["DEL", `sync:${accountId}`]);
}
