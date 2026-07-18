import { useEffect, useState } from "react";
import { getTelemetryEntries, subscribeTelemetry, type TelemetryEntry } from "../../services/telemetry";

/* Subscribes to the telemetry log (Step 5.4) and returns the most recently
   recorded entry — Step 8.2's whole "reading from telemetry" instruction.
   null before any request in this browser session has finished (log.ts is
   in-memory only, cleared on reload, same standing note as every other
   telemetry consumer). */
export function useLatestTelemetry(): TelemetryEntry | null {
  const [entries, setEntries] = useState<readonly TelemetryEntry[]>(getTelemetryEntries());

  useEffect(() => subscribeTelemetry(setEntries), []);

  return entries.length > 0 ? entries[entries.length - 1] : null;
}
