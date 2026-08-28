/** R13: Normalize provider errors into safe categories.
    Never expose raw HTTP codes, raw error messages, or implementation details.
    Returns actionable error category, retryability, and next action that the
    UI renders instead of any raw request/provider internal. */

export type ProviderErrorCategory =
  | "auth_failed"           // 401/403: authentication or permission
  | "quota_exceeded"        // Rate limit, quota, token limit, or similar
  | "timeout"               // Request took too long
  | "unavailable_model"     // Model not found or doesn't exist
  | "content_policy"        // Refused due to safety/moderation
  | "service_unavailable"   // 503 or similar service issue/outage
  | "unknown";              // Uncategorized error

export interface CategorizedError {
  category: ProviderErrorCategory;
  /** Actionable user-facing message (never raw HTTP code or provider text). */
  message: string;
  /** Whether trying the same call again is worth offering. */
  retryable: boolean;
  /** What the user can concretely do next. */
  nextAction: string;
}

const CATEGORY_INFO: Record<ProviderErrorCategory, { message: string; nextAction: string }> = {
  auth_failed: {
    message: "Authentication failed.",
    nextAction: "Reconnect this provider in Settings → Provider Connections.",
  },
  quota_exceeded: {
    message: "Rate limit exceeded.",
    nextAction: "Wait a moment and retry, or check your plan limits.",
  },
  timeout: {
    message: "That request took too long.",
    nextAction: "Retry with shorter text, or use a simpler question.",
  },
  unavailable_model: {
    message: "This model isn't available.",
    nextAction: "Choose a different model in Settings.",
  },
  content_policy: {
    message: "That request violates the AI service's usage policy.",
    nextAction: "Try a different question or approach.",
  },
  service_unavailable: {
    message: "The AI service is temporarily unavailable.",
    nextAction: "Retry in a moment.",
  },
  unknown: {
    message: "Something went wrong with that request.",
    nextAction: "Retry, or check Settings if this keeps happening.",
  },
};

/** Check if an error is retryable based on its category.
    Some errors (like quota limits) are worth retrying after a delay.
    Others (like auth failures) won't succeed until the user changes settings. */
export function isRetryable(category: ProviderErrorCategory): boolean {
  return category === "timeout" || category === "service_unavailable" || category === "quota_exceeded";
}

function categorized(category: ProviderErrorCategory): CategorizedError {
  return { category, retryable: isRetryable(category), ...CATEGORY_INFO[category] };
}

/** Categorize a provider error from HTTP status, error message, or exception.
    Returns actionable error category, retryability, and next action.
    Never exposes raw HTTP codes, secrets, or technical implementation details. */
export function categorizeProviderError(
  statusOrMessage: number | string,
  _responseBody?: string | null,
): CategorizedError {
  // If statusOrMessage is a number, it's an HTTP status code
  if (typeof statusOrMessage === "number") {
    const status = statusOrMessage;

    if (status === 401 || status === 403) return categorized("auth_failed");
    if (status === 429) return categorized("quota_exceeded");
    if (status === 408) return categorized("timeout");
    if (status === 404) return categorized("unavailable_model");
    if (status === 503 || status === 502 || status === 504) return categorized("service_unavailable");
    // Catch-all for other HTTP errors
    return categorized("unknown");
  }

  // If statusOrMessage is a string, parse the error message
  const message = statusOrMessage.toLowerCase();

  if (message.includes("auth") || message.includes("unauthorized") || message.includes("forbidden")) {
    return categorized("auth_failed");
  }
  if (message.includes("rate limit") || message.includes("quota") || message.includes("limit")) {
    return categorized("quota_exceeded");
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return categorized("timeout");
  }
  if (message.includes("not found") || message.includes("unknown model")) {
    return categorized("unavailable_model");
  }
  if (message.includes("policy") || message.includes("safety") || message.includes("refused")) {
    return categorized("content_policy");
  }
  if (message.includes("unavailable") || message.includes("error 500")) {
    return categorized("service_unavailable");
  }

  // Default: unknown error
  return categorized("unknown");
}

/** Categorize whatever a `catch` block actually received. Structured proxy
    errors (ProxyClientError, .status set) are categorized by their real HTTP
    status; anything else falls back to keyword-matching its message text.
    This is the one function real failure paths should call — never
    `error.message`/`String(error)` directly, which can carry raw provider
    response bodies (see proxyClient.ts's ProxyClientError.detail, which is
    deliberately never read here). */
export function categorizeCaughtError(error: unknown): CategorizedError {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return categorizeProviderError((error as { status: number }).status);
  }
  if (error instanceof Error) return categorizeProviderError(error.message);
  return categorizeProviderError(String(error));
}
