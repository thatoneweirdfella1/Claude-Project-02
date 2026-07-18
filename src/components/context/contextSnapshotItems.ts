/* Context Snapshot data (Step 7.5) — CANON Feature 6: "A Context Snapshot
   panel shows loaded items with remove buttons." Pure function, no store, no
   React — the component (ContextSnapshotPanel.tsx) wires it to the real
   stores and to removeContextItem/removeSessionVariable.

   "Loaded items" is read as everything Feature 6 lists as a way to load
   context: uploaded files, pasted URLs (both already ContextItem entries in
   session.context, Steps 7.1/7.3), AND created variables (Step 7.4,
   session.variables — a separate Record<string,string>, not a ContextItem).
   Rather than duplicate variables into session.context as synthetic
   ContextItem entries (which would need to stay in sync with
   session.variables on every create/remove — two sources of truth for one
   concept, a sync bug waiting to happen), this function reads BOTH sources
   and returns one unified, renderable list. session.context is the only
   store of record for files/URLs; session.variables is the only store of
   record for variables. */

import type { ContextItem, ContextItemKind, SavedVariables } from "../../stores/types";
import { formatBytes } from "../../services/context";

export interface SnapshotItem {
  /** Stable React key AND the identifier removal needs — for files/URLs the
      ContextItem's own id; for variables, "variable:" + the bare name (never
      collides with a ContextItem id, which is a generated uuid/timestamp
      string, not this literal prefix). */
  id: string;
  kind: ContextItemKind;
  label: string;
  /** Human-readable secondary line — byte size for files/URLs, a preview of
      the value for variables. */
  detail: string;
}

const VARIABLE_ID_PREFIX = "variable:";

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function buildSnapshotItems(
  context: readonly ContextItem[],
  variables: SavedVariables,
): SnapshotItem[] {
  const fromContext: SnapshotItem[] = context.map((item) => ({
    id: item.id,
    kind: item.kind,
    label: item.label,
    detail: formatBytes(item.bytes),
  }));

  const fromVariables: SnapshotItem[] = Object.entries(variables).map(([name, value]) => ({
    id: `${VARIABLE_ID_PREFIX}${name}`,
    kind: "variable",
    label: `$${name}`,
    detail: value.length === 0 ? "(empty)" : truncate(value, 40),
  }));

  return [...fromContext, ...fromVariables];
}

/** Extracts the bare variable name from a SnapshotItem.id built above — the
    inverse of the "variable:" prefix, so the component can call
    removeSessionVariable(name) without re-deriving the prefix convention
    itself. Returns null for a non-variable item's id. */
export function variableNameFromSnapshotId(id: string): string | null {
  return id.startsWith(VARIABLE_ID_PREFIX) ? id.slice(VARIABLE_ID_PREFIX.length) : null;
}

/** User-facing label per kind — no icon library exists in this build
    (repo-wide debt since Step 1.5), so a short text prefix stands in. */
export const SNAPSHOT_KIND_LABELS: Record<ContextItemKind, string> = {
  file: "File",
  url: "URL",
  text: "Text",
  variable: "Variable",
};
