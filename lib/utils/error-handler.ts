/**
 * Error Handler Utility
 * Converts API errors into user-friendly English messages
 */

export interface ApiError {
  status?: number;
  statusText?: string;
  message?: string;
  detail?: string;
  success?: boolean;
}

/**
 * Format HTTP error messages in English
 */
export function formatErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred"
): string {
  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API response errors
  if (isApiError(error)) {
    return getApiErrorMessage(error);
  }

  return fallbackMessage;
}

/**
 * Get user-friendly error message based on HTTP status code
 */
export function getHttpErrorMessage(
  status: number,
  statusText?: string
): string {
  switch (status) {
    case 400:
      return "Bad Request: Please check your input and try again";

    case 401:
      return "Unauthorized: Please log in to continue";

    case 403:
      return "Access Denied: This feature requires a VIP account. Please upgrade to access AI-powered analysis";

    case 404:
      return "Not Found: The requested resource could not be found";

    case 409:
      return "Conflict: This action conflicts with existing data";

    case 422:
      return "Validation Error: Please check your input data";

    case 429:
      return "Too Many Requests: Please wait a moment and try again";

    case 500:
      return "Internal Server Error: Something went wrong on our end. Please try again later";

    case 502:
      return "Bad Gateway: Unable to reach the server. Please try again";

    case 503:
      return "Service Unavailable: The service is temporarily down. Please try again later";

    case 504:
      return "Gateway Timeout: The request took too long. Please try again";

    default:
      return statusText || `HTTP Error ${status}: Something went wrong`;
  }
}

/**
 * Get detailed error message from API error response
 */
function getApiErrorMessage(error: ApiError): string {
  // Priority 1: Specific error message from API
  if (error.message) {
    return error.message;
  }

  // Priority 2: Detail field (common in FastAPI)
  if (error.detail) {
    return error.detail;
  }

  // Priority 3: HTTP status code with friendly message
  if (error.status) {
    return getHttpErrorMessage(error.status, error.statusText);
  }

  // Priority 4: Generic failure message
  return "Request failed. Please try again";
}

/**
 * Type guard to check if error is an API error
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("status" in error ||
      "message" in error ||
      "detail" in error ||
      "success" in error)
  );
}

/**
 * Enhanced fetch error handler with detailed English messages
 */
export async function handleFetchError(
  response: Response,
  context: string = "request"
): Promise<never> {
  let errorMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let errorData: any = {};

  // Try to parse error response body
  try {
    errorData = await response.json();
  } catch {
    // If JSON parsing fails, use status text
    errorData = {};
  }

  // Format error message based on status code and response data
  if (response.status === 401) {
    // Check for specific authentication error messages
    const originalMessage = errorData.message || errorData.detail || "";

    if (
      originalMessage.includes("Missing") &&
      originalMessage.includes("Authorization")
    ) {
      errorMessage = "Please log in to access this feature";
    } else if (
      originalMessage.includes("invalid") &&
      originalMessage.includes("token")
    ) {
      errorMessage = "Your session has expired. Please log in again";
    } else if (originalMessage.includes("expired")) {
      errorMessage = "Your session has expired. Please log in again";
    } else {
      errorMessage =
        originalMessage || "Authentication required. Please log in to continue";
    }
  } else if (response.status === 403) {
    errorMessage =
      errorData.message ||
      "Access denied. This feature requires a VIP account. Upgrade to access AI-powered analysis and advanced features";
  } else if (response.status === 404) {
    errorMessage =
      errorData.message || `${context} not found. Please check and try again`;
  } else if (response.status === 422) {
    // Validation errors - try to extract field-specific messages
    if (errorData.detail && Array.isArray(errorData.detail)) {
      const validationErrors = errorData.detail
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
        .join(", ");
      errorMessage = `Validation error: ${validationErrors}`;
    } else {
      errorMessage =
        errorData.message ||
        errorData.detail ||
        "Invalid input. Please check your data and try again";
    }
  } else if (response.status >= 500) {
    errorMessage =
      errorData.message ||
      `Server error (${response.status}). Our team has been notified. Please try again later`;
  } else {
    errorMessage =
      errorData.message ||
      errorData.detail ||
      getHttpErrorMessage(response.status, response.statusText);
  }

  throw new Error(errorMessage);
}

/**
 * Format network error messages
 */
export function formatNetworkError(error: unknown): string {
  // Handle Error objects with specific messages
  if (error instanceof Error) {
    const message = error.message;

    // Check for authentication errors
    if (message.includes("Missing") && message.includes("Authorization")) {
      return "Please log in to access this feature";
    }

    if (
      message.includes("invalid") &&
      (message.includes("token") || message.includes("Authorization"))
    ) {
      return "Your session has expired. Please log in again";
    }

    if (message.includes("expired") && message.includes("token")) {
      return "Your session has expired. Please log in again";
    }

    // Check for VIP/Access denied errors
    if (
      message.includes("VIP") ||
      message.includes("Access denied") ||
      message.includes("Access Denied")
    ) {
      return "Access denied. This feature requires a VIP account. Please upgrade to access AI-powered features";
    }

    // Check for network errors
    if (
      message.includes("Failed to fetch") ||
      message.includes("Network request failed")
    ) {
      return "Network error: Unable to connect to server. Please check your internet connection and try again";
    }

    if (message.includes("CORS")) {
      return "Connection error: Unable to access the service. Please try again later";
    }

    // Return the error message as-is if it's already user-friendly
    return message;
  }

  if (error instanceof TypeError) {
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed")
    ) {
      return "Network error: Unable to connect to server. Please check your internet connection and try again";
    }

    if (error.message.includes("CORS")) {
      return "Connection error: Unable to access the service. Please try again later";
    }
  }

  return formatErrorMessage(
    error,
    "Connection failed. Please check your internet connection"
  );
}

/**
 * Format timeout error messages
 */
export function formatTimeoutError(timeoutMs: number = 30000): string {
  const seconds = Math.round(timeoutMs / 1000);
  return `Request timeout: The operation took longer than ${seconds} seconds. Please try again`;
}

/**
 * Get VIP upgrade prompt message
 */
export function getVipUpgradeMessage(
  featureName: string = "this feature"
): string {
  return `${featureName} is only available for VIP members. Upgrade your account to access AI-powered sentiment analysis, causal analysis, and advanced trading insights`;
}

/**
 * Format validation error messages
 */
export function formatValidationError(field: string, message: string): string {
  return `${field}: ${message}`;
}

/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("authentication") ||
      message.includes("log in") ||
      message.includes("login") ||
      (message.includes("missing") && message.includes("authorization")) ||
      (message.includes("invalid") && message.includes("token")) ||
      (message.includes("expired") && message.includes("token"))
    );
  }
  return false;
}

/**
 * Check if error is a VIP access error
 */
export function isVipAccessError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("vip") ||
      message.includes("access denied") ||
      message.includes("upgrade") ||
      message.includes("premium")
    );
  }
  return false;
}

/**
 * Get redirect action for authentication errors
 */
export function getAuthenticationAction(): {
  action: "login" | "refresh";
  message: string;
} {
  // Check if we have a refresh token
  if (typeof window !== "undefined") {
    const hasRefreshToken = localStorage.getItem("refresh_token");
    if (hasRefreshToken) {
      return {
        action: "refresh",
        message: "Your session has expired. Please log in again",
      };
    }
  }

  return {
    action: "login",
    message: "Please log in to access this feature",
  };
}
