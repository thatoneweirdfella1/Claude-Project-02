import { ACCOUNT_PERSISTED_KEYS, createInitialAccountState, useAccountStore } from "../stores/accountStore";
import { SESSION_PERSISTED_KEYS, createInitialSessionState, useSessionStore } from "../stores/sessionStore";
import type { AccountState, SessionState } from "../stores/types";
import { getLocalWorkspace, restoreLocalWorkspace, type LocalWorkspaceSnapshot } from "./localWorkspace";
import { saveNow } from "./persistence";

export interface LocalDataset {
  kind: "divergence-local-dataset";
  schemaVersion: 2;
  exportedAt: string;
  checksum: string;
  account: Partial<AccountState>;
  session: Partial<SessionState>;
  workspace: LocalWorkspaceSnapshot;
}

export const MAX_LOCAL_DATASET_BYTES = 50 * 1024 * 1024;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasUnsafeKeys(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasUnsafeKeys);
  if (!isPlainRecord(value)) return false;
  return Object.entries(value).some(([key, child]) =>
    key === "__proto__" || key === "prototype" || key === "constructor" || hasUnsafeKeys(child),
  );
}

function validWorkspace(value: unknown): value is LocalWorkspaceSnapshot {
  if (!isPlainRecord(value) || !Array.isArray(value.tasks) || !Array.isArray(value.resources)) return false;
  const validTask = (item: unknown) => isPlainRecord(item) &&
    typeof item.id === "string" && typeof item.project === "string" &&
    typeof item.text === "string" && typeof item.completed === "boolean";
  const validResource = (item: unknown) => isPlainRecord(item) &&
    typeof item.id === "string" && typeof item.project === "string" &&
    typeof item.label === "string" && typeof item.content === "string";
  return value.tasks.every(validTask) && value.resources.every(validResource);
}

function compatibleShape(value: unknown, template: unknown): boolean {
  if (Array.isArray(template)) return Array.isArray(value);
  if (isPlainRecord(template)) {
    if (!isPlainRecord(value)) return false;
    return Object.entries(value).every(([key, child]) =>
      Object.prototype.hasOwnProperty.call(template, key) &&
      compatibleShape(child, template[key]),
    );
  }
  return typeof value === typeof template;
}

function checksumFor(value: Omit<LocalDataset, "checksum">): string {
  const text = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function clone<T>(value: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value)) as T;
}

function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>;
}

export function buildLocalDataset(): LocalDataset {
  const payload: Omit<LocalDataset, "checksum"> = {
    kind: "divergence-local-dataset",
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    account: pick(useAccountStore.getState(), ACCOUNT_PERSISTED_KEYS),
    session: pick(useSessionStore.getState(), SESSION_PERSISTED_KEYS),
    workspace: getLocalWorkspace(),
  };
  return { ...payload, checksum: checksumFor(payload) };
}

export function serializeLocalDataset(): string {
  return JSON.stringify(buildLocalDataset(), null, 2);
}

export function parseLocalDataset(text: string): LocalDataset | null {
  if (new TextEncoder().encode(text).byteLength > MAX_LOCAL_DATASET_BYTES) return null;
  try {
    const value = JSON.parse(text) as Partial<LocalDataset>;
    if (!isPlainRecord(value) || hasUnsafeKeys(value) ||
        value.kind !== "divergence-local-dataset" || value.schemaVersion !== 2 ||
        typeof value.exportedAt !== "string" || Number.isNaN(Date.parse(value.exportedAt)) ||
        typeof value.checksum !== "string" ||
        !isPlainRecord(value.account) || !isPlainRecord(value.session) ||
        !compatibleShape(value.account, pick(createInitialAccountState(), ACCOUNT_PERSISTED_KEYS)) ||
        !compatibleShape(value.session, pick(createInitialSessionState(), SESSION_PERSISTED_KEYS)) ||
        !validWorkspace(value.workspace)) return null;
    const { checksum, ...payload } = value as unknown as LocalDataset;
    if (checksumFor(payload) !== checksum) return null;
    return value as LocalDataset;
  } catch {
    return null;
  }
}

export async function restoreLocalDataset(text: string): Promise<boolean> {
  const data = parseLocalDataset(text);
  if (!data) return false;
  const previousAccount = clone(pick(useAccountStore.getState(), ACCOUNT_PERSISTED_KEYS));
  const previousSession = clone(pick(useSessionStore.getState(), SESSION_PERSISTED_KEYS));
  const previousWorkspace = clone(getLocalWorkspace());
  try {
    useAccountStore.getState().hydrate(data.account);
    useSessionStore.getState().hydrate(data.session);
    restoreLocalWorkspace(data.workspace);
    await saveNow({ snapshotActiveSession: false });
    return true;
  } catch {
    useAccountStore.getState().hydrate(previousAccount);
    useSessionStore.getState().hydrate(previousSession);
    restoreLocalWorkspace(previousWorkspace);
    try { await saveNow({ snapshotActiveSession: false }); } catch { /* keep restored memory state */ }
    return false;
  }
}
