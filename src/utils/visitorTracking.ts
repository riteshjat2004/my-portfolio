/**
 * Visitor tracking utilities
 * Generates or retrieves a unique visitor ID and tracks page visits
 */

const VISITOR_ID_KEY = "portfolio_visitor_id";

/**
 * Generate a unique visitor ID using timestamp + random string
 */
const generateVisitorId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`;
};

/**
 * Get or create a visitor ID from localStorage
 */
export const getOrCreateVisitorId = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
};

/**
 * Get the current visitor ID (without creating one)
 */
export const getVisitorId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(VISITOR_ID_KEY);
};
