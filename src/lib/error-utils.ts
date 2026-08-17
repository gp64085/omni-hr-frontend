import axios from "axios";

/**
 * Extracts a user-friendly error message from an API exception or standard error.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.error?.message;
    if (backendMessage && typeof backendMessage === "string") {
      return backendMessage;
    }
    const generalDetail = error.response?.data?.detail;
    if (generalDetail && typeof generalDetail === "string") {
      return generalDetail;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallbackMessage;
}
