/**
 * Layer 2 is an interaction-only preview. Connected providers and payment
 * effects stay closed until the Connected layer proves their real adapters.
 */
export const CONNECTED_EXECUTION_AVAILABLE = false;

export const CONNECTED_EXECUTION_UNAVAILABLE_MESSAGE =
  "Connected execution is not enabled in this preview. Divergence will prepare a no-charge manual handoff instead.";
