/**
 * Formats a number as Indian Rupees (INR).
 * Uses en-IN locale with no decimal places for clean boutique pricing.
 *
 * @param {number|string} amount - The price to format
 * @returns {string} Formatted price string e.g. "₹1,999"
 */
export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
