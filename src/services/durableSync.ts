import type { LocalDataset } from "./localDataset";
import { buildCompleteLocalDataset, restoreLocalDataset } from "./localDataset";
import {
  checksum,
  clearSyncConflict,
  getSyncConflict,
  getSyncMetadata,
  setSyncConflict,
  setSyncMetadata,
  type SyncConflict,
} from "./durableLayer4";

export interface AccountUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}

export interface AccountStatus {
  configured: boolean;
  user: AccountUser | null;
}

export type SyncResult =
  | { status: "synced"; revision: number; message: string }
  | { status: "conflict"; conflict: SyncConflict<LocalDataset>; message: string }
  | { status: "unavailable" | "signed-out" | "failed"; message: string };

interface RemoteRecord {
  revision: number;
  updatedAt: number;
  dataset: LocalDataset;
  checksum: string;
  deletedAt?: number;
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<{ response: Response; body: T }> {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({})) as T;
  return { response, body };
}

export async function getAccountStatus(): Promise<AccountStatus> {
  const { response, body } = await jsonRequest<AccountStatus>("/api/account");
  if (!response.ok) throw new Error("Account service unavailable");
  return body;
}

export async function submitAccount(
  action: "register" | "login",
  input: { email: string; password: string; displayName?: string },
): Promise<AccountUser> {
  const { response, body } = await jsonRequest<{ user?: AccountUser; error?: string }>("/api/account", {
    method: "POST",
    body: JSON.stringify({ action, ...input }),
  });
  if (!response.ok || !body.user) throw new Error(body.error ?? "Account access failed");
  return body.user;
}

export async function logOutWebAccount(): Promise<void> {
  await jsonRequest("/api/account", { method: "DELETE" });
}

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const merged = new Map(remote.map((item) => [item.id, item]));
  for (const item of local) {
    const existing = merged.get(item.id);
    if (!existing || checksum(existing) === checksum(item)) {
      merged.set(item.id, item);
    } else {
      merged.set(`${item.id}-local-${Date.now()}`, { ...item, id: `${item.id}-local-${Date.now()}` });
    }
  }
  return [...merged.values()];
}

export function mergeDatasets(local: LocalDataset, remote: LocalDataset): LocalDataset {
  const account = {
    ...remote.account,
    ...local.account,
    sessions: mergeById(local.account.sessions ?? [], remote.account.sessions ?? []),
    trashed: mergeById(local.account.trashed ?? [], remote.account.trashed ?? []),
    savedPrompts: mergeById(local.account.savedPrompts ?? [], remote.account.savedPrompts ?? []),
    templates: mergeById(local.account.templates ?? [], remote.account.templates ?? []),
  };
  const workspace = {
    tasks: mergeById(local.workspace.tasks, remote.workspace.tasks),
    resources: mergeById(local.workspace.resources, remote.workspace.resources),
  };
  const withoutChecksum = {
    ...remote,
    exportedAt: new Date().toISOString(),
    account,
    session: local.session,
    workspace,
    largeJob: local.largeJob ?? remote.largeJob ?? null,
  };
  const { checksum: _old, ...payload } = withoutChecksum;
  return { ...payload, checksum: checksum(payload) };
}

async function push(dataset: LocalDataset, expectedRevision: number): Promise<RemoteRecord> {
  const { response, body } = await jsonRequest<RemoteRecord & { error?: string }>("/api/sync", {
    method: "PUT",
    headers: { "if-match": String(expectedRevision) },
    body: JSON.stringify({ dataset }),
  });
  if (response.status === 409) throw Object.assign(new Error("revision-conflict"), { code: 409 });
  if (!response.ok) throw new Error(body.error ?? "Sync write failed");
  return body;
}

export async function syncNow(): Promise<SyncResult> {
  try {
    const account = await getAccountStatus();
    if (!account.configured) return { status: "unavailable", message: "Remote account storage is not configured." };
    if (!account.user) return { status: "signed-out", message: "Sign in to synchronize." };

    const local = await buildCompleteLocalDataset();
    const metadata = await getSyncMetadata();
    const { response, body } = await jsonRequest<RemoteRecord & { error?: string }>("/api/sync");

    if (response.status === 404) {
      const created = await push(local, 0);
      await setSyncMetadata({ accountId: account.user.id, remoteRevision: created.revision, datasetChecksum: local.checksum, syncedAt: Date.now() });
      return { status: "synced", revision: created.revision, message: "Saved to your account." };
    }
    if (!response.ok) return { status: "failed", message: body.error ?? "Remote sync failed." };

    const localChanged = !metadata || metadata.accountId !== account.user.id || metadata.datasetChecksum !== local.checksum;
    const remoteChanged = !metadata || metadata.accountId !== account.user.id || metadata.remoteRevision !== body.revision;

    if (localChanged && remoteChanged) {
      const conflict: SyncConflict<LocalDataset> = {
        id: `conflict-${Date.now()}`,
        accountId: account.user.id,
        detectedAt: Date.now(),
        local,
        remote: body.dataset,
        remoteRevision: body.revision,
      };
      await setSyncConflict(conflict);
      return { status: "conflict", conflict, message: "Both copies changed. Nothing was overwritten." };
    }

    if (remoteChanged) {
      const restored = await restoreLocalDataset(JSON.stringify(body.dataset));
      if (!restored) return { status: "failed", message: "Remote data failed validation; local data was preserved." };
      await setSyncMetadata({ accountId: account.user.id, remoteRevision: body.revision, datasetChecksum: body.dataset.checksum, syncedAt: Date.now() });
      return { status: "synced", revision: body.revision, message: "Loaded the newer account copy." };
    }

    if (localChanged) {
      const written = await push(local, body.revision);
      await setSyncMetadata({ accountId: account.user.id, remoteRevision: written.revision, datasetChecksum: local.checksum, syncedAt: Date.now() });
      return { status: "synced", revision: written.revision, message: "Account copy updated." };
    }

    return { status: "synced", revision: body.revision, message: "Already synchronized." };
  } catch (error) {
    if ((error as { code?: number }).code === 409) return syncNow();
    return { status: "failed", message: error instanceof Error ? error.message : "Remote sync failed." };
  }
}

export async function resolveSyncConflict(choice: "local" | "remote" | "both"): Promise<SyncResult> {
  const conflict = await getSyncConflict<LocalDataset>();
  if (!conflict) return { status: "failed", message: "No saved conflict was found." };
  const chosen = choice === "local"
    ? conflict.local
    : choice === "remote"
      ? conflict.remote
      : mergeDatasets(conflict.local, conflict.remote);
  if (choice !== "local") {
    const restored = await restoreLocalDataset(JSON.stringify(chosen));
    if (!restored) return { status: "failed", message: "The selected copy failed validation; nothing changed." };
  }
  try {
    const written = await push(chosen, conflict.remoteRevision);
    await setSyncMetadata({ accountId: conflict.accountId, remoteRevision: written.revision, datasetChecksum: chosen.checksum, syncedAt: Date.now() });
    await clearSyncConflict();
    return { status: "synced", revision: written.revision, message: choice === "both" ? "Both recoverable copies were kept." : "Conflict resolved." };
  } catch {
    return { status: "failed", message: "The account changed again. Refresh the conflict before choosing." };
  }
}
