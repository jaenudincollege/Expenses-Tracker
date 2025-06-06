// Utility functions for handling API responses and data formatting

/**
 * Extract data from nested API responses where data might be inside
 * a property named after the collection
 *
 * @param {Object} response - API response object
 * @param {string} collectionName - Name of the collection (e.g., 'expenses')
 * @returns {Array|Object} - The normalized data
 */
export const extractApiData = (response, collectionName) => {
  if (!response) return null;

  // If the response has a property matching the collection name, return that
  if (response[collectionName]) {
    return response[collectionName];
  }

  // Otherwise return the original response
  return response;
};

/**
 * Format currency values for display
 *
 * @param {number} amount - Numeric amount
 * @param {string} currencyCode - Currency code (defaults to USD)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = "USD") => {
  // For display purposes, use absolute value to hide negative sign
  const displayAmount = amount < 0 ? Math.abs(amount) : amount;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(displayAmount);
};

/**
 * Format date for display
 *
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

export default {
  extractApiData,
  formatCurrency,
  formatDate,
};
