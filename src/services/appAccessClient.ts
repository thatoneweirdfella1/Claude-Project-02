import { APP_PASSWORD_HEADER, type AccessCheckResult } from "./appAccess";

const STORAGE_KEY = "divergence-app-access-password";
const VERIFY_ENDPOINT = "/api/verify-access";
let memoryPassword = "";

export function getStoredAppPassword(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? memoryPassword;
  } catch {
    return memoryPassword;
  }
}

export function setStoredAppPassword(password: string): void {
  memoryPassword = password;
  try {
    localStorage.setItem(STORAGE_KEY, password);
  } catch {
    // The active gate still unlocks for this browser session.
  }
}

export function clearStoredAppPassword(): void {
  memoryPassword = "";
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else to clear.
  }
}

export function appAccessHeaders(password = getStoredAppPassword()): Record<string, string> {
  return password ? { [APP_PASSWORD_HEADER]: password } : {};
}

function isAccessCheckResult(value: unknown): value is AccessCheckResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<AccessCheckResult>;
  return typeof result.requiresPassword === "boolean" && typeof result.ok === "boolean";
}

export async function verifyAppAccess(
  password: string,
  fetchImpl: typeof fetch = fetch,
  endpoint = VERIFY_ENDPOINT,
): Promise<AccessCheckResult> {
  const response = await fetchImpl(endpoint, {
    method: "GET",
    headers: appAccessHeaders(password),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Access verification failed (${response.status})`);
  }

  const result: unknown = await response.json();
  if (!isAccessCheckResult(result)) {
    throw new Error("Access verification returned an invalid response");
  }
  return result;
}
