/**
 * Reusable utility for formatting currency values in Indian Rupee (INR) format.
 * Prevents re-formatting, string concatenation bugs, array implicit toString, and invalid numbers.
 */

/**
 * Safely parses any value (number, string with currency/commas, array of values, null, undefined)
 * into a valid primitive JavaScript number.
 */
export const parseNumericValue = (val) => {
  if (val === null || val === undefined || val === "") return 0;

  if (typeof val === "number") {
    if (isNaN(val) || !isFinite(val)) return 0;
    // Cap at a reasonable max limit to avoid floating point overflow (e.g. 1,000 Crores)
    return val > 1e12 ? 1e12 : val;
  }

  if (typeof val === "string") {
    // Strip non-numeric characters except decimal point and minus sign
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || !isFinite(parsed)) return 0;
    return parsed > 1e12 ? 1e12 : parsed;
  }

  if (Array.isArray(val)) {
    // If an array is passed, sum valid numeric items cleanly
    return val.reduce((acc, curr) => acc + parseNumericValue(curr), 0);
  }
  if (typeof val === "object") {
    // If an object with a numeric 'value' or 'total' or 'revenue' field is passed
    if ("value" in val) return parseNumericValue(val.value);
    if ("total" in val) return parseNumericValue(val.total);
    if ("revenue" in val) return parseNumericValue(val.revenue);
  }
  return 0;
};

/**
 * Formats a given value into standard Indian Currency (INR, e.g. ₹5,000, ₹1,25,000, ₹0).
 */
export const formatCurrency = (val) => {
  const num = parseNumericValue(val);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch (_) {
    return `₹${Math.round(num).toLocaleString("en-IN")}`;
  }
};
