import { ACCOUNT_PERSISTED_KEYS, useAccountStore } from "../stores/accountStore";
import { SESSION_PERSISTED_KEYS, useSessionStore } from "../stores/sessionStore";
import type { AccountState, SessionState } from "../stores/types";
import {
  checksum,
  loadDurableJob,
  saveDurableJob,
  type DurableJobRecord,
} from "./durableLayer4";
import { getLocalWorkspace, restoreLocalWorkspace, type LocalWorkspaceSnapshot } from "./localWorkspace";
import { saveNow } from "./persistence";

export interface LocalDataset {
  kind: "divergence-local-dataset";
  schemaVersion: 2;
  exportedAt: string;
  provenance: {
    producer: "Divergence.AI";
    scope: "complete-user-owned-data";
    excludes: ["credentials", "server-secrets"];
  };
  account: Partial<AccountState>;
  session: Partial<SessionState>;
  workspace: LocalWorkspaceSnapshot;
  largeJob?: DurableJobRecord | null;
  checksum: string;
}

interface LegacyDataset {
  kind: "divergence-local-dataset";
  schemaVersion: 1;
  exportedAt?: string;
  account: Partial<AccountState>;
  session: Partial<SessionState>;
  workspace?: LocalWorkspaceSnapshot;
}

function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>;
}

function payloadChecksum(data: Omit<LocalDataset, "checksum">): string {
  return checksum(data);
}

export function buildLocalDataset(): LocalDataset {
  const withoutChecksum: Omit<LocalDataset, "checksum"> = {
    kind: "divergence-local-dataset",
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    provenance: {
      producer: "Divergence.AI",
      scope: "complete-user-owned-data",
      excludes: ["credentials", "server-secrets"],
    },
    account: pick(useAccountStore.getState(), ACCOUNT_PERSISTED_KEYS),
    session: pick(useSessionStore.getState(), SESSION_PERSISTED_KEYS),
    workspace: getLocalWorkspace(),
  };
  return { ...withoutChecksum, checksum: payloadChecksum(withoutChecksum) };
}

export async function buildCompleteLocalDataset(): Promise<LocalDataset> {
  const base = buildLocalDataset();
  const { checksum: _oldChecksum, ...withoutChecksum } = base;
  const complete = { ...withoutChecksum, largeJob: await loadDurableJob() };
  return { ...complete, checksum: payloadChecksum(complete) };
}

export function serializeLocalDataset(): string {
  return JSON.stringify(buildLocalDataset(), null, 2);
}

export async function serializeCompleteLocalDataset(): Promise<string> {
  return JSON.stringify(await buildCompleteLocalDataset(), null, 2);
}

function migrateLegacy(value: LegacyDataset): LocalDataset {
  const withoutChecksum: Omit<LocalDataset, "checksum"> = {
    kind: "divergence-local-dataset",
    schemaVersion: 2,
    exportedAt: value.exportedAt ?? new Date().toISOString(),
    provenance: {
      producer: "Divergence.AI",
      scope: "complete-user-owned-data",
      excludes: ["credentials", "server-secrets"],
    },
    account: value.account,
    session: value.session,
    workspace: value.workspace ?? { tasks: [], resources: [] },
    largeJob: null,
  };
  return { ...withoutChecksum, checksum: payloadChecksum(withoutChecksum) };
}

export function parseLocalDataset(text: string): LocalDataset | null {
  if (text.length > 10_000_000) return null;
  try {
    const value = JSON.parse(text) as Record<string, unknown>;
    if (value.kind !== "divergence-local-dataset" ||
        !value.account || typeof value.account !== "object" ||
        !value.session || typeof value.session !== "object") return null;
    if (value.schemaVersion === 1) return migrateLegacy(value as unknown as LegacyDataset);
    if (value.schemaVersion !== 2 || !value.provenance || typeof value.checksum !== "string") return null;
    const { checksum: claimed, ...withoutChecksum } = value as unknown as LocalDataset;
    if (payloadChecksum(withoutChecksum) !== claimed) return null;
    return value as unknown as LocalDataset;
  } catch {
    return null;
  }
}

export async function restoreLocalDataset(text: string): Promise<boolean> {
  const data = parseLocalDataset(text);
  if (!data) return false;
  const previousAccount = pick(useAccountStore.getState(), ACCOUNT_PERSISTED_KEYS);
  const previousSession = pick(useSessionStore.getState(), SESSION_PERSISTED_KEYS);
  const previousWorkspace = getLocalWorkspace();
  const previousJob = await loadDurableJob();
  try {
    useAccountStore.getState().hydrate(data.account);
    useSessionStore.getState().hydrate(data.session);
    restoreLocalWorkspace(data.workspace);
    if (data.largeJob) await saveDurableJob(data.largeJob);
    await saveNow({ snapshotActiveSession: false });
    return true;
  } catch {
    useAccountStore.getState().hydrate(previousAccount);
    useSessionStore.getState().hydrate(previousSession);
    restoreLocalWorkspace(previousWorkspace);
    if (previousJob) await saveDurableJob(previousJob);
    await saveNow({ snapshotActiveSession: false }).catch(() => undefined);
    return false;
  }
}
