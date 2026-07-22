/* The telemetry log itself (Step 5.4) — "lightweight," "local only, no
   third-party analytics." An in-memory, bounded ring buffer, not a third
   Zustand store: CANON "STORES AND PERSISTENCE" plans exactly two stores
   (session, account), and neither CANON nor STORE-CONTRACT.md names a
   telemetry field on either — inventing one now would presume a persistence
   decision (how long entries survive, whether they sync across sessions)
   that belongs to whichever future step actually builds a reader (Token
   Usage panel: Step 9.6; Learning Loop: Step 10.1). This module is that
   reader's seam: subscribe/getEntries, nothing UI-specific.

   Bounded at MAX_TELEMETRY_ENTRIES so a long session can't leak memory —
   the oldest entries fall off. Cleared on reload (in-memory only); a future
   step deciding entries need to survive a refresh persists FROM here, this
   module doesn't reach into IndexedDB itself. */

import type { TelemetryEntry } from "./types";

export const MAX_TELEMETRY_ENTRIES = 200;

type TelemetryListener = (entries: readonly TelemetryEntry[]) => void;

let entries: TelemetryEntry[] = [];
const listeners = new Set<TelemetryListener>();

export function recordTelemetryEntry(entry: TelemetryEntry): void {
  entries = [...entries, entry];
  if (entries.length > MAX_TELEMETRY_ENTRIES) {
    entries = entries.slice(entries.length - MAX_TELEMETRY_ENTRIES);
  }
  for (const listener of listeners) listener(entries);
}

export function getTelemetryEntries(): readonly TelemetryEntry[] {
  return entries;
}

/** Subscribe to every future recordTelemetryEntry call; returns an
    unsubscribe function. Mirrors the Zustand store subscribe shape so a
    future React consumer (e.g. the Token Usage panel) can wrap this the same
    way it wraps useSessionStore/useAccountStore. */
export function subscribeTelemetry(listener: TelemetryListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test-only reset — no production caller clears the log (CANON never asks
    for a "clear telemetry" action; New/Close Session don't touch it either,
    since telemetry outlives any one session by design, same as the Learning
    Loop needing 15+ questions' worth of history to fire). */
export function resetTelemetryForTests(): void {
  entries = [];
}
