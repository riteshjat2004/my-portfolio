/**
 * Generate a URL-safe slug from a string
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Split accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-_]/g, "") // Remove invalid chars
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
};
