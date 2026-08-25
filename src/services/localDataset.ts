import { ACCOUNT_PERSISTED_KEYS, useAccountStore } from "../stores/accountStore";
import { SESSION_PERSISTED_KEYS, useSessionStore } from "../stores/sessionStore";
import type { AccountState, SessionState } from "../stores/types";
import { getLocalWorkspace, restoreLocalWorkspace, type LocalWorkspaceSnapshot } from "./localWorkspace";
import { saveNow } from "./persistence";

export interface LocalDataset {
  kind: "divergence-local-dataset";
  schemaVersion: 1;
  exportedAt: string;
  account: Partial<AccountState>;
  session: Partial<SessionState>;
  workspace: LocalWorkspaceSnapshot;
}

function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>;
}

export function buildLocalDataset(): LocalDataset {
  return {
    kind: "divergence-local-dataset",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    account: pick(useAccountStore.getState(), ACCOUNT_PERSISTED_KEYS),
    session: pick(useSessionStore.getState(), SESSION_PERSISTED_KEYS),
    workspace: getLocalWorkspace(),
  };
}

export function serializeLocalDataset(): string {
  return JSON.stringify(buildLocalDataset(), null, 2);
}

export function parseLocalDataset(text: string): LocalDataset | null {
  try {
    const value = JSON.parse(text) as Partial<LocalDataset>;
    if (value.kind !== "divergence-local-dataset" || value.schemaVersion !== 1 ||
        !value.account || typeof value.account !== "object" ||
        !value.session || typeof value.session !== "object") return null;
    return value as LocalDataset;
  } catch {
    return null;
  }
}

export async function restoreLocalDataset(text: string): Promise<boolean> {
  const data = parseLocalDataset(text);
  if (!data) return false;
  useAccountStore.getState().hydrate(data.account);
  useSessionStore.getState().hydrate(data.session);
  restoreLocalWorkspace(data.workspace);
  await saveNow({ snapshotActiveSession: false });
  return true;
}
