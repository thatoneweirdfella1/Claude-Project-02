/** R13: Normalize provider errors into safe categories.
    Never expose raw HTTP codes, raw error messages, or implementation details.
    Returns actionable error category that UI can use to render appropriate user message. */

export type ProviderErrorCategory =
  | "auth_failed"           // 401/403: authentication or permission
  | "quota_exceeded"        // Rate limit, quota, token limit, or similar
  | "timeout"               // Request took too long
  | "unavailable_model"     // Model not found or doesn't exist
  | "content_policy"        // Refused due to safety/moderation
  | "service_unavailable"   // 503 or similar service issue
  | "unknown";              // Uncategorized error

export interface CategorizedError {
  category: ProviderErrorCategory;
  message: string;  // Actionable user-facing message (never raw HTTP code)
}

/** Categorize a provider error from HTTP status, error message, or exception.
    Returns actionable error category and user-friendly message.
    Never exposes raw HTTP codes, secrets, or technical implementation details. */
export function categorizeProviderError(
  statusOrMessage: number | string,
  _responseBody?: string | null,
): CategorizedError {
  // If statusOrMessage is a number, it's an HTTP status code
  if (typeof statusOrMessage === "number") {
    const status = statusOrMessage;

    if (status === 401 || status === 403) {
      return {
        category: "auth_failed",
        message: "Authentication failed. Check your API key or permissions in settings.",
      };
    }
    if (status === 429 || status === 408) {
      return {
        category: status === 429 ? "quota_exceeded" : "timeout",
        message: status === 429
          ? "Rate limit exceeded. Try again in a moment, or check your plan limits."
          : "That request took too long. Try again with shorter text, or use a simpler question.",
      };
    }
    if (status === 404) {
      return {
        category: "unavailable_model",
        message: "This model isn't available. Try a different model from settings.",
      };
    }
    if (status === 503 || status === 502 || status === 504) {
      return {
        category: "service_unavailable",
        message: "The AI service is temporarily unavailable. Please try again in a moment.",
      };
    }
    // Catch-all for other HTTP errors
    return {
      category: "unknown",
      message: "Something went wrong with that request. Try again, or check your settings.",
    };
  }

  // If statusOrMessage is a string, parse the error message
  const message = statusOrMessage.toLowerCase();

  if (message.includes("auth") || message.includes("unauthorized") || message.includes("forbidden")) {
    return {
      category: "auth_failed",
      message: "Authentication failed. Check your API key or permissions in settings.",
    };
  }
  if (message.includes("rate limit") || message.includes("quota") || message.includes("limit")) {
    return {
      category: "quota_exceeded",
      message: "Rate limit exceeded. Try again in a moment, or check your plan limits.",
    };
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return {
      category: "timeout",
      message: "That request took too long. Try again with shorter text, or use a simpler question.",
    };
  }
  if (message.includes("not found") || message.includes("unknown model")) {
    return {
      category: "unavailable_model",
      message: "This model isn't available. Try a different model from settings.",
    };
  }
  if (message.includes("policy") || message.includes("safety") || message.includes("refused")) {
    return {
      category: "content_policy",
      message: "That request violates the AI service's usage policy. Try a different question or approach.",
    };
  }
  if (message.includes("unavailable") || message.includes("error 500")) {
    return {
      category: "service_unavailable",
      message: "The AI service is temporarily unavailable. Please try again in a moment.",
    };
  }

  // Default: unknown error
  return {
    category: "unknown",
    message: "Something went wrong with that request. Try again, or check your settings.",
  };
}

/** Check if an error is retryable based on its category.
    Some errors (like quota limits) are worth retrying after a delay.
    Others (like auth failures) won't succeed until the user changes settings. */
export function isRetryable(category: ProviderErrorCategory): boolean {
  return category === "timeout" || category === "service_unavailable" || category === "quota_exceeded";
}
