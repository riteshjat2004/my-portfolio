/**
 * Centralized API error response handler
 * Masks internal database, library, and system errors from public API clients
 * while preserving full server-side logging for development and monitoring.
 */

export const sendError = (
  res,
  error,
  defaultMessage = "An internal server error occurred.",
  statusCode = 500
) => {
  // Always log full error details server-side
  console.error(`[Server Error] ${defaultMessage}:`, error);

  const isProd = process.env.NODE_ENV === "production";
  const message = isProd ? defaultMessage : (error?.message || defaultMessage);

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
