/* Telemetry — public surface (Step 5.4). observePipeline is what CenterColumn
   calls instead of runPipeline directly; log.ts is the seam a future reader
   (Token Usage panel, Learning Loop) subscribes to. */
export { observePipeline } from "./observePipeline";
export {
  recordTelemetryEntry,
  getTelemetryEntries,
  subscribeTelemetry,
  resetTelemetryForTests,
  MAX_TELEMETRY_ENTRIES,
} from "./log";
export type { TelemetryEntry, TelemetryOutcome } from "./types";
