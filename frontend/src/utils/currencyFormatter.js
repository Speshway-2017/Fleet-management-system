/**
 * Safely parses any value (number, string with currency/commas, array of values, null, undefined)
 * into a valid primitive JavaScript number.
 */
export const parseNumericValue = (val) => {
  if (val === null || val === undefined || val === "") return 0;

  if (typeof val === "number") {
    if (isNaN(val) || !isFinite(val)) return 0;
    // Cap at a reasonable max limit to avoid floating point overflow (e.g. 1,000 Crores)
    return val > 1e15 ? 1e15 : val;
  }

  if (typeof val === "string") {
    // Strip non-numeric characters except decimal point and minus sign
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || !isFinite(parsed)) return 0;
    return parsed > 1e15 ? 1e15 : parsed;
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
 * Formats a given value into compact Indian Currency notation (INR).
 * Examples:
 * - 0 -> "₹0"
 * - 5,000 -> "₹5,000"
 * - 10,00,000 -> "₹10L"
 * - 1,00,00,000 -> "₹1Cr"
 * - 10,00,00,000 -> "₹10Cr"
 * - 100,00,00,000 -> "₹100Cr"
 * - 1500,00,00,000 -> "₹1.5K Cr"
 */
export const formatCompactCurrency = (val) => {
  const num = parseNumericValue(val);
  if (!num || num === 0) return "₹0";

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const prefix = isNegative ? "-₹" : "₹";

  // Crores: >= 1 Crore (1e7 = 1,00,00,000)
  if (absNum >= 1e7) {
    const crores = absNum / 1e7;
    const formatted = crores >= 1000
      ? Math.round(crores).toLocaleString("en-IN")
      : (crores % 1 === 0 ? crores.toFixed(0) : parseFloat(crores.toFixed(2)).toString());
    return `${prefix}${formatted} Cr`;
  }

  // Lakhs: >= 1 Lakh (1e5 = 1,00,000)
  if (absNum >= 1e5) {
    const lakhs = absNum / 1e5;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : parseFloat(lakhs.toFixed(2)).toString();
    return `${prefix}${formatted} L`;
  }

  // Standard numbers (< 1 Lakh)
  return `${prefix}${Math.round(absNum).toLocaleString("en-IN")}`;
};

/**
 * Formats a value into full uncompact Indian Rupee format (e.g., ₹10,00,000).
 */
export const formatFullCurrency = (val) => {
  const num = parseNumericValue(val);
  if (!num || num === 0) return "₹0";

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

/**
 * Main currency formatter for platform components, dashboard cards, reports, and charts.
 * By default uses compact Indian currency notation for large values while preserving ₹0.
 */
export const formatCurrency = (val, options = {}) => {
  if (options && options.full) {
    return formatFullCurrency(val);
  }
  return formatCompactCurrency(val);
};
