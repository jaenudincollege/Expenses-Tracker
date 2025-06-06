import toast from "react-hot-toast";

/**
 * Error handling utility for API responses
 */
export const handleApiError = (error, defaultMessage = "An error occurred") => {
  // Extract error message from response if available
  const errorMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMessage;

  // Log error to console with details
  console.error("API Error:", {
    message: errorMessage,
    status: error.response?.status,
    method: error.config?.method,
    url: error.config?.url,
    data: error.config?.data,
  });

  // Show toast notification
  toast.error(errorMessage);

  // Return the error message for UI display
  return errorMessage;
};

/**
 * Handle server validation errors (typically 400 responses)
 */
export const handleValidationErrors = (error) => {
  if (error.response?.status === 400 && error.response?.data?.errors) {
    const validationErrors = error.response.data.errors;

    // Log validation errors
    console.error("Validation Errors:", validationErrors);

    // Create formatted error message
    const errorMessage = "Please correct the following errors:";

    // Show toast for each validation error
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err) => toast.error(err));
    } else if (typeof validationErrors === "object") {
      Object.values(validationErrors).forEach((err) => {
        if (Array.isArray(err)) {
          err.forEach((e) => toast.error(e));
        } else if (typeof err === "string") {
          toast.error(err);
        }
      });
    }

    return {
      message: errorMessage,
      validationErrors,
    };
  }

  // If not validation error, use general error handling
  return {
    message: handleApiError(error),
    validationErrors: {},
  };
};

/**
 * Handle authentication errors (401, 403)
 * @param {Error} error - The error object from axios
 * @param {Function} logoutCallback - Callback function to log out the user
 */
export const handleAuthError = (error, logoutCallback) => {
  if (error.response?.status === 401) {
    // Unauthorized - Session expired or invalid token
    toast.error("Your session has expired. Please login again.");
    if (logoutCallback) logoutCallback();
    return true;
  }

  if (error.response?.status === 403) {
    // Forbidden - Not enough permissions
    toast.error("You do not have permission to perform this action.");
    return true;
  }

  return false;
};

/**
 * Handle network errors
 */
export const handleNetworkError = (error) => {
  if (error.message === "Network Error") {
    const message =
      "Unable to connect to the server. Please check your internet connection.";
    toast.error(message);
    return message;
  }
  return null;
};

/**
 * Main error handler that combines all error handling strategies
 */
export const processApiError = (error, options = {}) => {
  const { defaultMessage, logoutCallback } = options;

  // First check for network errors
  const networkError = handleNetworkError(error);
  if (networkError) return { message: networkError };

  // Then check for authentication errors
  if (handleAuthError(error, logoutCallback)) {
    return { message: "Authentication error" };
  }

  // Then check for validation errors
  if (error.response?.status === 400) {
    return handleValidationErrors(error);
  }

  // Finally, handle as a general error
  return {
    message: handleApiError(error, defaultMessage),
  };
};

export default {
  handleApiError,
  handleValidationErrors,
  handleAuthError,
  handleNetworkError,
  processApiError,
};
