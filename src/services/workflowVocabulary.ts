/* R29: Honest Readiness and Workflow Wording — ONE truthful vocabulary,
   driven by real state, for describing where a request/connection/message
   currently stands. Before this, the same underlying state was worded
   differently in different places (routeReadiness's ad hoc strings,
   MultiAiRunHistory's own labels, the composer's workflow-message line) —
   not contradictory, but not provably the same source either, which is how
   wording drifts apart over time as each screen is edited independently.

   Every surface that needs one of these eight states pulls its label from
   here instead of writing its own phrase. A caller may still add specific
   detail after the label (a provider name, an error reason) — the label
   itself is what must never be reinvented. */

export type WorkflowStage =
  | "local-preparation"
  | "provider-configured"
  | "verified"
  | "sending"
  | "answered"
  | "failed"
  | "cancelled"
  | "manual-handoff";

/** The exact, single wording for each stage. Never optimistic (nothing here
    claims success before it is confirmed) and never vague (no "processing"
    standing in for a state this vocabulary already names). */
export const WORKFLOW_STAGE_LABEL: Record<WorkflowStage, string> = {
  "local-preparation": "Local preparation",
  "provider-configured": "Provider configured",
  "verified": "Verified",
  "sending": "Sending",
  "answered": "Answered",
  "failed": "Failed",
  "cancelled": "Cancelled",
  "manual-handoff": "Manual handoff",
};

/** Longer, still-honest description for each stage — used where a full
    sentence is appropriate (status panels, tooltips) rather than a short
    label (buttons, badges). */
export const WORKFLOW_STAGE_DESCRIPTION: Record<WorkflowStage, string> = {
  "local-preparation": "Prepared locally — no provider connection required, no credits used.",
  "provider-configured": "The server reports this provider configured, but its connection has not been verified yet.",
  "verified": "A real health check confirmed this provider is reachable right now.",
  "sending": "A request is in flight to the provider.",
  "answered": "A response was received and added to the conversation.",
  "failed": "The request did not complete. Nothing further was charged for it.",
  "cancelled": "Cancelled before it completed. Nothing further was charged for it.",
  "manual-handoff": "Handed off for the user to send manually, outside this app's own paid routes.",
};
