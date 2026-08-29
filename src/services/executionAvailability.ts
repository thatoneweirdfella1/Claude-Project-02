/**
 * Layer 6 connected execution gate.
 *
 * Adapters are enabled for explicit paid routes. Free-first/local routes remain
 * the default and missing server credentials fail closed inside each proxy;
 * no provider key is ever exposed to the browser.
 */
export const CONNECTED_EXECUTION_AVAILABLE = true;

export const CONNECTED_EXECUTION_UNAVAILABLE_MESSAGE =
  "Connected execution is unavailable. Divergence will preserve the request for a no-charge manual handoff.";
