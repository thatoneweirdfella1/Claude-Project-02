import { deleteDB, openDB, type IDBPDatabase } from "idb";
import type { AccountState, SessionRecoveryReason, SessionState } from "../stores/types";
import type { MoneySnapshot } from "./moneySafety";
import {
  getLocalWorkspace,
  restoreLocalWorkspace,
  subscribeLocalWorkspace,
  type LocalWorkspaceSnapshot,
  type SyntheticJobUnit,
} from "./localWorkspace";

const DB_NAME = "divergence-layer4";
const DB_VERSION = 2;
const JOBS = "jobs";
const RECOVERY = "recovery";
const META = "meta";
const CONFLICTS = "conflicts";
const WORKSPACE = "workspace";
const MONEY = "money";
const ACTIVE_JOB_KEY = "active";
const WORKSPACE_KEY = "current";
const SYNC_META_KEY = "sync";
const ACTIVE_CONFLICT_KEY = "active";
const MONEY_KEY = "authority";
const MAX_RECOVERY_POINTS = 20;

let dbPromise: Promise<IDBPDatabase> | null = null;

function database(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const name of [JOBS, RECOVERY, META, CONFLICTS, WORKSPACE, MONEY]) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
        }
      },
    });
  }
  return dbPromise;
}

export interface DurableJobRecord {
  id: string;
  kind: "synthetic-local-job";
  source: string;
  batchSize: number;
  units: SyntheticJobUnit[];
  paused: boolean;
  createdAt: number;
  updatedAt: number;
  status: "ready" | "running" | "paused" | "complete";
}

export interface RecoveryPoint {
  id: string;
  createdAt: number;
  reason: SessionRecoveryReason;
  session: Partial<SessionState>;
  account: Partial<AccountState>;
}

export interface SyncMetadata {
  accountId: string;
  remoteRevision: number;
  datasetChecksum: string;
  syncedAt: number;
}

export interface SyncConflict<T = unknown> {
  id: string;
  accountId: string;
  detectedAt: number;
  local: T;
  remote: T;
  remoteRevision: number;
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function checksum(value: unknown): string {
  const text = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export async function saveDurableJob(job: DurableJobRecord): Promise<void> {
  const db = await database();
  await db.put(JOBS, structuredClone(job), ACTIVE_JOB_KEY);
}

export async function loadDurableJob(): Promise<DurableJobRecord | null> {
  const db = await database();
  return (await db.get(JOBS, ACTIVE_JOB_KEY) as DurableJobRecord | undefined) ?? null;
}

export async function clearDurableJob(): Promise<void> {
  const db = await database();
  await db.delete(JOBS, ACTIVE_JOB_KEY);
}

export async function saveRecoveryPoint(
  session: Partial<SessionState>,
  account: Partial<AccountState>,
  reason: SessionRecoveryReason,
): Promise<void> {
  const db = await database();
  const createdAt = Date.now();
  const point: RecoveryPoint = {
    id: `recovery-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    reason,
    session: structuredClone(session),
    account: structuredClone(account),
  };
  const tx = db.transaction(RECOVERY, "readwrite");
  await tx.store.put(point, point.id);
  const points = (await tx.store.getAll() as RecoveryPoint[]).sort((a, b) => a.createdAt - b.createdAt);
  for (const old of points.slice(0, Math.max(0, points.length - MAX_RECOVERY_POINTS))) {
    await tx.store.delete(old.id);
  }
  await tx.done;
}

export async function listRecoveryPoints(): Promise<RecoveryPoint[]> {
  const db = await database();
  const points = await db.getAll(RECOVERY) as RecoveryPoint[];
  return points.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSyncMetadata(): Promise<SyncMetadata | null> {
  const db = await database();
  return (await db.get(META, SYNC_META_KEY) as SyncMetadata | undefined) ?? null;
}

export async function setSyncMetadata(value: SyncMetadata): Promise<void> {
  const db = await database();
  await db.put(META, structuredClone(value), SYNC_META_KEY);
}

export async function getSyncConflict<T>(): Promise<SyncConflict<T> | null> {
  const db = await database();
  return (await db.get(CONFLICTS, ACTIVE_CONFLICT_KEY) as SyncConflict<T> | undefined) ?? null;
}

export async function setSyncConflict<T>(value: SyncConflict<T>): Promise<void> {
  const db = await database();
  await db.put(CONFLICTS, structuredClone(value), ACTIVE_CONFLICT_KEY);
}

export async function clearSyncConflict(): Promise<void> {
  const db = await database();
  await db.delete(CONFLICTS, ACTIVE_CONFLICT_KEY);
}

export async function loadDurableWorkspace(): Promise<LocalWorkspaceSnapshot> {
  const db = await database();
  const snapshot = await db.get(WORKSPACE, WORKSPACE_KEY) as LocalWorkspaceSnapshot | undefined;
  return snapshot ? restoreLocalWorkspace(snapshot) : getLocalWorkspace();
}

export function startDurableWorkspacePersistence(): () => void {
  let queue = Promise.resolve();
  return subscribeLocalWorkspace((snapshot) => {
    queue = queue.then(async () => {
      const db = await database();
      await db.put(WORKSPACE, structuredClone(snapshot), WORKSPACE_KEY);
    }).catch((error) => {
      console.error("[durability] workspace save failed", error);
    });
  });
}

export async function saveMoneySnapshot(snapshot: MoneySnapshot): Promise<void> {
  const db = await database();
  await db.put(MONEY, structuredClone(snapshot), MONEY_KEY);
}

export async function loadMoneySnapshot(): Promise<MoneySnapshot | null> {
  const db = await database();
  return (await db.get(MONEY, MONEY_KEY) as MoneySnapshot | undefined) ?? null;
}

export async function _resetLayer4DatabaseForTests(): Promise<void> {
  const current = dbPromise ? await dbPromise : null;
  current?.close();
  dbPromise = null;
  await deleteDB(DB_NAME);
}
